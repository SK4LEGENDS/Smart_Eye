'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, Box, Maximize2, X, Info } from 'lucide-react';

interface DashboardData {
    current_date: string;
    recent_predictions: any[];
    upcoming_bookings: any[];
}

export default function PatientDashboard() {
    const { user, logout } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (user?.user_type !== 'patient') return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/patient/dashboard', {
                credentials: 'include'
            });
            if (res.ok) {
                const result = await res.json();
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;
    if (loading) return <div className="p-8 text-center text-gray-500">Loading your profile...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl text-blue-600">Smart Eye Care</span>
                        </div>
                        <div className="flex items-center space-x-5 text-gray-700 font-medium">
                            <span>
                                Welcome, <Link href="/settings" className="hover:text-blue-600 transition-colors">{user.name}</Link>
                            </span>
                            <button onClick={logout} className="text-red-600 hover:text-red-800 transition-colors font-medium">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

                {/* Welcome Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
                    <p className="text-gray-500">Your personalized eye care health center</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Card 1: Eye Health Insights - Refined to match standard design */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 relative">
                        <h3 className="text-blue-500 font-bold uppercase text-xs mb-2">Eye Health</h3>
                        <div className="text-2xl font-bold text-gray-900 mb-4">Insights</div>

                        <div className="relative">
                            <button
                                onClick={() => router.push('/dashboard/patient/analysis')}
                                className="block w-full text-center py-2 px-4 border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 text-sm font-medium transition-colors"
                            >
                                View Analysis
                            </button>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                        <h3 className="text-green-500 font-bold uppercase text-xs mb-2">Consultation</h3>
                        <div className="text-2xl font-bold text-gray-900 mb-4">Find Doctor</div>
                        <Link href="/dashboard/patient/doctors" className="block w-full text-center py-2 px-4 border border-green-500 text-green-500 rounded-full hover:bg-green-50 text-sm">Browse Specialists</Link>
                    </div>
                    {/* Card 3 */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-cyan-500">
                        <h3 className="text-cyan-500 font-bold uppercase text-xs mb-2">Upcoming Tests</h3>
                        <div className="text-2xl font-bold text-gray-900 mb-4">{data?.upcoming_bookings.length || 0}</div>
                        <Link href="/dashboard/patient/book" className="block w-full text-center py-2 px-4 border border-cyan-500 text-cyan-500 rounded-full hover:bg-cyan-50 text-sm">Book New Test</Link>
                    </div>
                    {/* Card 4 */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
                        <h3 className="text-yellow-500 font-bold uppercase text-xs mb-2">Records</h3>
                        <div className="text-2xl font-bold text-gray-900 mb-4">Documents</div>
                        <Link href="/dashboard/patient/documents" className="block w-full text-center py-2 px-4 border border-yellow-500 text-yellow-500 rounded-full hover:bg-yellow-50 text-sm">Manage Files</Link>
                    </div>
                </div>

                {/* Recent Results */}
                <div className="bg-blue-600 rounded-t-lg px-6 py-3">
                    <h2 className="text-white font-bold text-lg">Recent Lab Results</h2>
                </div>
                <div className="bg-white rounded-b-lg shadow-sm p-6 mb-8">
                    {data?.recent_predictions.map((pred) => (
                        <div key={pred.id} className="flex items-center justify-between border-b border-gray-100 last:border-0 py-4">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 bg-gray-200 rounded-lg overflow-hidden relative">
                                    {/* In production, use next/image with backend URL */}
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-500">img</div>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">{pred.predicted_class}</h4>
                                    <div className="text-sm text-gray-500">{new Date(pred.timestamp).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push(`/dashboard/patient/view/${pred.id}`)}
                                className="px-4 py-1 rounded-full border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                View
                            </button>
                        </div>
                    ))}
                    {(!data?.recent_predictions || data.recent_predictions.length === 0) && (
                        <p className="text-gray-500 text-center py-4">No recent results found.</p>
                    )}
                </div>

                {/* Upcoming Lab Tests */}
                <div className="bg-green-700 rounded-t-lg px-6 py-3">
                    <h2 className="text-white font-bold text-lg">Upcoming Lab Tests</h2>
                </div>
                <div className="bg-white rounded-b-lg shadow-sm p-6">
                    {data?.upcoming_bookings.map((booking) => (
                        <div key={booking.id} className="flex justify-between items-center border-b border-gray-100 last:border-0 py-4">
                            <div>
                                <h4 className="font-bold text-gray-900">{booking.lab || 'Lab Center'}</h4>
                                <div className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()}</div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase">{booking.status}</span>
                        </div>
                    ))}
                    {(!data?.upcoming_bookings || data.upcoming_bookings.length === 0) && (
                        <div className="text-center py-6">
                            <p className="text-gray-500">No upcoming tests scheduled.</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
