'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle, XCircle, UserCheck, AlertTriangle } from 'lucide-react';

export default function LabVerifyPage() {
    const { user } = useAuth();
    const { id } = useParams();
    const router = useRouter();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [imageQuality, setImageQuality] = useState('Good');

    // Doctor assignment state
    const [recommendedDoctors, setRecommendedDoctors] = useState<any[]>([]);
    const [otherDoctors, setOtherDoctors] = useState<any[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [assignSuccess, setAssignSuccess] = useState(false);

    // Confidence Challenge State
    const [showChallenge, setShowChallenge] = useState(false);
    const [challengeMessage, setChallengeMessage] = useState('');
    const [pendingAction, setPendingAction] = useState<'verify' | 'reject' | null>(null);

    useEffect(() => {
        if (user?.user_type !== 'lab') return;

        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/lab/report/${id}`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const result = await res.json();
                    setReport(result.prediction);
                    setRecommendedDoctors(result.recommended_doctors || []);
                    setOtherDoctors(result.other_doctors || []);
                    if (result.prediction.doctor_id) {
                        setSelectedDoctor(result.prediction.doctor_id.toString());
                        setAssignSuccess(true);
                    }

                    // ---- PROACTIVE CHATBOT POPUP ----
                    // Open chatbot with context about this report
                    const confidence = result.prediction.confidence;
                    const confidencePct = Math.round(confidence * 100);
                    const predictedClass = result.prediction.predicted_class;
                    const patientName = result.prediction.patient_name;

                    let proactiveMessage = "";

                    if (confidence < 0.6) {
                        // Low confidence warning
                        proactiveMessage = `👋 Hey! I noticed you're reviewing **${patientName}'s** report.\n\n⚠️ **Heads up:** The AI is only **${confidencePct}% confident** about the **${predictedClass}** diagnosis.\n\nI'd recommend checking the **image quality** before verifying. Want me to help you understand what to look for?`;
                    } else {
                        // Normal/high confidence greeting
                        proactiveMessage = `👋 Hi! You're reviewing **${patientName}'s** report.\n\n✅ The AI detected **${predictedClass}** with **${confidencePct}% confidence**.\n\nNeed any help with this analysis? I can explain the findings or suggest next steps.`;
                    }

                    // Dispatch event to open chatbot
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('chatbot-proactive-message', {
                            detail: {
                                message: proactiveMessage,
                                originalAction: null,
                                reportContext: {
                                    id: result.prediction.id,
                                    confidence,
                                    predictedClass,
                                    patientName
                                }
                            }
                        }));
                    }, 500); // Small delay so page renders first
                }
            } catch (error) {
                console.error('Failed to fetch report', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id, user]);

    const handleAction = async (action: 'verify' | 'reject', confirmOverride = false) => {
        if (action === 'verify' && !selectedDoctor) {
            alert('Please select a doctor before verifying');
            return;
        }

        console.log('🚀 Sending request:', { action, confirmOverride, imageQuality, selectedDoctor });

        try {
            const res = await fetch(`/api/lab/verify_report/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    image_quality: imageQuality,
                    doctor_id: action === 'verify' ? selectedDoctor : null,
                    confirm_override: confirmOverride
                }),
                credentials: 'include'
            });

            const data = await res.json();
            console.log('📡 API Response:', { status: res.status, ok: res.ok, data });

            if (res.ok) {
                // Check if it's a challenge response (200 OK but with challenge flag)
                if (data.challenge) {
                    console.log('⚠️ Challenge detected! Opening chatbot...');

                    // Dispatch event to open chatbot with proactive message
                    window.dispatchEvent(new CustomEvent('chatbot-proactive-message', {
                        detail: {
                            message: data.message,
                            originalAction: data.original_action,
                            onConfirm: () => handleAction(data.original_action, true),
                            onCancel: () => setShowChallenge(false)
                        }
                    }));

                    // Also show the modal as a backup visual
                    setChallengeMessage(data.message);
                    setPendingAction(data.original_action);
                    setShowChallenge(true);
                    return;
                }
                console.log('✅ Success, redirecting...');
                router.push('/dashboard/lab');
            } else {
                console.error('❌ Error:', data.error);
                alert(data.error || 'Action failed');
            }
        } catch (error) {
            console.error("Verification failed", error);
        }
    };

    const handleAssignDoctor = async () => {
        if (!selectedDoctor) return;

        setAssigning(true);
        try {
            const res = await fetch(`/api/lab/assign/${id}/${selectedDoctor}`, {
                method: 'POST',
                credentials: 'include'
            });

            if (res.ok) {
                setAssignSuccess(true);
                const data = await res.json();
                alert(data.message);
            } else {
                alert('Failed to assign doctor');
            }
        } catch (error) {
            console.error('Assignment failed', error);
        } finally {
            setAssigning(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading report...</div>;
    if (!report) return <div className="p-8 text-center text-gray-500">Report not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">Verify Report #{report.id}</h1>
                    <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
                </div>

                <div className="p-6">
                    {/* Image Viewer */}
                    <div className="bg-black rounded-lg overflow-hidden mb-6 relative">
                        {report.image_path ? (
                            <img
                                src={`/api/static/uploads/${report.image_path}`}
                                alt="Retinal scan"
                                className="w-full h-96 object-contain"
                                onError={(e) => {
                                    e.currentTarget.src = '';
                                    e.currentTarget.alt = 'Image not available';
                                }}
                            />
                        ) : (
                            <div className="h-96 flex items-center justify-center">
                                <span className="text-gray-400">Image not available</span>
                            </div>
                        )}
                    </div>

                    {/* AI Analysis */}
                    <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
                        <h3 className="font-bold text-blue-900 mb-2">AI Analysis Result</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-blue-700 uppercase font-bold">Prediction</div>
                                <div className="text-xl font-bold text-blue-900 capitalize">{report.predicted_class}</div>
                            </div>
                            <div>
                                <div className="text-xs text-blue-700 uppercase font-bold">Confidence</div>
                                <div className="text-xl font-bold text-blue-900">{(report.confidence * 100).toFixed(1)}%</div>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-200">
                            <div className="text-xs text-blue-700 uppercase font-bold mb-1">Patient</div>
                            <div className="text-sm text-blue-900">{report.patient_name}</div>
                        </div>
                    </div>

                    {/* Doctor Assignment Section */}
                    <div className="bg-purple-50 p-4 rounded-md mb-6 border border-purple-100">
                        <div className="flex items-center mb-3">
                            <UserCheck size={20} className="text-purple-700 mr-2" />
                            <h3 className="font-bold text-purple-900">Assign to Specialist</h3>
                        </div>

                        {assignSuccess && (
                            <div className="bg-green-100 text-green-700 px-3 py-2 rounded mb-3 text-sm flex items-center">
                                <CheckCircle size={16} className="mr-2" />
                                Doctor assigned successfully
                            </div>
                        )}

                        <select
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                            className="w-full p-2 border border-purple-200 rounded mb-3 focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 bg-white"
                            disabled={assigning}
                        >
                            <option value="" className="text-gray-900">-- Select Doctor --</option>

                            {recommendedDoctors.length > 0 && (
                                <optgroup label="⭐ Recommended for {report.predicted_class}">
                                    {recommendedDoctors.map(d => (
                                        <option key={d.id} value={d.id} className="text-gray-900">
                                            Dr. {d.name} - {d.specialist || 'Specialist'}
                                        </option>
                                    ))}
                                </optgroup>
                            )}

                            {otherDoctors.length > 0 && (
                                <optgroup label="Other Available Doctors">
                                    {otherDoctors.map(d => (
                                        <option key={d.id} value={d.id} className="text-gray-900">
                                            Dr. {d.name} - {d.specialist || 'General'}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>

                        <button
                            onClick={handleAssignDoctor}
                            disabled={!selectedDoctor || assigning}
                            className="w-full bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {assigning ? 'Assigning...' : 'Assign Doctor'}
                        </button>
                    </div>

                    {/* Verification Controls */}
                    <div className="border-t border-gray-100 pt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image Quality Assessment</label>
                        <select
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-4 p-2 border text-gray-900 bg-white"
                            value={imageQuality}
                            onChange={(e) => setImageQuality(e.target.value)}
                        >
                            <option value="Good" className="text-gray-900">Good</option>
                            <option value="Blurry" className="text-gray-900">Blurry</option>
                            <option value="Too Dark" className="text-gray-900">Too Dark</option>
                            <option value="Artifacts" className="text-gray-900">Artifacts present</option>
                        </select>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => handleAction('verify')}
                                className="flex-1 bg-green-600 text-white py-3 rounded-md font-bold hover:bg-green-700 shadow-sm flex items-center justify-center"
                            >
                                <CheckCircle size={18} className="mr-2" />
                                Verify & Release
                            </button>
                            <button
                                onClick={() => handleAction('reject')}
                                className="flex-1 bg-red-600 text-white py-3 rounded-md font-bold hover:bg-red-700 shadow-sm flex items-center justify-center"
                            >
                                <XCircle size={18} className="mr-2" />
                                Reject Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confidence Challenge Modal */}
            {showChallenge && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl transform transition-all">
                        <div className="flex items-start mb-4">
                            <div className="flex-shrink-0 bg-yellow-100 rounded-full p-2">
                                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-bold text-gray-900">Wait a second!</h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 whitespace-pre-line">
                                        {challengeMessage}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                onClick={() => handleAction(pendingAction!, true)}
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${pendingAction === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                {pendingAction === 'reject' ? 'Yes, Reject It' : 'Yes, Verify It'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowChallenge(false)}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
