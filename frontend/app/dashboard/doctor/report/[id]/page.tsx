'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, FileText, User, Calendar, Pencil, Eraser, Circle, Square } from 'lucide-react';
import Link from 'next/link';

export default function LabVerifyPage() {
    const { user } = useAuth();
    const { id } = useParams();
    const router = useRouter();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Annotation state
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawColor, setDrawColor] = useState('#FF0000');
    const [drawTool, setDrawTool] = useState<'pen' | 'eraser' | 'circle' | 'square'>('pen');
    const [lineWidth, setLineWidth] = useState(3);

    useEffect(() => {
        if (user?.user_type !== 'doctor') return;

        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/doctor/report/${id}`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setReport(data.report);
                    setNotes(data.report?.doctor_notes || '');
                }
            } catch (error) {
                console.error('Failed to fetch report', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id, user]);

    const handleSaveAll = async (shareWithPatient: boolean) => {
        setSubmitting(true);
        try {
            // Get canvas as base64 image
            const canvas = canvasRef.current;
            let annotationImage = null;

            if (canvas) {
                // Check if canvas has any drawings
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    annotationImage = canvas.toDataURL('image/png');
                }
            }

            const res = await fetch(`/api/doctor/report/${id}/save_all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notes,
                    annotation_image: annotationImage,
                    share_with_patient: shareWithPatient
                }),
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.shared ? 'Report shared with patient successfully!' : 'Draft saved successfully!');
                router.push('/dashboard/doctor');
            } else {
                alert('Failed to save report');
            }
        } catch (error) {
            console.error('Failed to save report', error);
            alert('Error saving report');
        } finally {
            setSubmitting(false);
        }
    };

    // Canvas drawing functions
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = drawTool === 'eraser' ? '#000000' : drawColor;
        ctx.lineWidth = drawTool === 'eraser' ? lineWidth * 3 : lineWidth;
        ctx.lineCap = 'round';
        ctx.globalCompositeOperation = drawTool === 'eraser' ? 'destination-out' : 'source-over';
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (drawTool === 'pen' || drawTool === 'eraser') {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading report...</div>;
    if (!report) return <div className="p-8 text-center text-gray-500">Report not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/dashboard/doctor"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors mb-4"
                    >
                        <ChevronLeft size={16} className="mr-1" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Patient Report</h1>
                            <p className="text-gray-500 mt-1">Diagnostic Analysis Details</p>
                        </div>
                        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold">
                            {report.status || 'Shared'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Image & AI Analysis */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Retinal Image with Annotation */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900">Retinal Scan</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setDrawTool('pen')}
                                        className={`p-2 rounded ${drawTool === 'pen' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                                        title="Draw"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => setDrawTool('eraser')}
                                        className={`p-2 rounded ${drawTool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                                        title="Eraser"
                                    >
                                        <Eraser size={16} />
                                    </button>
                                    <select
                                        value={drawColor}
                                        onChange={(e) => setDrawColor(e.target.value)}
                                        className="px-2 py-1 border rounded text-sm text-gray-900 bg-white"
                                    >
                                        <option value="#FF0000" className="text-gray-900">Red</option>
                                        <option value="#00FF00" className="text-gray-900">Green</option>
                                        <option value="#0000FF" className="text-gray-900">Blue</option>
                                        <option value="#FFFF00" className="text-gray-900">Yellow</option>
                                        <option value="#FF00FF" className="text-gray-900">Magenta</option>
                                    </select>
                                    <button
                                        onClick={clearCanvas}
                                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="bg-black rounded-lg overflow-hidden relative">
                                    {report.image_path ? (
                                        <>
                                            <img
                                                src={`/api/static/uploads/${report.image_path}`}
                                                alt="Retinal scan"
                                                className="w-full h-96 object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.src = '';
                                                    e.currentTarget.alt = 'Image not available';
                                                }}
                                                onLoad={(e) => {
                                                    const canvas = canvasRef.current;
                                                    if (canvas) {
                                                        const img = e.currentTarget;
                                                        canvas.width = img.clientWidth;
                                                        canvas.height = img.clientHeight;

                                                        // Restore existing annotations if available
                                                        if (report.annotated_image_path) {
                                                            const annotationImg = new Image();
                                                            annotationImg.src = `/api/static/uploads/${report.annotated_image_path}`;
                                                            annotationImg.crossOrigin = "anonymous";
                                                            annotationImg.onload = () => {
                                                                const ctx = canvas.getContext('2d');
                                                                if (ctx) {
                                                                    ctx.drawImage(annotationImg, 0, 0, canvas.width, canvas.height);
                                                                }
                                                            };
                                                        }
                                                    }
                                                }}
                                            />
                                            <canvas
                                                ref={canvasRef}
                                                className="absolute top-0 left-0 cursor-crosshair"
                                                onMouseDown={startDrawing}
                                                onMouseMove={draw}
                                                onMouseUp={stopDrawing}
                                                onMouseLeave={stopDrawing}
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                        </>
                                    ) : (
                                        <div className="h-96 flex items-center justify-center">
                                            <span className="text-gray-400">Image not available</span>
                                        </div>
                                    )}
                                </div>
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

                    {/* Right Column - Patient Info & Doctor Notes */}
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
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Lab Source</div>
                                    <div className="text-gray-700">{report.lab_name || 'Lab1'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Doctor Notes */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-green-100 px-6 py-3 border-b border-green-200">
                                <div className="flex items-center">
                                    <FileText size={18} className="text-green-700 mr-2" />
                                    <h3 className="font-bold text-green-900">Doctor Notes</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add your clinical notes and recommendations here..."
                                    className="w-full h-40 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none text-gray-900 bg-white"
                                />
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={() => handleSaveAll(false)}
                                        disabled={submitting}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
                                    >
                                        {submitting ? 'Saving...' : 'Save Draft'}
                                    </button>
                                    <button
                                        onClick={() => handleSaveAll(true)}
                                        disabled={submitting}
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-all"
                                    >
                                        {submitting ? 'Sharing...' : 'Share with Patient'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
