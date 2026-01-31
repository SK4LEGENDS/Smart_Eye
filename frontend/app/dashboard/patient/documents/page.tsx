'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Trash2,
    Download,
    Search,
    Upload,
    Clock,
    ChevronLeft,
    Eye,
    Copy,
    X,
    Sparkles,
    File,
    Image as ImageIcon
} from 'lucide-react';

interface Document {
    id: number;
    filename: string;
    type: string;
    timestamp: string;
    extracted_text?: string;
    ocr_confidence?: number;
}

export default function PatientDocuments() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [extracting, setExtracting] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleAuthError = () => {
        alert('Your session has expired. Please log in again.');
        logout();
        router.push('/login');
    };

    const fetchDocuments = async () => {
        try {
            const res = await fetch('/api/patient/documents', {
                credentials: 'include'
            });
            if (res.ok) {
                const result = await res.json();
                setDocuments(result.documents);
            } else if (res.status === 401) {
                handleAuthError();
            }
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.user_type !== 'patient') return;
        fetchDocuments();
    }, [user]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('document', file);

        try {
            const res = await fetch('/api/patient/documents', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (res.ok) {
                await fetchDocuments();
                alert('Document uploaded successfully!');
            } else if (res.status === 401) {
                handleAuthError();
            } else {
                alert('Upload failed. Please check the file type.');
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert('An error occurred during upload.');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const extractText = async (docId: number) => {
        setExtracting(docId);
        try {
            const res = await fetch(`/api/patient/documents/extract/${docId}`, {
                method: 'POST',
                credentials: 'include'
            });

            if (res.ok) {
                const result = await res.json();
                // Update document with extracted text
                setDocuments(docs => docs.map(doc =>
                    doc.id === docId
                        ? { ...doc, extracted_text: result.text, ocr_confidence: result.confidence }
                        : doc
                ));

                // Show modal with extracted text
                const doc = documents.find(d => d.id === docId);
                if (doc) {
                    setSelectedDoc({
                        ...doc,
                        extracted_text: result.text,
                        ocr_confidence: result.confidence
                    });
                    setShowModal(true);
                }
            } else if (res.status === 401) {
                handleAuthError();
            }
        } catch (error) {
            console.error('Failed to extract text', error);
            alert('Failed to extract text. Please try again.');
        } finally {
            setExtracting(null);
        }
    };

    const viewExtractedText = (doc: Document) => {
        setSelectedDoc(doc);
        setShowModal(true);
    };

    const handleDelete = async (docId: number) => {
        if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) return;

        setDeleting(docId);
        try {
            const res = await fetch(`/api/patient/documents/${docId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                setDocuments(docs => docs.filter(doc => doc.id !== docId));
                alert('Document deleted successfully.');
            } else if (res.status === 401) {
                handleAuthError();
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to delete document.');
            }
        } catch (error) {
            console.error('Delete failed', error);
            alert('An error occurred during deletion.');
        } finally {
            setDeleting(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                <p className="text-gray-500 font-medium">Syncing Vault...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl text-blue-600 font-bold">Smart Eye Care</span>
                        </div>
                        <div className="flex items-center space-x-5 text-gray-700 font-medium">
                            <span className="text-sm">
                                Welcome, <Link href="/settings" className="hover:text-blue-600 transition-colors font-bold">{user?.name}</Link>
                            </span>
                            <button onClick={logout} className="text-red-600 hover:text-red-800 transition-colors font-bold text-sm">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm p-8 mb-8 relative overflow-hidden border border-gray-100"
                >
                    <div className="relative z-10">
                        <Link href="/dashboard/patient" className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 transition-colors mb-6 text-sm font-bold group">
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </Link>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Document Vault</h1>
                                <p className="text-gray-500 max-w-xl leading-relaxed">
                                    Securely store and manage your clinical records, prescriptions, and lab reports. Use AI Extraction to digitize your physical documents.
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <label className={`cursor-pointer inline-flex items-center gap-3 px-8 py-4 bg-yellow-500 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-yellow-600 transition-all shadow-lg shadow-yellow-500/20 active:scale-95 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {uploading ? (
                                        <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div> Uploading...</>
                                    ) : (
                                        <><Upload size={18} /> Upload New Record</>
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleUpload}
                                        disabled={uploading}
                                        accept="image/*,.pdf"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <FileText size={140} className="text-yellow-600" />
                    </div>
                </motion.div>

                {/* Filters/Search placeholder */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Stored Records ({documents.length})</h2>
                </div>

                {/* Documents Grid */}
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="popLayout">
                        {documents.map((doc, index) => (
                            <motion.div
                                key={doc.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-500 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-5 flex-1">
                                    <div className="flex-shrink-0 w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
                                        {doc.filename.match(/\.(jpg|jpeg|png)$/i) ? (
                                            <ImageIcon size={28} />
                                        ) : (
                                            <FileText size={28} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900 truncate max-w-md">{doc.filename}</h3>
                                            {doc.extracted_text && (
                                                <span className="flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border border-green-100">
                                                    <Sparkles size={10} /> AI Sync
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                                            <span className="flex items-center gap-1.5 font-mono">
                                                <Clock size={14} /> {new Date(doc.timestamp).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            {doc.ocr_confidence && (
                                                <span className="text-green-600/70 font-bold uppercase tracking-widest text-[9px]">
                                                    {doc.ocr_confidence.toFixed(1)}% Confidence
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                                        {doc.extracted_text ? (
                                            <button
                                                onClick={() => viewExtractedText(doc)}
                                                className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-yellow-600 flex items-center gap-2 transition-colors uppercase tracking-widest"
                                            >
                                                <Eye size={16} /> View
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => extractText(doc.id)}
                                                disabled={extracting === doc.id}
                                                className="px-4 py-2 text-xs font-black text-yellow-600 hover:text-yellow-700 flex items-center gap-2 transition-colors uppercase tracking-widest disabled:opacity-50"
                                            >
                                                {extracting === doc.id ? (
                                                    <><div className="animate-spin rounded-full h-3 w-3 border-2 border-yellow-200 border-t-yellow-600"></div> OCR...</>
                                                ) : (
                                                    <><Sparkles size={16} /> Extract AI</>
                                                )}
                                            </button>
                                        )}
                                        <div className="w-[1px] bg-gray-200 my-1 mx-1 line"></div>
                                        <a
                                            href={`/api/uploads/${doc.filename}`}
                                            target="_blank"
                                            className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-blue-600 flex items-center gap-2 transition-colors uppercase tracking-widest"
                                        >
                                            <Download size={16} /> Get
                                        </a>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        disabled={deleting === doc.id}
                                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                                        title="Delete Record"
                                    >
                                        {deleting === doc.id ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-200 border-t-red-500"></div>
                                        ) : (
                                            <Trash2 size={20} />
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {documents.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white rounded-3xl p-20 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center group"
                        >
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Search size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">The Vault is Empty</h3>
                            <p className="text-gray-400 max-w-sm text-sm">You haven't uploaded any documents yet. Start by adding your first record to the safe.</p>
                        </motion.div>
                    )}
                </div>

                <div className="mt-12 p-6 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-4 items-start max-w-3xl">
                    <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600 mt-1">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h4 className="font-bold text-yellow-900 text-sm mb-1">Advanced OCR Intelligence</h4>
                        <p className="text-yellow-700/80 text-xs leading-relaxed">
                            Our AI engine can extract key optical metrics from prescriptions and lab reports. Ensure images are high resolution and well-lit for maximum accuracy.
                        </p>
                    </div>
                </div>
            </main>

            {/* Modal for extracted text */}
            <AnimatePresence>
                {showModal && selectedDoc && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.2)] max-w-3xl w-full max-h-[85vh] overflow-hidden border border-gray-100 flex flex-col"
                        >
                            <div className="p-10 border-b border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-yellow-50 p-3 rounded-2xl text-yellow-600">
                                            <Sparkles size={24} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black tracking-widest text-yellow-600 uppercase mb-1">AI Data Extraction</div>
                                            <h2 className="text-2xl font-bold text-gray-900">{selectedDoc.filename}</h2>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-2 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-full"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-10 overflow-y-auto bg-gray-50/50">
                                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-inner relative group">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest">OCR_RAW_BUFFER</div>
                                    </div>
                                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                                        {selectedDoc.extracted_text}
                                    </pre>
                                </div>

                                <div className="mt-8 flex items-center justify-center gap-8 border-t border-gray-100 pt-8">
                                    <div className="text-center">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Sync Confidence</div>
                                        <div className="text-xl font-bold text-green-600">{selectedDoc.ocr_confidence?.toFixed(1)}%</div>
                                    </div>
                                    <div className="w-[1px] h-10 bg-gray-200"></div>
                                    <div className="text-center">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</div>
                                        <div className="text-sm font-bold text-gray-700 uppercase">Verified</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-gray-100 flex justify-end gap-3 bg-white">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(selectedDoc.extracted_text || '');
                                        alert('Digitized text copied to clipboard!');
                                    }}
                                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-gray-800 active:scale-95 flex items-center gap-2 shadow-lg shadow-gray-200"
                                >
                                    <Copy size={16} /> Copy Sync Data
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-4 border border-gray-200 text-gray-600 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-gray-50 active:scale-95"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
