"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, Eye, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
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
                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-8">
                            <FileText size={32} />
                        </div>

                        <h1 className="text-4xl font-black text-slate-900 mb-6">Terms of Service</h1>

                        <div className="space-y-8 text-gray-600 leading-relaxed">
                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
                                <p>By accessing Smart Eye Care, you agree to comply with these terms and our medical disclaimer. If you do not agree, please do not use the platform.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-3">2. User Accounts</h2>
                                <p>Users are responsible for maintaining the confidentiality of their credentials. Any misuse of medical records or unauthorized access is strictly prohibited.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-3">3. Professional Use</h2>
                                <p>Healthcare providers using this platform acknowledge that AI results are supplementary and they retain full clinical responsibility for the final diagnosis.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-3">4. Intellectual Property</h2>
                                <p>All software, AI weights, and branding are the exclusive property of Smart Eye Care Lab. Reproduction or reverse engineering is forbidden.</p>
                            </section>

                            <div className="space-y-3 pt-6">
                                <div className="flex items-center text-sm font-bold text-slate-800">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> Authorized Platform Usage
                                </div>
                                <div className="flex items-center text-sm font-bold text-slate-800">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> Data Integrity Standards
                                </div>
                                <div className="flex items-center text-sm font-bold text-slate-800">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> Ethical AI Usage
                                </div>
                            </div>
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
