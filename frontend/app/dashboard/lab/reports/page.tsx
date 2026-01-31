'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { ChevronLeft, FileText, CheckCircle } from 'lucide-react';

export default function LabAllReports() {
    const { user } = useAuth();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');

    useEffect(() => {
        if (user?.user_type !== 'lab') return;
        fetchReports();
    }, [user]);

    const fetchReports = async () => {
        try {
            const res = await fetch('/api/lab/all_reports', {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setReports(data.reports || []);
            }
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(r => {
        if (filter === 'verified') return r.lab_verified;
        if (filter === 'pending') return !r.lab_verified;
        return true;
    });

    if (loading) return <div className="p-8 text-center text-gray-500">Loading reports...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/dashboard/lab"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors mb-4"
                    >
                        <ChevronLeft size={16} className="mr-1" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">All Reports</h1>
                            <p className="text-gray-500 mt-1">Complete analysis history</p>
                        </div>
                        <div className="text-sm text-gray-600">
                            Total: <span className="font-bold">{reports.length}</span> reports
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-md font-medium ${filter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All Reports ({reports.length})
                        </button>
                        <button
                            onClick={() => setFilter('verified')}
                            className={`px-4 py-2 rounded-md font-medium ${filter === 'verified'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Verified ({reports.filter(r => r.lab_verified).length})
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-2 rounded-md font-medium ${filter === 'pending'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Pending ({reports.filter(r => !r.lab_verified).length})
                        </button>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{report.patient_name}</div>
                                        <div className="text-xs text-gray-500">ID: #{report.patient_id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                                            {report.predicted_class}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {(report.confidence * 100).toFixed(1)}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {report.doctor_name ? (
                                            <div>
                                                <div className="text-gray-900">Dr. {report.doctor_name}</div>
                                                {report.doctor_notes && (
                                                    <div className="flex items-center text-xs text-purple-600">
                                                        <FileText size={12} className="mr-1" />
                                                        Has notes
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">Not assigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(report.timestamp).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {report.lab_verified ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold text-green-700 bg-green-100">
                                                <CheckCircle size={12} className="mr-1" />
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2 py-1 rounded text-xs font-bold text-yellow-700 bg-yellow-100">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/dashboard/lab/view/${report.id}`}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredReports.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            No reports found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
