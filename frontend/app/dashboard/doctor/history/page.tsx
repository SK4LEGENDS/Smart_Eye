'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Activity,
    ShieldCheck,
    ArrowLeft,
    Search,
    Filter,
    CheckCircle,
    Clock,
    ChevronRight,
    AlertCircle,
    TrendingUp,
    MapPin
} from 'lucide-react';

interface Report {
    id: number;
    patient_name: string;
    patient_id: number;
    predicted_class: string;
    timestamp: string;
    lab: string;
    is_visible_to_patient: boolean;
    image_path: string;
}

function HistoryPageContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const initialFilter = searchParams.get('filter') || 'all';

    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState(initialFilter);

    useEffect(() => {
        if (user?.user_type !== 'doctor') return;
        fetchReports();
    }, [user, activeFilter]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const statusParam = activeFilter !== 'all' ? `?status=${activeFilter}` : '';
            const res = await fetch(`/api/doctor/reports${statusParam}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const result = await res.json();
                setReports(result.reports);
            }
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(r =>
        r.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toString().includes(searchTerm)
    );

    const themeMap: any = {
        all: {
            color: 'cyan',
            headerBg: 'bg-cyan-600',
            text: 'text-cyan-600',
            bg: 'bg-cyan-50',
            border: 'border-cyan-100',
            accent: 'text-cyan-100',
            icon: Activity
        },
        pending: {
            color: 'green',
            headerBg: 'bg-green-600',
            text: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-100',
            accent: 'text-green-100',
            icon: Clock
        },
        finalized: {
            color: 'yellow',
            headerBg: 'bg-yellow-600',
            text: 'text-yellow-600',
            bg: 'bg-yellow-50',
            border: 'border-yellow-100',
            accent: 'text-yellow-100',
            icon: ShieldCheck
        }
    };

    const currentTheme = themeMap[activeFilter] || themeMap.all;

    if (loading && reports.length === 0) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Clinical History...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Header / Navbar Parity */}
            <nav className="bg-white shadow-sm h-16 flex items-center mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/doctor" className={`p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:${currentTheme.text}`}>
                            <ArrowLeft size={20} />
                        </Link>
                        <span className="text-xl font-bold text-gray-900">Clinical History</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all w-64"
                            />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Card Section */}
                <div className="bg-white rounded-lg shadow-sm p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 ${currentTheme.bg} ${currentTheme.text} rounded-2xl flex items-center justify-center`}>
                            <currentTheme.icon size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Report Statistics</h1>
                            <p className="text-gray-500 text-base">Full medical history and diagnostic archives.</p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center">
                        {['all', 'pending', 'finalized'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === filter
                                    ? `bg-white ${themeMap[filter].text} shadow-sm`
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Directory Content */}
                <div className={`${currentTheme.headerBg} rounded-t-xl px-8 py-5 flex items-center justify-between transition-colors duration-500`}>
                    <h2 className="text-white font-black text-xl tracking-tight">Clinical Archivies</h2>
                    <div className={`flex items-center gap-2 ${currentTheme.accent} text-[10px] font-black uppercase tracking-widest`}>
                        <TrendingUp size={14} />
                        {filteredReports.length} {activeFilter} Records
                    </div>
                </div>

                <div className={`bg-white rounded-b-xl shadow-sm overflow-hidden border ${currentTheme.border} border-t-0`}>
                    <div className="min-w-full divide-y divide-gray-100">
                        <AnimatePresence mode="popLayout">
                            {filteredReports.map((report, idx) => (
                                <motion.div
                                    key={report.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 hover:bg-gray-50/80 transition-all group"
                                >
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
                                                <div className="text-xs text-gray-400 font-medium">#{report.id} • {new Date(report.timestamp).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                                        <div className="hidden lg:flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Origin</span>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                                                <MapPin size={14} className="text-blue-500" />
                                                {report.lab}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Medical Status</span>
                                            <div className="flex items-center gap-2">
                                                {report.is_visible_to_patient ? (
                                                    <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">
                                                        <CheckCircle size={12} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Finalized</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100">
                                                        <Clock size={12} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Review Required</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Link
                                            href={`/dashboard/doctor/report/${report.id}`}
                                            className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            View Analysis <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredReports.length === 0 && (
                            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                                <AlertCircle size={48} strokeWidth={1} className="mb-4 text-gray-200" />
                                <p className="font-bold text-sm">No clinical reports found for this selection.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function DoctorHistoryPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Clinical Archives...</div>}>
            <HistoryPageContent />
        </Suspense>
    );
}
