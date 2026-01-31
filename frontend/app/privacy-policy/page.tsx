"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Eye, Lock } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header / Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="bg-blue-600 p-2 rounded-lg text-white">
                                <Eye size={20} />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                Smart Eye Care
                            </span>
                        </Link>
                        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center">
                            <ArrowLeft size={16} className="mr-2" /> Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="flex-grow pt-32 pb-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100"
                    >
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                            <ShieldCheck size={32} />
                        </div>

                        <h1 className="text-4xl font-black text-slate-900 mb-6">Privacy Policy</h1>

                        <div className="space-y-8 text-gray-600 leading-relaxed">
                            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                                <Lock className="text-blue-600 h-6 w-6 mt-1 flex-shrink-0" />
                                <p className="text-blue-800 text-sm font-medium uppercase tracking-wider">
                                    Your medical data is encrypted with AES-256 and is never shared with third parties without explicit clinical consent.
                                </p>
                            </div>

                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-3">1. Data Collection</h2>
                                <p>We collect retinal fundus images and basic medical history to provide AI screening. All images are processed securely on our diagnostic nodes.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-3">2. How We Use Information</h2>
                                <p>Information is used exclusively to generate screening reports, provide heatmaps for clinicians, and improve our AI diagnostic accuracy over time.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-3">3. HIPAA & GDPR Compliance</h2>
                                <p>We adhere to strict international standards for medical data handling. This includes specialized access controls, audit logs, and data de-identification where appropriate.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-3">4. Your Rights</h2>
                                <p>You have the right to request a full copy of your medical data or ask for the immediate deletion of your screening records at any time.</p>
                            </section>
                        </div>

                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm font-medium">
                    <div>© 2026 Smart Eye Care Lab. All rights reserved.</div>
                    <div className="flex space-x-6 mt-6 md:mt-0">
                        <Link href="/medical-disclaimer" className="hover:text-red-500 font-medium">Medical Disclaimer</Link>
                        <Link href="/privacy-policy" className="hover:text-gray-600">Privacy Policy</Link>
                        <Link href="/terms-of-service" className="hover:text-gray-600">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
