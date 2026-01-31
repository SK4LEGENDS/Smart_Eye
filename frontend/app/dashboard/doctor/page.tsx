'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Clock,
    CheckCircle,
    Activity,
    ArrowRight,
    FileText,
    AlertCircle,
    MapPin,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';

interface DoctorDashboardData {
    recent_reports: any[];
    pending_reviews_count: number;
    completed_reviews_count: number;
    total_reports_count: number;
    patient_count: number;
    availability: boolean;
}

export default function DoctorDashboard() {
    const { user, logout } = useAuth();
    const [data, setData] = useState<DoctorDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        if (user?.user_type !== 'doctor') return;
        fetchData();

        // Listen for chatbot tool executions to auto-refresh UI
        const handleChatbotAction = (event: any) => {
            console.log('Chatbot tool executed:', event.detail.tool);
            // Re-fetch dashboard data to sync UI (with small delay to ensure DB consistency)
            setTimeout(() => {
                fetchData();
            }, 500);
        };

        window.addEventListener('chatbot-tool-executed', handleChatbotAction);
        return () => window.removeEventListener('chatbot-tool-executed', handleChatbotAction);
    }, [user]);

    const fetchData = async () => {
        try {
            // Add timestamp to prevent browser caching
            const res = await fetch(`/api/doctor/dashboard?t=${Date.now()}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const result = await res.json();
                setData(result);
                setIsAvailable(result.availability);

                // Proactive Chatbot Trigger
                if (result.pending_reviews_count > 0) {
                    window.dispatchEvent(new CustomEvent('chatbot-proactive-message', {
                        detail: {
                            message: `Welcome back, Dr. ${user?.name}. You have **${result.pending_reviews_count}** pending clinical reviews. \n\nI've indexed the latest guidelines and patient history to assist you. Would you like me to summarize the high-priority cases?`
                        }
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch dashboard', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async () => {
        const newStatus = !isAvailable;
        setIsAvailable(newStatus);
        try {
            const res = await fetch('/api/doctor/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ available: newStatus }),
                credentials: 'include'
            });
            if (!res.ok) setIsAvailable(!newStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            setIsAvailable(!newStatus);
        }
    };

    if (!user) return null;
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="p-8 text-center text-gray-500">Loading dashboard...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar - Simplified to match Patient Dashboard */}
            <nav className="bg-white shadow-sm h-16 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between">
                    <div className="flex items-center">
                        <span className="text-xl font-bold text-blue-600">Smart Eye Care</span>
                        <span className="ml-2 text-[10px] uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-black tracking-wider">Doctor Portal</span>
                    </div>
                    <div className="flex items-center space-x-6 text-gray-700 font-medium">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                            <span className="text-xs text-gray-400 font-black uppercase">Available</span>
                        </div>
                        <span className="text-sm">
                            Welcome, <Link href="/settings" className="hover:text-blue-600 transition-all font-bold">Dr. {user.name}</Link>
                        </span>
                        <button onClick={logout} className="text-red-600 hover:text-red-800 transition-colors font-bold text-sm">Logout</button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Welcome Section - Matches Patient "Patient Dashboard" card */}
                <div className="bg-white rounded-lg shadow-sm p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Doctor Dashboard</h1>
                        <p className="text-gray-500 text-base">Manage your patients and review diagnostic reports</p>
                    </div>

                    {/* Status Toggle Integrated here */}
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center space-x-6">
                        <div>
                            <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">My Status</div>
                            <div className={`text-xs font-black ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                                {isAvailable ? 'AVAILABLE' : 'AWAY'}
                            </div>
                        </div>
                        <button
                            onClick={toggleAvailability}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isAvailable ? 'bg-green-500' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Quick Reports Row - 4 Cards to match patient design */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <DashboardMetricCard
                        label="Patient Reach"
                        title="Total Patients"
                        value={data?.patient_count || 0}
                        color="blue"
                        buttonText="View Directory"
                        link="/dashboard/doctor/patients"
                        icon={Users}
                    />
                    <DashboardMetricCard
                        label="Action Required"
                        title="Pending Reviews"
                        value={data?.pending_reviews_count || 0}
                        color="green"
                        buttonText="Start Reviewing"
                        link="/dashboard/doctor/history?filter=pending"
                        icon={Clock}
                    />
                    <DashboardMetricCard
                        label="Statistics"
                        title="Total Reports"
                        value={data?.total_reports_count || 0}
                        color="cyan"
                        buttonText="View All"
                        link="/dashboard/doctor/history"
                        icon={Activity}
                    />
                    <DashboardMetricCard
                        label="Records"
                        title="Finalized"
                        value={data?.completed_reviews_count || 0}
                        color="yellow"
                        buttonText="Review History"
                        link="/dashboard/doctor/history?filter=finalized"
                        icon={ShieldCheck}
                    />
                </div>

                {/* Recent Assigned Reports Section - Matches "Recent Lab Results" */}
                <div className="bg-blue-600 rounded-t-xl px-8 py-5 flex items-center justify-between">
                    <h2 className="text-white font-black text-xl tracking-tight">Assigned Patient Reports</h2>
                    <div className="flex items-center gap-2 text-blue-100 text-[10px] font-black uppercase tracking-widest">
                        <TrendingUp size={14} />
                        Latest 10 Assignments
                    </div>
                </div>
                <div className="bg-white rounded-b-xl shadow-sm overflow-hidden mb-10">
                    <div className="min-w-full divide-y divide-gray-100">
                        {data?.recent_reports.map((report) => (
                            <div key={report.id} className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 hover:bg-gray-50/50 transition-all border-b border-gray-50 last:border-0 group">
                                <div className="flex items-center space-x-5 mb-4 md:mb-0">
                                    <div className="h-14 w-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-black text-xl ring-4 ring-white shadow-sm overflow-hidden group-hover:ring-blue-50 transition-all">
                                        {report.patient_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{report.patient_name}</h4>
                                            <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-black tracking-widest">#{report.patient_id}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                                                <div className={`w-2 h-2 rounded-full ${report.predicted_class === 'normal' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                                                <span className="uppercase tracking-wider">{report.predicted_class}</span>
                                            </div>
                                            <div className="h-3 w-[1px] bg-gray-200"></div>
                                            <div className="text-xs text-gray-400 font-medium">{new Date(report.timestamp).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-gray-400">
                                        <MapPin size={14} />
                                        {report.lab}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${report.is_visible_to_patient ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                            {report.is_visible_to_patient ? 'Finalized' : 'Pending Review'}
                                        </span>
                                        <Link
                                            href={`/dashboard/doctor/report/${report.id}`}
                                            className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all active:scale-95"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!data?.recent_reports || data.recent_reports.length === 0) && (
                            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                                <AlertCircle size={48} strokeWidth={1} className="mb-4 text-gray-200" />
                                <p className="font-bold text-sm">No recent reports assigned yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Secondary Section - Matches "Upcoming Lab Tests" */}
                <div className="bg-green-700 rounded-t-xl px-8 py-5">
                    <h2 className="text-white font-black text-xl tracking-tight">Recent Clinical Sharing</h2>
                </div>
                <div className="bg-white rounded-b-xl shadow-sm p-8">
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <ShieldCheck size={40} className="mb-4 text-gray-100" />
                        <p className="font-medium text-sm">Patient report visibility and sharing settings.</p>
                        <p className="text-[10px] uppercase font-black tracking-widest mt-2">Manage shared records across the network</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

function DashboardMetricCard({ label, title, value, color, buttonText, link, icon: Icon }: any) {
    const colorMap: any = {
        blue: { border: 'border-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' },
        green: { border: 'border-green-500', text: 'text-green-600', bg: 'bg-green-50' },
        cyan: { border: 'border-cyan-500', text: 'text-cyan-600', bg: 'bg-cyan-50' },
        yellow: { border: 'border-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-50' }
    };

    const theme = colorMap[color] || colorMap.blue;

    return (
        <div className={`bg-white p-7 rounded-xl shadow-sm border-l-4 ${theme.border} relative hover:shadow-md transition-all group`}>
            <div className="flex justify-between items-start mb-4">
                <h3 className={`font-black uppercase text-[10px] tracking-[0.2em] ${theme.text}`}>{label}</h3>
                {Icon && <Icon size={18} className={`${theme.text} opacity-20 group-hover:opacity-100 transition-opacity`} />}
            </div>

            <div className="text-xl font-black text-gray-900 mb-6 tracking-tight">
                {title === 'Pending Reviews' ? (value > 0 ? value : 'All Clear') : value}
            </div>

            <Link
                href={link}
                className={`block w-full text-center py-2.5 px-4 border rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${theme.border} ${theme.text} hover:${theme.bg}`}
            >
                {buttonText}
            </Link>
        </div>
    );
}
