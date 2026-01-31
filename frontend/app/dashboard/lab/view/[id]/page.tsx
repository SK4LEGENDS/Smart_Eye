'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, FileText, User, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ReportViewPage() {
    const { user } = useAuth();
    const { id } = useParams();
    const router = useRouter();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || (user.user_type !== 'lab' && user.user_type !== 'admin')) return;

        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/lab/report_view/${id}`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setReport(data.report);
                }
            } catch (error) {
                console.error('Failed to fetch report', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id, user]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading report...</div>;
    if (!report) return <div className="p-8 text-center text-gray-500">Report not found.</div>;

    const backPath = user?.user_type === 'admin' ? '/dashboard/admin/reports' : '/dashboard/lab/reports';

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href={backPath}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors mb-4"
                    >
                        <ChevronLeft size={16} className="mr-1" />
                        Back to All Reports
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Report Details</h1>
                            <p className="text-gray-500 mt-1">
                                {user?.user_type === 'admin' ? 'Global administrative view' : 'Read-only view with doctor annotations'}
                            </p>
                        </div>
                        <div className={`${user?.user_type === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'} px-4 py-2 rounded-full text-sm font-bold`}>
                            {user?.user_type === 'admin' ? 'Admin Review' : 'Lab Review'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Image & AI Analysis */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Retinal Image with Doctor Annotations */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                                <h3 className="font-bold text-gray-900">
                                    {report.annotated_image_path ? 'Retinal Scan (with Doctor Annotations)' : 'Retinal Scan'}
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="bg-black rounded-lg overflow-hidden relative">
                                    {report.annotated_image_path ? (
                                        // Show annotated image if available
                                        <div className="relative">
                                            <img
                                                src={`/api/static/uploads/${report.image_path}`}
                                                alt="Original retinal scan"
                                                className="w-full h-96 object-contain"
                                            />
                                            <img
                                                src={`/api/static/uploads/${report.annotated_image_path}`}
                                                alt="Doctor annotations"
                                                className="absolute top-0 left-0 w-full h-96 object-contain"
                                            />
                                        </div>
                                    ) : report.image_path ? (
                                        <img
                                            src={`/api/static/uploads/${report.image_path}`}
                                            alt="Retinal scan"
                                            className="w-full h-96 object-contain"
                                        />
                                    ) : (
                                        <div className="h-96 flex items-center justify-center">
                                            <span className="text-gray-400">Image not available</span>
                                        </div>
                                    )}
                                </div>
                                {report.annotated_image_path && (
                                    <div className="mt-2 text-xs text-purple-600 flex items-center">
                                        <FileText size={14} className="mr-1" />
                                        Doctor has annotated this image
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Analysis Results */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-blue-100 px-6 py-3 border-b border-blue-200">
                                <h3 className="font-bold text-blue-900">AI Analysis Results</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Prediction</div>
                                        <div className="text-2xl font-bold text-blue-600 capitalize">{report.predicted_class}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Confidence</div>
                                        <div className="text-2xl font-bold text-blue-600">{(report.confidence * 100).toFixed(1)}%</div>
                                    </div>
                                </div>

                                {report.explanation && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-2">AI Explanation</div>
                                        <p className="text-gray-700 text-sm leading-relaxed">{report.explanation}</p>
                                    </div>
                                )}

                                {report.recommendation && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-2">AI Recommendation</div>
                                        <p className="text-gray-700 text-sm leading-relaxed">{report.recommendation}</p>
                                    </div>
                                )}

                                {report.image_quality && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-2">Image Quality</div>
                                        <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">
                                            {report.image_quality}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Patient Info & Workflow Info */}
                    <div className="space-y-6">
                        {/* Patient Information */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-purple-100 px-6 py-3 border-b border-purple-200">
                                <div className="flex items-center">
                                    <User size={18} className="text-purple-700 mr-2" />
                                    <h3 className="font-bold text-purple-900">Patient Information</h3>
                                </div>
                            </div>
                            <div className="p-6 space-y-3">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Name</div>
                                    <div className="text-gray-900 font-medium">{report.patient_name}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Patient ID</div>
                                    <div className="text-gray-700">#{report.patient_id}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Report Date</div>
                                    <div className="text-gray-700 flex items-center">
                                        <Calendar size={14} className="mr-1" />
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Verification Status</div>
                                    <div className="text-gray-700">
                                        {report.lab_verified ? (
                                            <span className="text-green-600 font-bold">✓ Verified by Lab</span>
                                        ) : (
                                            <span className="text-yellow-600 font-bold">⏳ Pending Verification</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Doctor Review Section */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-green-100 px-6 py-3 border-b border-green-200">
                                <div className="flex items-center">
                                    <FileText size={18} className="text-green-700 mr-2" />
                                    <h3 className="font-bold text-green-900">Doctor Review</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                {report.doctor_name ? (
                                    <>
                                        <div className="mb-4">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Assigned Doctor</div>
                                            <div className="text-gray-900 font-medium">Dr. {report.doctor_name}</div>
                                        </div>

                                        {report.doctor_notes ? (
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase font-bold mb-2">Clinical Notes</div>
                                                <div className="bg-gray-50 p-3 rounded border border-gray-200 text-gray-700 text-sm whitespace-pre-wrap">
                                                    {report.doctor_notes}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500 italic">No clinical notes added yet</div>
                                        )}

                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Patient Access</div>
                                            <div className="text-sm">
                                                {report.is_visible_to_patient ? (
                                                    <span className="text-green-600 font-bold">✓ Shared with patient</span>
                                                ) : (
                                                    <span className="text-gray-500">Not shared yet (Draft)</span>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-sm text-gray-500 italic">No doctor assigned yet</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
