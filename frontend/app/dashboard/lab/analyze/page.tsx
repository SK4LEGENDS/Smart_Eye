'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, UploadCloud, FileImage, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface Patient {
    id: number;
    name: string;
    email: string;
}

export default function LabNewAnalysis() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const pId = searchParams.get('patient_id');
        const bId = searchParams.get('booking_id');
        console.log("DEBUG: Params:", { pId, bId });

        if (pId) {
            console.log("DEBUG: Setting Patient ID to:", pId);
            setSelectedPatientId(pId);
        }
        if (bId) setBookingId(bId);
    }, [searchParams]);

    useEffect(() => {
        if (user?.user_type !== 'lab') return;

        const fetchPatients = async () => {
            try {
                const res = await fetch('/api/lab/analyze', {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setPatients(data.patients || []);
                }
            } catch (err) {
                console.error("Failed to load patients", err);
                setError("Failed to load patient list.");
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatientId || !selectedFile) {
            setError("Please select a patient and an image.");
            return;
        }

        setSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('patient_id', selectedPatientId);
        formData.append('image', selectedFile);
        if (bookingId) formData.append('booking_id', bookingId);

        try {
            const res = await fetch('/api/lab/analyze', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const result = await res.json();

            if (res.ok) {
                // Success! Redirect to dashboard (or maybe show result page later)
                router.push('/dashboard/lab');
            } else {
                setError(result.error || "Analysis failed.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return null;
    if (loading) return <div className="p-8 text-center text-gray-500">Loading analysis tools...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Link href="/dashboard/lab" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors mb-4">
                        <ChevronLeft size={16} className="mr-1" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">New Analysis</h1>
                    <p className="text-gray-500 mt-1">Upload a fundus image (or OCT) to run the diagnostic AI model.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* 1. Patient Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Select Patient</label>
                            <select
                                value={selectedPatientId}
                                onChange={(e) => setSelectedPatientId(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="">-- Choose a patient --</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (ID: #{p.id}) - {p.email}</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Image Upload */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Upload Scan Image</label>
                            <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${previewUrl ? 'border-green-300 bg-green-50/10' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/10'
                                }`}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="scan-upload"
                                />

                                {previewUrl ? (
                                    <div className="relative">
                                        <img src={previewUrl} alt="Preview" className="max-h-64 rounded-lg shadow-md" />
                                        <label htmlFor="scan-upload" className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-sm text-xs font-bold text-blue-600 cursor-pointer border border-gray-100 hover:bg-blue-50">
                                            Change Image
                                        </label>
                                    </div>
                                ) : (
                                    <label htmlFor="scan-upload" className="cursor-pointer group">
                                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                                            <UploadCloud size={32} />
                                        </div>
                                        <p className="text-gray-900 font-medium">Click to upload scan</p>
                                        <p className="text-sm text-gray-400 mt-1">Supports JPG, PNG (Max 16MB)</p>
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center text-sm font-medium animate-pulse">
                                <AlertCircle size={18} className="mr-2" />
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || !selectedPatientId || !selectedFile}
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin mr-2" />
                                        Running Analysis...
                                    </>
                                ) : (
                                    <>
                                        Run Analysis
                                        <FileImage size={18} className="ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
