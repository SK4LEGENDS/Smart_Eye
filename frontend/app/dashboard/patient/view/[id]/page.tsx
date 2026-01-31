'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, FileText, User, Calendar, ShieldCheck, Activity, Info, CameraOff } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PatientReportViewPage() {
    const { user } = useAuth();
    const { id } = useParams();
    const router = useRouter();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user || user.user_type !== 'patient') return;

        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/patient/prediction_detail/${id}`, {
                    credentials: 'include'
                });

                const contentType = res.headers.get("content-type");
                if (res.ok && contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    setReport(data.report);

                    // Proactive Chatbot Trigger
                    if (data.report && data.report.confidence) {
                        const confidence = (data.report.confidence * 100).toFixed(1);
                        window.dispatchEvent(new CustomEvent('chatbot-proactive-message', {
                            detail: {
                                message: `Hello! I see you're looking at your latest AI analysis for **${data.report.predicted_class}**. \n\nThe model is **${confidence}%** confident in this finding. Would you like me to explain what this means or help you understand the next steps?`
                            }
                        }));
                    }
                } else {
                    let errorMessage = 'Failed to fetch report';
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await res.json();
                        errorMessage = errorData.error || errorMessage;
                    } else if (res.status === 404) {
                        errorMessage = 'The requested report was not found.';
                    }
                    setError(errorMessage);
                }
            } catch (error) {
                console.error('Failed to fetch report', error);
                setError('A network or connection error occurred');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id, user]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">Retrieving Medical Data...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <Link href="/dashboard/patient" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );

    if (!report) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <Link
                        href="/dashboard/patient"
                        className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-all mb-6 group"
                    >
                        <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
                                    Ocular Analysis Report
                                </span>
                                <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
                                    Released
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Diagnosis Details</h1>
                            <p className="text-gray-500 mt-2 font-medium">Official medical record shared by your specialist</p>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Report Generated</div>
                            <div className="flex items-center text-gray-900 font-bold gap-2 md:justify-end">
                                <Calendar size={16} className="text-blue-500" />
                                {new Date(report.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left & Center: Medical Findings */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Primary Image View */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-white">
                                <div className="flex items-center gap-3">
                                    <Activity size={18} className="text-blue-500" />
                                    <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Retinal Visualization</h3>
                                </div>
                                <div className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">HD Diagnostic Scan</div>
                            </div>
                            <div className="p-8">
                                <div className="bg-slate-900 rounded-2xl overflow-hidden relative group aspect-video flex items-center justify-center">
                                    {report.annotated_image_path ? (
                                        <div className="relative w-full h-full">
                                            <img
                                                src={`/api/static/uploads/${report.image_path}`}
                                                alt="Original scan"
                                                className="w-full h-full object-contain opacity-40"
                                            />
                                            <img
                                                src={`/api/static/uploads/${report.annotated_image_path}`}
                                                alt="Doctor annotations"
                                                className="absolute top-0 left-0 w-full h-full object-contain"
                                            />
                                        </div>
                                    ) : report.image_path ? (
                                        <img
                                            src={`/api/static/uploads/${report.image_path}`}
                                            alt="Retinal scan"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="h-64 flex flex-col items-center justify-center text-gray-500 gap-2">
                                            <CameraOff size={40} className="opacity-20" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Image Unavailable</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                </div>
                                {report.annotated_image_path && (
                                    <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 flex items-center gap-2 text-blue-600">
                                        <Info size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wide">Interactive annotations enabled by specialist</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Analysis Breakdown */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-blue-600">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={18} className="text-white" />
                                    <h3 className="font-bold text-white uppercase text-xs tracking-widest">Diagnostic Summary</h3>
                                </div>
                                <div className="text-[10px] font-black text-blue-200 uppercase tracking-tighter italic">Verified Findings</div>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-50">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detected Classification</div>
                                        <div className="text-3xl font-black text-gray-900 capitalize tracking-tight">
                                            {report.predicted_class}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Analysis Confidence</div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-3xl font-black text-blue-600">
                                                {(report.confidence * 100).toFixed(1)}%
                                            </div>
                                            <div className="flex-1 max-w-[100px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-600 rounded-full"
                                                    style={{ width: `${report.confidence * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                            Explanation of Findings
                                        </h4>
                                        <p className="text-gray-600 text-sm leading-relaxed bg-gray-50/50 p-6 rounded-2xl border border-gray-100 italic">
                                            {report.explanation}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                            Patient Recommendations
                                        </h4>
                                        <p className="text-gray-600 text-sm leading-relaxed p-6 rounded-2xl bg-blue-50/20 border border-blue-100/30">
                                            {report.recommendation}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Specialist & System Context */}
                    <div className="space-y-8">
                        {/* Medical Professional Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <User size={16} className="text-blue-500" />
                                    Specialist Context
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20">
                                        {report.doctor_name ? report.doctor_name[0] : 'U'}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Assigned Specialist</div>
                                        <div className="text-lg font-bold text-gray-900">Dr. {report.doctor_name || 'Unassigned'}</div>
                                    </div>
                                </div>

                                {report.doctor_notes ? (
                                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                        <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">Clinical Annotations</div>
                                        <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                                            {report.doctor_notes}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center">
                                        No clinical notes provided for this record
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Facility Information */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={16} className="text-blue-500" />
                                    Facility Record
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Test Provider</span>
                                    <span className="text-sm font-black text-gray-900">{report.lab_name}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verification</span>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${report.lab_verified ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                        {report.lab_verified ? 'Certfied' : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Record Privacy</span>
                                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase tracking-tighter">
                                        End-to-End Encrypted
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-xl hover:bg-black transition-all"
                            onClick={() => window.print()}
                        >
                            Download PDF Record
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
}
