import json
import requests
import re
from flask_login import current_user
from models import db, User, Prediction, LabBooking, Appointment
from config import Config
import logging
from datetime import datetime

class ChatService:
    def __init__(self):
        self.api_key = Config.GROQ_API_KEY
        self.api_url = getattr(Config, 'LLM_API_URL', "https://openrouter.ai/api/v1/chat/completions")
        self.model = Config.LLM_MODEL
        self.logger = logging.getLogger(__name__)

    def _get_system_prompt(self, user):
        """Generates a role-specific system prompt with context."""
        base_prompt = "You are 'Agent-C', the AI Assistant for the Smart Eye Care platform."
        
        tool_format_instruction = """
### CRITICAL: SYSTEM TOOL EXECUTION
If the user asks you to perform an action, you MUST include a tool call.
Use this format at the end of your response:
[[TOOL: {"tool": "tool_name", "kwargs": {"param": "value"}}]]

Example: "I've updated your status. [[TOOL: {"tool": "toggle_availability", "kwargs": {"status": "Away"}}]]"
IMPORTANT: ALWAYS use the [[TOOL: ...]] format.
"""

        if user is None:
            return f"{base_prompt}\n\nMANDATORY: Mention Smart Eye Care team: Jayaharini, Kailash, Jerlin John.\n\n{tool_format_instruction}"
        
        elif user.user_type == 'patient':
            return f"{base_prompt} You are assisting {user.name}, a patient.\n\nTOOLS: book_appointment(doctor_id), view_my_reports().\n\n{tool_format_instruction}"
        
        elif user.user_type == 'doctor':
            return f"""{base_prompt} You are assisting Dr. {user.name}.
            
            **TRANSITION TOOLS:**
            - `toggle_availability(status)`: status is 'Available' or 'Away'.
            - `view_pending_appointments()`.
            
            {tool_format_instruction}
            """
        
        return base_prompt

    def _get_tools_for_user(self, user):
        tools = {}
        if not user: return tools
        if user.user_type == 'patient':
            tools.update({
                'book_appointment': self._tool_book_appointment,
                'view_my_reports': self._tool_view_my_reports,
                'view_my_appointments': self._tool_view_my_appointments
            })
        elif user.user_type == 'doctor':
            tools.update({
                'toggle_availability': self._tool_toggle_availability,
                'view_pending_appointments': self._tool_view_pending_appointments
            })
        return tools

    def _execute_tool(self, user, tool_name, kwargs):
        self.logger.info(f"DEBUG: Attempting tool {tool_name} for user {user.id}")
        tools = self._get_tools_for_user(user)
        if tool_name not in tools:
            return f"❌ Tool '{tool_name}' not available."
        
        try:
            # Explicitly pass user if needed or use session
            return tools[tool_name](user, **kwargs)
        except Exception as e:
            self.logger.error(f"DEBUG: Tool Error: {e}")
            return f"❌ Error: {str(e)}"

    # --- TOOL IMPLEMENTATIONS (Now taking 'user' as first arg) ---
    def _tool_toggle_availability(self, user, status):
        status = status.lower()
        if status in ['available', 'online', 'active']:
            user.available = True
            db.session.commit()
            return "SUCCESS: Marked as AVAILABLE 🟢"
        elif status in ['away', 'busy', 'offline', 'unavailable']:
            user.available = False
            db.session.commit()
            return "SUCCESS: Marked as AWAY 🔴"
        return f"INVALID status: {status}"

    def _tool_view_my_appointments(self, user):
        from models import Appointment
        apts = Appointment.query.filter_by(patient_id=user.id).order_by(Appointment.date.desc()).all()
        if not apts: return "You have no appointments."
        return "📅 Appointments: " + ", ".join([f"Dr. {User.query.get(a.doctor_id).name} (#{a.id})" for a in apts])

    def _tool_view_my_reports(self, user):
        reps = Prediction.query.filter_by(patient_id=user.id, is_visible_to_patient=True).all()
        if not reps: return "No reports visible yet."
        return "📊 Reports: " + ", ".join([f"{r.predicted_class} (#{r.id})" for r in reps])

    def _tool_book_appointment(self, user, doctor_id):
        from datetime import date
        from models import Appointment
        apt = Appointment(patient_id=user.id, doctor_id=int(doctor_id), date=date.today(), status='pending')
        db.session.add(apt)
        db.session.commit()
        return f"✅ Appointment #{apt.id} requested with Doctor ID {doctor_id}."

    def _tool_book_lab_test(self, user, date, time_slot, visit_reason):
        from datetime import datetime
        booking = LabBooking(patient_id=user.id, date=datetime.strptime(date, '%Y-%m-%d').date(), time_slot=time_slot, visit_reason=visit_reason, status='pending', test_type='Retinal Scan')
        db.session.add(booking)
        db.session.commit()
        return f"✅ Lab test #{booking.id} booked for {date}."

    def _tool_cancel_appointment(self, user, appointment_id):
        from models import Appointment
        apt = Appointment.query.get(int(appointment_id))
        if apt and apt.patient_id == user.id:
            apt.status = 'cancelled'
            db.session.commit()
            return f"❌ Appointment #{appointment_id} cancelled."
        return "Command failed: Appointment not found or restricted."

    def _tool_view_pending_appointments(self, user):
        from models import Appointment
        apts = Appointment.query.filter_by(doctor_id=user.id, status='pending').all()
        if not apts: return "You have no pending appointments."
        return "⏳ Pending: " + ", ".join([f"#{a.id}" for a in apts])

    def _tool_accept_appointment(self, user, appointment_id):
        from models import Appointment
        apt = Appointment.query.get(int(appointment_id))
        if apt and apt.doctor_id == user.id:
            apt.status = 'accepted'
            db.session.commit()
            return f"✅ Accepted Appointment #{appointment_id}"
        return "Failed: Invalid Appointment ID."

    def _tool_view_my_schedule(self, user, date=None):
        from datetime import date as dt_date
        from models import Appointment
        d = dt_date.today()
        apts = Appointment.query.filter_by(doctor_id=user.id, status='accepted', date=d).all()
        return f"📅 Today's Schedule: {len(apts)} appointments confirmed."

    def _tool_view_patient_history(self, user, patient_id):
        reports = Prediction.query.filter_by(patient_id=int(patient_id)).order_by(Prediction.timestamp.desc()).limit(5).all()
        if not reports: return "No history found for this patient."
        return f"📋 History: Last 5 findings found."

    def _tool_share_report(self, user, report_id):
        r = Prediction.query.get(int(report_id))
        if r:
            r.is_visible_to_patient = True
            db.session.commit()
            return f"👁️ Shared Report #{report_id} with patient."
        return "Error: Report not found."

    def _tool_search_documents(self, user, query):
        return "🔍 Search feature is currently undergoing maintenance."

    def process_message(self, user, user_message, history=[]):
        system_prompt = self._get_system_prompt(user)
        
        # RAG
        from rag_service import rag_service
        try:
            rag_res = rag_service.retrieve(user_message, k=1)
            if rag_res: system_prompt += f"\n\nCONTEXT: {rag_res[0]['content'][:200]}"
        except: pass

        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(history[-5:])
        messages.append({"role": "user", "content": user_message})

        try:
            resp = requests.post(self.api_url, headers={"Authorization": f"Bearer {self.api_key}"}, json={"model": self.model, "messages": messages, "temperature": 0.0})
            ai_content = resp.json()['choices'][0]['message']['content']
            
            # --- OMNI PARSER ---
            tool_found = None
            tool_kwargs = {}
            
            # 1. JSON Search
            json_search = re.search(r'\[\[TOOL:\s*(.*?)\s*\]\]', ai_content, re.DOTALL)
            if json_search:
                try:
                    data = json.loads(json_search.group(1))
                    tool_found = data.get("tool")
                    tool_kwargs = data.get("kwargs", {})
                except: pass

            # 2. Text Search (Aggressive)
            if not tool_found:
                # Look for patterns like toggle_availability(status="...")
                func_search = re.search(r'(\w+)\((.*?)\)', ai_content)
                if func_search:
                    tool_found = func_search.group(1)
                    args_str = func_search.group(2)
                    for k, v in re.findall(r'(\w+)=[\'"]?([^\'",)]+)[\'"]?', args_str):
                        tool_kwargs[k] = v

            # 3. Keyword heuristic if still not found (THE ULTIMATE SAFETY NET)
            if not tool_found and user and user.user_type == 'doctor':
                content_lower = ai_content.lower()
                # If the AI even mentions "status" and one of the states, we trigger.
                if "status" in content_lower or "marked" in content_lower or "set to" in content_lower:
                    if any(x in content_lower for x in ["away", "unavailable", "offline", "busy"]):
                        tool_found = "toggle_availability"
                        tool_kwargs = {"status": "Away"}
                    elif any(x in content_lower for x in ["available", "online", "active", "online"]):
                        tool_found = "toggle_availability"
                        tool_kwargs = {"status": "Available"}

            if tool_found:
                outcome = self._execute_tool(user, tool_found, tool_kwargs)
                # Cleanup: remove formal tags and pseudo-calls from the public response
                clean_response = re.sub(r'\[\[TOOL:.*?\]\]|\w+\(.*?\)', '', ai_content, flags=re.DOTALL).strip()
                if not clean_response: clean_response = "Done."
                
                return {
                    "response": f"{clean_response}\n\n**Action Outcome**: {outcome}",
                    "action_taken": True,
                    "tool": tool_found
                }

            return {"response": ai_content, "action_taken": False}

        except Exception as e:
            self.logger.error(f"Chat Error: {e}")
            return {"response": "I'm having trouble connecting to the AI system."}
