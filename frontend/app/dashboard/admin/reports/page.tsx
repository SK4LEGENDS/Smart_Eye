'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
    Search,
    Filter,
    Calendar,
    Download,
    Eye,
    CheckCircle,
    Clock,
    User,
    ChevronDown,
    FileText,
    Trash2,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface ReportData {
    id: number;
    patient_name: string;
    predicted_class: string;
    confidence: number;
    timestamp: string;
    lab_verified: boolean;
    lab: string;
    doctor_name: string;
    doctor_notes: string;
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<ReportData[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // New states for date filtering
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        fetchReports();
    }, [statusFilter]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const url = statusFilter === 'all'
                ? '/api/admin/reports'
                : `/api/admin/reports?status=${statusFilter}`;
            const res = await fetch(url, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setReports(data.predictions);
            }
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReport = async (id: number) => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/report/delete/${id}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                setReports(reports.filter(r => r.id !== id));
                setDeletingId(null);
            } else {
                alert('Failed to delete report');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('An error occurred while deleting the report');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteAllReports = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch('/api/admin/reports/delete_all', {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                setReports([]);
                setShowDeleteAllModal(false);
            } else {
                alert('Failed to delete all reports');
            }
        } catch (error) {
            console.error('Delete all error:', error);
            alert('An error occurred while deleting all reports');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredReports = reports.filter(r => {
        const matchesSearch = r.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.predicted_class.toLowerCase().includes(searchQuery.toLowerCase());

        // Date Filtering
        if (!dateFrom && !dateTo) return matchesSearch;

        const reportDate = new Date(r.timestamp);
        if (dateFrom) {
            const from = new Date(dateFrom);
            if (reportDate < from) return false;
        }
        if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999); // Inclusion of the whole end day
            if (reportDate > to) return false;
        }

        return matchesSearch;
    });

    const handleExportCSV = async () => {
        if (filteredReports.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = ["ID", "Patient Name", "AI Prediction", "Confidence (%)", "Date", "Lab", "Verified", "Doctor", "Clinical Notes"];
        const rows = filteredReports.map(r => [
            r.id,
            `"${r.patient_name}"`,
            r.predicted_class,
            (r.confidence * 100).toFixed(1),
            new Date(r.timestamp).toLocaleDateString(),
            `"${r.lab}"`,
            r.lab_verified ? "Yes" : "No",
            `"${r.doctor_name}"`,
            `"${r.doctor_notes.replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `eye_care_reports_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Log the export event
        try {
            await fetch('/api/admin/log_event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'EXPORT',
                    target_type: 'Report',
                    target_id: 0,
                    details: `Admin exported ${filteredReports.length} reports to CSV`
                }),
                credentials: 'include'
            });
        } catch (error) {
            console.error('Failed to log export event', error);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Generating system-wide reports...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Reports</h1>
                    <p className="text-gray-500">Monitor and manage all AI analysis results</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowDeleteAllModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg font-bold hover:bg-red-100 transition-colors shadow-sm"
                    >
                        <Trash2 size={18} />
                        <span className="hidden lg:inline">Nuclear Clear</span>
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className={`flex items-center gap-2 px-4 py-2 ${dateFrom || dateTo ? 'bg-blue-100 text-blue-700' : 'bg-blue-600 text-white'} font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm`}
                        >
                            <Calendar size={18} />
                            <span>{dateFrom || dateTo ? 'Date Applied' : 'Date Range'}</span>
                            <ChevronDown size={14} className={`transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
                        </button>

                        {showDatePicker && (
                            <div className="absolute right-0 mt-2 bg-white p-4 rounded-xl shadow-2xl border border-gray-100 z-30 w-72 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Filter by Date</h3>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase">From</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase">To</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => { setDateFrom(''); setDateTo(''); setShowDatePicker(false); }}
                                            className="flex-1 text-xs font-bold text-gray-500 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            onClick={() => setShowDatePicker(false)}
                                            className="flex-1 bg-gray-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-black transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by patient name or condition..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === 'all' ? 'bg-gray-100 text-blue-600 border border-blue-200' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatusFilter('verified')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === 'verified' ? 'bg-green-50 text-green-700 border border-green-100' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Verified
                    </button>
                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={fetchReports}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Reports List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredReports.map((report) => (
                    <div key={report.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg border border-blue-100">
                                    {report.patient_name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900 text-lg">{report.patient_name}</span>
                                        {report.lab_verified ? (
                                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                                <CheckCircle size={10} /> Verified
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100">
                                                <Clock size={10} /> Pending
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-700 font-medium capitalize">{report.predicted_class}</span>
                                        <span className="flex items-center gap-1"><User size={14} /> Lab: {report.lab}</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(report.timestamp).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between lg:justify-end gap-6">
                                <div className="text-right">
                                    <div className="text-xs text-gray-400 uppercase font-bold mb-1">AI Confidence</div>
                                    <div className="text-xl font-bold text-blue-600">{(report.confidence * 100).toFixed(1)}%</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/dashboard/lab/view/${report.id}`}
                                        className="flex items-center gap-2 bg-gray-900 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-black transition-colors"
                                    >
                                        <Eye size={18} />
                                        <span>Review</span>
                                    </Link>
                                    <button
                                        onClick={() => setDeletingId(report.id)}
                                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all"
                                        title="Delete Report"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredReports.length === 0 && (
                    <div className="bg-white p-20 rounded-xl border border-dashed border-gray-300 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No reports matching filters</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your search query or filter settings.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Individual Delete Confirmation Modal */}
            {deletingId !== null && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <div className="h-14 w-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <AlertTriangle size={30} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Report?</h3>
                            <p className="text-gray-500 text-center">
                                This action will permanently remove this AI analysis report and all associated medical images. This cannot be undone.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 flex gap-3">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteReport(deletingId)}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <span>Confirm Delete</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete All Confirmation Modal */}
            {showDeleteAllModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <div className="h-14 w-14 bg-red-600 text-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg shadow-red-200">
                                <Trash2 size={30} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Nuclear Clear: Delete All?</h3>
                            <p className="text-red-500 font-bold text-center mb-4">
                                WARNING: HIGH RISK OPERATION
                            </p>
                            <p className="text-gray-500 text-center">
                                You are about to delete <strong>EVERY</strong> AI analysis report in the system. This will wipe all prediction history and associated medical data from the server.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 flex flex-col gap-3">
                            <button
                                onClick={() => handleDeleteAllReports()}
                                className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin" />
                                        <span>Executing Wipe...</span>
                                    </>
                                ) : (
                                    <span>Yes, DELETE ALL RECORDS</span>
                                )}
                            </button>
                            <button
                                onClick={() => setShowDeleteAllModal(false)}
                                className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancel / Abort
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
