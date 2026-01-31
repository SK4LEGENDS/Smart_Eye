'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

interface AdminStats {
    patient_count: number;
    doctor_count: number;
    lab_count: number;
    prediction_count: number;
    appointment_count: number;
}

interface RecentPrediction {
    id: number;
    patient_name: string;
    predicted_class: string;
    timestamp: string;
    lab: string;
    lab_verified: boolean;
}

interface DashboardData {
    stats: AdminStats;
    recent_predictions: RecentPrediction[];
}

export default function AdminDashboard() {
    const { isLoading } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/dashboard', {
                    credentials: 'include'
                });
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                } else {
                    const txt = await res.text();
                    setErrorMsg(`Fetch Error: ${res.status} ${res.statusText} - ${txt}`);
                }
            } catch (error: any) {
                console.error('Failed to fetch dashboard', error);
                setErrorMsg(`Network Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Loading system overview...</p>
        </div>
    );

    if (errorMsg) return (
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-red-700">
            <h2 className="font-bold text-lg mb-2">Error loading dashboard</h2>
            <p>{errorMsg}</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
                    <p className="text-gray-500">Current status across all facilities</p>
                </div>
                <div className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium">
                    Updated today at {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Total Patients" value={data?.stats.patient_count} color="blue" description="Registered patients" />
                <StatCard title="Doctors" value={data?.stats.doctor_count} color="green" description="Verified specialists" />
                <StatCard title="Labs" value={data?.stats.lab_count} color="purple" description="Processing centers" />
                <StatCard title="Total Reports" value={data?.stats.prediction_count} color="indigo" description="AI analyses" />
                <StatCard title="Appointments" value={data?.stats.appointment_count} color="yellow" description="Upcoming visits" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Recent System Activity</h2>
                    <Link href="/dashboard/admin/reports" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View All Reports →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data?.recent_predictions.map((pred) => (
                                <tr key={pred.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pred.patient_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{pred.predicted_class}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pred.lab}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(pred.timestamp).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {pred.lab_verified ? (
                                            <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Verified</span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {data?.recent_predictions.length === 0 && (
                    <div className="p-12 text-center text-gray-500 italic">
                        No recent activity recorded.
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, color, description }: { title: string, value: number | undefined, color: string, description: string }) {
    const colorClasses: any = {
        blue: 'border-blue-500 text-blue-600 bg-blue-50',
        green: 'border-green-500 text-green-600 bg-green-50',
        purple: 'border-purple-500 text-purple-600 bg-purple-50',
        indigo: 'border-indigo-500 text-indigo-600 bg-indigo-50',
        yellow: 'border-yellow-500 text-yellow-600 bg-yellow-50',
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</div>
                <div className={`h-2 w-2 rounded-full ${colorClasses[color]?.split(' ')[0]}`}></div>
            </div>
            <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-gray-900">{value ?? '-'}</div>
                <div className="text-xs text-gray-400 font-medium">{description}</div>
            </div>
        </div>
    );
}
