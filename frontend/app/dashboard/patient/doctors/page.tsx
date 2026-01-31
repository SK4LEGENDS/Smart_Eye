'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    MapPin,
    Building2,
    Star,
    Filter,
    ArrowRight,
    ChevronLeft,
    Loader2,
    User,
    Activity,
    X,
    Sparkles,
    Stethoscope,
    Phone,
    Map
} from 'lucide-react';

interface Doctor {
    id: number;
    name: string;
    specialist: string;
    clinic_name: string;
    location: string;
    available: boolean;
}

export default function PatientDoctors() {
    const { user, logout } = useAuth();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (user?.user_type !== 'patient') return;

        const fetchDoctors = async () => {
            try {
                const res = await fetch('/api/patient/doctors', {
                    credentials: 'include'
                });
                if (res.ok) {
                    const result = await res.json();
                    setDoctors(result.doctors || []);
                }
            } catch (error) {
                console.error('Failed to fetch doctors', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, [user]);

    const filteredDoctors = doctors.filter(doctor => {
        const name = (doctor.name || '').toLowerCase();
        const specialist = (doctor.specialist || '').toLowerCase();
        const clinic = (doctor.clinic_name || '').toLowerCase();
        const query = searchQuery.toLowerCase();

        const matchesSearch =
            name.includes(query) ||
            specialist.includes(query) ||
            clinic.includes(query);

        const matchesFilter = filter === 'all' || specialist.includes(filter.toLowerCase());

        return matchesSearch && matchesFilter;
    });

    const specialties = ['all', 'glaucoma', 'cataract', 'retina', 'diabetic_retinopathy'];

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                <p className="text-gray-500 font-medium">Scanning for Specialists...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl text-blue-600 font-bold">Smart Eye Care</span>
                        </div>
                        <div className="flex items-center space-x-5 text-gray-700 font-medium">
                            <span className="text-sm">
                                Welcome, <Link href="/settings" className="hover:text-blue-600 transition-colors font-bold">{user?.name}</Link>
                            </span>
                            <button onClick={logout} className="text-red-600 hover:text-red-800 transition-colors font-bold text-sm">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm p-8 mb-8 relative overflow-hidden border border-gray-100"
                >
                    <div className="relative z-10">
                        <Link href="/dashboard/patient" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors mb-6 text-sm font-bold group">
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </Link>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Ocular Specialist Discovery</h1>
                                <p className="text-gray-500 max-w-xl leading-relaxed font-medium">
                                    Connect with world-class ophthalmologists and retinal specialists. Start your journey to clearer vision today.
                                </p>
                            </div>
                            <div className="flex-shrink-0 w-full md:w-auto">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search name, clinic, specialty..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-11 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-green-500/10 focus:border-green-500 outline-none w-full md:w-[320px] transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quick Filters */}
                        <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 no-scrollbar">
                            <div className="flex items-center gap-2 text-gray-400 mr-2 border-r border-gray-100 pr-4">
                                <Filter size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Filters</span>
                            </div>
                            {specialties.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilter(s)}
                                    className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${filter === s
                                        ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                                        : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 hover:border-green-200'
                                        }`}
                                >
                                    {s.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                        <Stethoscope size={160} className="text-green-600" />
                    </div>
                </motion.div>

                {/* Status bar */}
                <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Available Specialists ({filteredDoctors.length})</h2>
                </div>

                <AnimatePresence mode="popLayout">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDoctors.map((doctor, idx) => (
                            <motion.div
                                key={doctor.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-white p-6 rounded-[32px] border border-gray-100 border-l-4 border-l-green-500 hover:shadow-xl hover:shadow-green-900/5 transition-all flex flex-col relative overflow-hidden"
                            >
                                <div className="flex items-center gap-6 mb-6 mt-2">
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl flex items-center justify-center text-green-600 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                            <User size={40} strokeWidth={1.5} />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-50">
                                            <Star size={12} className="fill-green-500 text-green-500" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-2xl font-black text-gray-900 leading-tight truncate">Dr. {doctor.name}</h3>
                                        <div className="text-green-600 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                            <Activity size={12} /> {(doctor.specialist || 'Ophthalmologist').replace('_', ' ')}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-10 flex-1">
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-50 group-hover:bg-white group-hover:border-green-100 transition-all">
                                        <div className="p-2.5 bg-white rounded-xl text-gray-400 group-hover:text-green-600 shadow-sm transition-colors border border-gray-100">
                                            <Building2 size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Clinic Center</p>
                                            <p className="text-sm font-bold text-gray-700 truncate">{doctor.clinic_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-50 group-hover:bg-white group-hover:border-green-100 transition-all">
                                        <div className="p-2.5 bg-white rounded-xl text-gray-400 group-hover:text-emerald-600 shadow-sm transition-colors border border-gray-100">
                                            <MapPin size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Primary Location</p>
                                            <p className="text-sm font-bold text-gray-700 truncate">{doctor.location}</p>
                                        </div>
                                    </div>
                                </div>

                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>

                {filteredDoctors.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-32 text-center"
                    >
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-8 group">
                            <Search size={48} className="group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-2 font-sans">No Specialists Found</h3>
                        <p className="text-sm text-gray-500 max-w-sm font-medium leading-relaxed">We couldn't find any world-class doctors matching your specific filter criteria or search query.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setFilter('all'); }}
                            className="mt-8 px-8 py-4 bg-white border border-gray-200 text-green-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                        >
                            Reset Search Filters
                        </button>
                    </motion.div>
                )}

                <div className="mt-16 p-8 bg-green-50 rounded-3xl border border-green-100 flex gap-6 items-start max-w-4xl">
                    <div className="p-3 bg-green-100 rounded-2xl text-green-600 mt-1 shadow-sm">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h4 className="font-black text-green-900 text-sm mb-2 uppercase tracking-wide">Elite Healthcare Network</h4>
                        <p className="text-green-700/80 text-xs leading-relaxed font-medium">
                            All specialists on the Smart Eye Care platform are verified professionals with board certification in ophthalmology. Book with confidence knowing you're in expert hands.
                        </p>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
