'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    MapPin,
    Calendar,
    ChevronRight,
    ArrowLeft,
    AlertCircle,
    Mail,
    UserCheck,
    Search
} from 'lucide-react';

interface Patient {
    id: number;
    name: string;
    email: string;
    location: string;
    last_report_date: string | null;
}

export default function DoctorPatientsList() {
    const { user } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user?.user_type !== 'doctor') return;

        const fetchPatients = async () => {
            try {
                const res = await fetch('/api/doctor/patients', {
                    credentials: 'include'
                });
                if (res.ok) {
                    const result = await res.json();
                    setPatients(result.patients);
                }
            } catch (error) {
                console.error('Failed to fetch patients', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, [user]);

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toString().includes(searchTerm)
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="p-8 text-center text-gray-500">Loading patient list...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Header / Navbar Parity */}
            <nav className="bg-white shadow-sm h-16 flex items-center mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/doctor" className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-blue-600">
                            <ArrowLeft size={20} />
                        </Link>
                        <span className="text-xl font-bold text-gray-900">Patient Directory</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search patients..."
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
                <div className="bg-white rounded-lg shadow-sm p-8 mb-8 flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Users size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Patients</h1>
                        <p className="text-gray-500 text-base">Comprehensive view of all patients assigned under your medical care.</p>
                    </div>
                </div>

                {/* Directory Content */}
                <div className="bg-blue-600 rounded-t-xl px-8 py-5 flex items-center justify-between">
                    <h2 className="text-white font-black text-xl tracking-tight">Active Patient Records</h2>
                    <div className="flex items-center gap-2 text-blue-100 text-[10px] font-black uppercase tracking-widest">
                        <UserCheck size={14} />
                        {filteredPatients.length} Active Patients
                    </div>
                </div>

                <div className="bg-white rounded-b-xl shadow-sm overflow-hidden border border-gray-100 border-t-0">
                    <div className="min-w-full divide-y divide-gray-100">
                        <AnimatePresence>
                            {filteredPatients.map((patient, idx) => (
                                <motion.div
                                    key={patient.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 hover:bg-gray-50/80 transition-all group"
                                >
                                    <div className="flex items-center space-x-5 mb-4 md:mb-0">
                                        <div className="h-14 w-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-black text-xl ring-4 ring-white shadow-sm overflow-hidden group-hover:ring-blue-50 transition-all">
                                            {patient.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{patient.name}</h4>
                                                <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-black tracking-widest">#{patient.id}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                                                    <Mail size={12} />
                                                    {patient.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Location</span>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                                                <MapPin size={14} className="text-blue-500" />
                                                {patient.location || 'Not Specified'}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Last Activity</span>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                                                <Calendar size={14} className="text-gray-400" />
                                                {patient.last_report_date ? new Date(patient.last_report_date).toLocaleDateString() : 'No Reports Yet'}
                                            </div>
                                        </div>

                                        <Link
                                            href={`/dashboard/doctor/patients/${patient.id}`}
                                            className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            View History <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {(filteredPatients.length === 0 && !searchTerm) && (
                            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                                <AlertCircle size={48} strokeWidth={1} className="mb-4 text-gray-200" />
                                <p className="font-bold text-sm">No patients assigned to your directory yet.</p>
                            </div>
                        )}

                        {(filteredPatients.length === 0 && searchTerm) && (
                            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                                <Search size={48} strokeWidth={1} className="mb-4 text-gray-200" />
                                <p className="font-bold text-sm text-center">No patients found matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
