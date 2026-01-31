'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Clock,
  Bell,
  Shield,
  AlertCircle,
  ChevronLeft,
  Save,
  Lock,
  Smartphone,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUserLocal } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    dob: '',
    gender: '',
    language: 'English',
    timezone: 'UTC',
    notif_email: true,
    notif_sms: false,
    notif_appointments: true,
    notif_reports: true,
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    two_factor_enabled: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        dob: user.dob || '',
        gender: user.gender || '',
        language: user.language || 'English',
        timezone: user.timezone || 'UTC',
        notif_email: user.notif_email ?? true,
        notif_sms: user.notif_sms ?? false,
        notif_appointments: user.notif_appointments ?? true,
        notif_reports: user.notif_reports ?? true,
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_phone: user.emergency_contact_phone || '',
        emergency_contact_relationship: user.emergency_contact_relationship || '',
        two_factor_enabled: user.two_factor_enabled ?? false
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/update_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const result = await res.json();

      if (res.ok) {
        updateUserLocal(result.user);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const backPath = user.user_type === 'patient' ? '/dashboard/patient' :
    user.user_type === 'doctor' ? '/dashboard/doctor' :
      user.user_type === 'lab' ? '/dashboard/lab' :
        user.user_type === 'admin' ? '/dashboard/admin' : '/';

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Clock },
    { id: 'emergency', label: 'Emergency & Safety', icon: AlertCircle },
    { id: 'security', label: 'Account & Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={backPath} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-bold text-sm">
            <ChevronLeft size={18} />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
              {user.name?.charAt(0)}
            </div>
            <span className="text-sm font-bold text-gray-700">{user.name}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Account Settings</h1>
          <p className="text-gray-500 font-medium">Manage your personal information, security preferences, and health alerts.</p>
        </div>

        <AnimatePresence mode="wait">
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-8 p-4 rounded-2xl flex items-center gap-3 border ${message.type === 'success'
                  ? 'bg-green-50 border-green-100 text-green-700'
                  : 'bg-red-50 border-red-100 text-red-700'
                }`}
            >
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              <span className="text-sm font-bold">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-500 hover:bg-white hover:text-gray-900'
                  }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm shadow-gray-200/50">
                {activeTab === 'personal' && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="Full Name" icon={User}>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
                      </InputGroup>
                      <InputGroup label="Email Address" icon={Mail}>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
                      </InputGroup>
                      <InputGroup label="Phone Number" icon={Phone}>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" />
                      </InputGroup>
                      <InputGroup label="Date of Birth" icon={Calendar}>
                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                      </InputGroup>
                      <InputGroup label="Gender" icon={User}>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="appearance-none bg-transparent w-full outline-none">
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not">Prefer not to say</option>
                        </select>
                      </InputGroup>
                      <InputGroup label="Location (City/Region)" icon={MapPin}>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Chennai, India" />
                      </InputGroup>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'preferences' && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-10"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="Language Preference" icon={Globe}>
                        <select name="language" value={formData.language} onChange={handleChange} className="appearance-none bg-transparent w-full outline-none">
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="Tamil">Tamil</option>
                        </select>
                      </InputGroup>
                      <InputGroup label="Time Zone" icon={Clock}>
                        <select name="timezone" value={formData.timezone} onChange={handleChange} className="appearance-none bg-transparent w-full outline-none">
                          <option value="UTC">UTC (GMT +0:00)</option>
                          <option value="IST">IST (GMT +5:30)</option>
                          <option value="EST">EST (GMT -5:00)</option>
                          <option value="PST">PST (GMT -8:00)</option>
                        </select>
                      </InputGroup>
                    </div>

                    <div className="pt-6 border-t border-gray-50">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Bell size={14} className="text-blue-500" /> Notification Preferences
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                        <CheckboxGroup
                          id="notif_email"
                          label="Email Alerts"
                          description="Get emails for account activity."
                          checked={formData.notif_email}
                          onChange={handleChange}
                        />
                        <CheckboxGroup
                          id="notif_sms"
                          label="SMS Alerts"
                          description="Urgent updates via text message."
                          checked={formData.notif_sms}
                          onChange={handleChange}
                        />
                        <CheckboxGroup
                          id="notif_appointments"
                          label="Appointment Reminders"
                          description="Don't miss your consultations."
                          checked={formData.notif_appointments}
                          onChange={handleChange}
                        />
                        <CheckboxGroup
                          id="notif_reports"
                          label="Report Notifications"
                          description="When your health reports are ready."
                          checked={formData.notif_reports}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'emergency' && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4 text-amber-800 mb-4">
                      <AlertCircle size={20} className="flex-shrink-0" />
                      <p className="text-xs font-bold leading-relaxed">
                        In case of emergency, we will use this information to contact your designated person.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="Emergency Contact Name" icon={User}>
                        <input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} placeholder="Relative or Friend" />
                      </InputGroup>
                      <InputGroup label="Emergency Phone" icon={Phone}>
                        <input type="tel" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} placeholder="+1 ..." />
                      </InputGroup>
                      <InputGroup label="Relationship" icon={HelpCircle}>
                        <input type="text" name="emergency_contact_relationship" value={formData.emergency_contact_relationship} onChange={handleChange} placeholder="e.g. Spouse, Parent" />
                      </InputGroup>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-10"
                  >
                    <div className="space-y-6">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Lock size={14} className="text-blue-500" /> Security Controls
                      </h4>
                      <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:border-blue-100 transition-all">
                        <div>
                          <p className="text-sm font-black text-gray-900 mb-1">Passowrd Management</p>
                          <p className="text-xs text-gray-500 font-medium">Update your account password regularly.</p>
                        </div>
                        <button type="button" className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
                          Change Password
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:border-blue-100 transition-all">
                        <div>
                          <p className="text-sm font-black text-gray-900 mb-1">Two-Factor Authentication</p>
                          <p className="text-xs text-gray-500 font-medium">Add an extra layer of security to your account.</p>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="two_factor_enabled"
                            checked={formData.two_factor_enabled}
                            onChange={handleChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Smartphone size={14} className="text-blue-500" /> Active Sessions
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                              <Globe size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">Next.js Web Client</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Current Session • Chennai, India</p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase rounded-full">Active Now</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex justify-end gap-3 p-4 bg-white/50 backdrop-blur-md sticky bottom-6 rounded-3xl border border-white shadow-2xl">
                <button
                  type="button"
                  onClick={() => router.push(backPath)}
                  className="px-6 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                >
                  {isLoading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

function InputGroup({ label, icon: Icon, children }: { label: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative flex items-center group">
        <div className="absolute left-4 text-gray-400 group-focus-within:text-blue-600 transition-colors">
          <Icon size={18} />
        </div>
        <div className="w-full flex items-center bg-gray-50 border border-t-transparent border-x-transparent border-b-gray-100 rounded-2xl focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all px-4 py-3.5 pl-12 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

function CheckboxGroup({ id, label, description, checked, onChange }: { id: string, label: string, description: string, checked: boolean, onChange: (e: any) => void }) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
      <div className="flex items-center h-5 mt-1">
        <input
          id={id}
          name={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 accent-blue-600 cursor-pointer"
        />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{label}</p>
        <p className="text-xs text-gray-500 font-medium">{description}</p>
      </div>
    </label>
  );
}
