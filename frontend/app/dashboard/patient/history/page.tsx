'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Report {
    id: number;
    predicted_class: string;
    timestamp: string;
    lab_verified: boolean;
    image_path: string;
    explanation: string;
    doctor: string;
    lab: string;
}

export default function PatientHistory() {
    const { user } = useAuth();
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.user_type !== 'patient') return;

        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/patient/prediction_history', {
                    credentials: 'include'
                });
                if (res.ok) {
                    const result = await res.json();
                    setReports(result.predictions);
                }
            } catch (error) {
                console.error('Failed to fetch history', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading history...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
                    <Link href="/dashboard/patient" className="text-blue-600 hover:text-blue-800">Back to Dashboard</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="h-48 bg-gray-200 w-full relative">
                                {/* Placeholder for image - integrate real image URL */}
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500">Retinal Image</div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-gray-900">{report.predicted_class.replace('_', ' ')}</h3>
                                    {report.lab_verified ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Verified</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-3">{report.explanation}</p>

                                <div className="flex justify-between text-xs text-gray-400 mt-4 border-t pt-4">
                                    <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                                    <span>{report.lab || 'Auto Analysis'}</span>
                                </div>

                                <button
                                    onClick={() => router.push(`/dashboard/patient/view/${report.id}`)}
                                    className="w-full mt-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-sm font-medium transition-colors"
                                >
                                    View Full Report
                                </button>
                            </div>
                        </div>
                    ))}

                    {reports.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg shadow-sm">
                            No medical records found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
