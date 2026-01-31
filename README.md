# 👁️ Smart Eye Care: AI-Powered Retinal Health System

A comprehensive, research-grade ophthalmology platform integrating **Deep Learning (Ensemble Models)**, **RAG-powered AI Assistance**, and **Role-Specific Clinical Dashboards**.

---

## 🚀 Core Features

### 🧠 Advanced AI Diagnostics
- **Dual-Model Ensemble**: Combines **AlexNet** and **ResNet50** for high-accuracy classification of 6 retinal conditions (Cataract, Diabetic Retinopathy, Glaucoma, etc.).
- **Explainable AI (Grad-CAM)**: Generates heatmaps to highlight exactly where the AI "sees" disease markers, enhancing clinical trust.
- **Uncertainty Quantification**: AI provides confidence scores to ensure safe screening.

### 🤖 Agent-C (C3-RAG Assistant)
- **Clinical Chatbot**: Powered by Llama-3.1 and a **Retrieval-Augmented Generation (RAG)** engine using medical guidelines.
- **Action-Aware**: Doctors can change their availability or view histories via natural language commands.
- **Real-Time Sync**: Agent-controlled actions trigger immediate UI updates on the dashboard.

### 🏥 Role-Specific Portals
- **Patient Dashboard**: View AI reports, track appointment history, and book lab tests.
- **Doctor Portal**: Manage schedules, accept/reject appointments, and review detailed diagnostic finding with AI heatmaps.
- **Lab Technician Interface**: High-throughput retinal scan processing and verification.

---

## 🛠️ Tech Stack

- **Backend**: Python (Flask), SQLAlchemy, SQLite
- **AI/ML**: PyTorch (AlexNet, ResNet50), Scipy
- **Frontend**: Next.js, Tailwind CSS, Framer Motion
- **Knowledge Base**: Groq/HuggingFace API, Custom RAG Implementation
- **Remote Access**: DuckDNS & ngrok integration

---

## 💻 Getting Started

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/SK4LEGENDS/Smart_Eye.git
cd Smart_Eye

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Variables
To enable AI features, add your Hugging Face or Groq tokens to a `.env` file or `config.py`:
- `HF_TOKEN`: Your HuggingFace API Token.
- `DUCKDNS_TOKEN`: For permanent external access.

---

## 👥 Meet the Team
**Smart Eye Care** is developed with passion by:
- **Jayaharini**
- **Kailash**
- **Jerlin John**

---

## 📜 Disclaimer
*This system is designed for screening and "Clinical Decision Support." It is intended for research and educational purposes and should not replace professional medical diagnosis.*
