'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, Clock, AlertCircle, Glasses, FileText, Loader2 } from 'lucide-react';

export default function PatientBookTest() {
    const { user } = useAuth();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [visitReason, setVisitReason] = useState('');
    const [wearsGlasses, setWearsGlasses] = useState('');
    const [knownConditions, setKnownConditions] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !timeSlot || !visitReason) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/patient/book_lab', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: date,
                    time_slot: timeSlot,
                    visit_reason: visitReason,
                    wears_glasses: wearsGlasses,
                    known_conditions: knownConditions,
                    additional_notes: additionalNotes
                }),
                credentials: 'include'
            });

            if (res.ok) {
                router.push('/dashboard/patient');
            } else {
                alert('Failed to book appointment.');
            }
        } catch (error) {
            console.error('Booking error', error);
        } finally {
            setSubmitting(false);
        }
    };

    const minDate = new Date().toISOString().split('T')[0];

    const isFormValid = date && timeSlot && visitReason && wearsGlasses;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <span className="text-blue-600 font-semibold">Smart Eye Care</span>
                    <div className="text-sm text-gray-600">
                        Welcome, {user?.name} <Link href="/dashboard/patient" className="text-red-500 ml-2 hover:underline">Back</Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Page Title */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <Link href="/dashboard/patient" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mb-2">
                        <ChevronLeft size={16} />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Book Eye Examination</h1>
                    <p className="text-gray-500 text-sm">Fill in your details to schedule a comprehensive eye checkup</p>
                </div>

                <form onSubmit={handleBooking} className="space-y-6">
                    {/* Appointment Schedule */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-blue-600 text-white px-6 py-3 font-semibold flex items-center gap-2">
                            <Calendar size={18} />
                            Appointment Schedule
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                                <input
                                    type="date"
                                    required
                                    min={minDate}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={timeSlot}
                                    onChange={(e) => setTimeSlot(e.target.value)}
                                >
                                    <option value="">Select time slot</option>
                                    <option value="morning">Morning (9 AM - 12 PM)</option>
                                    <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                                    <option value="evening">Evening (4 PM - 7 PM)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Reason for Visit */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-green-600 text-white px-6 py-3 font-semibold flex items-center gap-2">
                            <AlertCircle size={18} />
                            Reason for Visit
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">What brings you in today? *</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {[
                                    'Routine Checkup',
                                    'Blurry Vision',
                                    'Eye Pain/Discomfort',
                                    'Headaches',
                                    'Redness/Irritation',
                                    'Other'
                                ].map((reason) => (
                                    <button
                                        key={reason}
                                        type="button"
                                        onClick={() => setVisitReason(reason)}
                                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${visitReason === reason
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 text-gray-600 hover:border-green-300'
                                            }`}
                                    >
                                        {reason}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Vision History */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-purple-600 text-white px-6 py-3 font-semibold flex items-center gap-2">
                            <Glasses size={18} />
                            Vision History
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Do you currently wear glasses or contact lenses? *</label>
                                <div className="flex gap-4">
                                    {['Yes, Glasses', 'Yes, Contacts', 'Both', 'No'].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setWearsGlasses(option)}
                                            className={`px-5 py-3 rounded-lg border-2 text-sm font-medium transition-all ${wearsGlasses === option
                                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                    : 'border-gray-200 text-gray-600 hover:border-purple-300'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Any known eye conditions or family history?
                                </label>
                                <p className="text-xs text-gray-400 mb-2">E.g., Diabetes, Glaucoma in family, Previous eye surgery</p>
                                <input
                                    type="text"
                                    placeholder="Type here or leave blank if none"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    value={knownConditions}
                                    onChange={(e) => setKnownConditions(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-yellow-500 text-white px-6 py-3 font-semibold flex items-center gap-2">
                            <FileText size={18} />
                            Additional Information
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Any other concerns or notes for the doctor?</label>
                            <textarea
                                rows={3}
                                placeholder="E.g., I have difficulty seeing at night, I need large print forms, etc."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-center pt-4">
                        <button
                            type="submit"
                            disabled={!isFormValid || submitting}
                            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Submitting...
                                </>
                            ) : (
                                'Request Appointment'
                            )}
                        </button>
                    </div>
                    <p className="text-center text-sm text-gray-400">
                        Our team will contact you to confirm your appointment.
                    </p>
                </form>
            </main>
        </div>
    );
}
