'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

interface LabDashboardData {
    recent_predictions: any[];
    bookings: any[];
    released_today: number;
}

export default function LabDashboard() {
    const { user, logout } = useAuth();
    const [data, setData] = useState<LabDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.user_type !== 'lab') return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/lab/dashboard', {
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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl text-blue-600">Smart Eye Care</span>
                            <span className="ml-2 text-xs uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Lab Portal</span>
                        </div>
                        <div className="flex items-center space-x-5 text-gray-700 font-medium">
                            <span>
                                <Link href="/settings" className="hover:text-blue-600 transition-colors">{user?.name}</Link> (Lab)
                            </span>
                            <button onClick={logout} className="text-red-600 hover:text-red-800 transition-colors font-medium">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Lab Dashboard</h1>
                        <p className="text-gray-500">Manage samples and verify reports</p>
                    </div>
                    <Link href="/dashboard/lab/analyze" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
                        New Analysis
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                        <div className="text-purple-500 font-bold uppercase text-xs mb-1">Incoming Requests</div>
                        <div className="text-3xl font-bold text-gray-900">{data?.bookings.length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                        <div className="text-green-500 font-bold uppercase text-xs mb-1">Released Today</div>
                        <div className="text-3xl font-bold text-gray-900">{data?.released_today}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                        <div className="text-blue-500 font-bold uppercase text-xs mb-1">Total Analyses</div>
                        <div className="text-3xl font-bold text-gray-900">--</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* New Incoming Requests */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">Incoming Requests</h2>
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {data?.bookings.map((booking) => (
                                <li key={booking.id} className="p-6 hover:bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-medium text-gray-900">{booking.patient_name}</div>
                                            <div className="text-sm text-gray-500">{booking.test_type} - {new Date(booking.date).toLocaleDateString()}</div>
                                        </div>
                                        <Link
                                            href={`/dashboard/lab/analyze?patient_id=${booking.patient_id}&booking_id=${booking.id}`}
                                            className="px-3 py-1 border border-blue-600 text-blue-600 rounded text-sm hover:bg-blue-50"
                                        >
                                            Process
                                        </Link>
                                    </div>
                                </li>
                            ))}
                            {data?.bookings.length === 0 && (
                                <li className="p-6 text-center text-gray-500">No pending requests.</li>
                            )}
                        </ul>
                    </div>

                    {/* Recent Analysis Stream */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                            <Link
                                href="/dashboard/lab/reports"
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                View All Reports →
                            </Link>
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {data?.recent_predictions.map((pred) => (
                                <li key={pred.id} className="p-6 hover:bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start space-x-3">
                                            <div className={`h-2 w-2 mt-2 rounded-full ${pred.lab_verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                            <div>
                                                <div className="font-medium text-gray-900">{pred.patient_name}</div>
                                                <div className="text-sm text-gray-500">{pred.predicted_class} ({(pred.confidence * 100).toFixed(1)}%)</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {!pred.lab_verified && (
                                                <Link href={`/dashboard/lab/verify/${pred.id}`} className="block px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold uppercase hover:bg-yellow-200 mb-1">
                                                    Verify
                                                </Link>
                                            )}
                                            <div className="text-xs text-gray-400">{new Date(pred.timestamp).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {data?.recent_predictions.length === 0 && (
                                <li className="p-6 text-center text-gray-500">No recent analyses.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}
