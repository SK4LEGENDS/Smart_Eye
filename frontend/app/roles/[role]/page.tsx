'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    User, Stethoscope, FlaskConical, ArrowRight, CheckCircle,
    ShieldCheck, Clock, Award, Activity, FileText, Share2
} from 'lucide-react';
import { useParams, notFound } from 'next/navigation';

// --- Data for each Role ---
const ROLE_DATA: any = {
    patient: {
        title: "For Patients",
        subtitle: "Your Vision, Our Priority.",
        heroText: "Take control of your eye health with instant AI analysis, easy appointment booking, and secure medical records.",
        heroIcon: <User className="w-16 h-16 text-white" />,
        color: "blue",
        features: [
            {
                title: "Instant AI Screening",
                desc: "Get preliminary results for cataracts and retinopathy in seconds from a simple eye scan.",
                icon: <Activity className="text-blue-500" />
            },
            {
                title: "Secure Health Records",
                desc: "Access your scan history, prescriptions, and reports anytime, anywhere. HIPAA compliant.",
                icon: <ShieldCheck className="text-blue-500" />
            },
            {
                title: "Easy Doctor Booking",
                desc: "Connect with top ophthalmologists near you and book appointments instantly.",
                icon: <Clock className="text-blue-500" />
            }
        ],
        steps: [
            "Upload your eye scan or visit a partner clinic.",
            "Receive an AI-generated health report instantly.",
            "Book a follow-up with a verified doctor if issues are found."
        ]
    },
    doctor: {
        title: "For Doctors",
        subtitle: "Advanced Diagnostic Support.",
        heroText: "Enhance your practice with clinical-grade AI that screens, prioritizes, and documents patient cases for you.",
        heroIcon: <Stethoscope className="w-16 h-16 text-white" />,
        color: "green",
        features: [
            {
                title: "Auto-Triage System",
                desc: "AI automatically flags high-risk patients (\"High Confidence\"), ensuring critical cases are seen first.",
                icon: <Award className="text-green-600" />
            },
            {
                title: "C3-RAG Clinical Assistant",
                desc: "Ask complex medical queries against 500+ guidelines. Get instant, verified answers.",
                icon: <FileText className="text-green-600" />
            },
            {
                title: "Integrated Patient Management",
                desc: "View patient histories, manage appointments, and issue prescriptions in one dashboard.",
                icon: <Share2 className="text-green-600" />
            }
        ],
        steps: [
            "Register your clinic and verify your credentials.",
            "Receive high-fidelity patient reports with Grad-CAM heatmaps.",
            "Manage consults and issue digital prescriptions efficiently."
        ]
    },
    lab: {
        title: "For Labs",
        subtitle: "Streamlined Diagnostics Workflow.",
        heroText: "Process tests faster, verify AI results, and seamlessly share reports with doctors and patients.",
        heroIcon: <FlaskConical className="w-16 h-16 text-white" />,
        color: "purple",
        features: [
            {
                title: "High-Volume Processing",
                desc: "AI pre-analyzes uploaded batches, highlighting regions of interest for faster human verification.",
                icon: <Activity className="text-purple-500" />
            },
            {
                title: "Digital Reporting",
                desc: "Generate professional, standardized PDF reports with one click. No more paper clutter.",
                icon: <FileText className="text-purple-500" />
            },
            {
                title: "Doctor Collaboration",
                desc: "Direct line to referring doctors for clarifications or alerts on critical findings.",
                icon: <Share2 className="text-purple-500" />
            }
        ],
        steps: [
            "Receive test requests digitally from doctors or patients.",
            "Upload raw scan data for AI enhancement and verification.",
            "Release verified reports directly to the secure patient portal."
        ]
    }
};

export default function RolePage() {
    const params = useParams();
    const role = params.role as string;

    // Handle invalid roles
    if (!['patient', 'doctor', 'lab'].includes(role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Role Not Found</h1>
                    <Link href="/" className="text-blue-600 hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    const data = ROLE_DATA[role];
    const isPatient = role === 'patient';
    const isDoctor = role === 'doctor';

    // Theme colors based on role (using CACS standard mostly, but role tints)
    const bgGradient = isPatient ? 'from-blue-600 to-indigo-600' :
        isDoctor ? 'from-green-600 to-emerald-600' :
            'from-purple-600 to-violet-600';

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Navbar Placeholder (Link back home) */}
            <nav className="absolute top-0 w-full p-6 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className={`p-2 rounded-lg bg-white/10 backdrop-blur-md group-hover:bg-white/20 transition`}>
                            <User className="text-white w-6 h-6" />
                        </div>
                        <span className="font-bold text-white text-lg tracking-tight">Smart Eye Care</span>
                    </Link>
                    <Link href="/" className="text-white/80 hover:text-white font-medium text-sm transition-colors">
                        Back to Home
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className={`relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-linear-to-br ${bgGradient}`}>
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] rounded-full bg-black/10 blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-center"
                    >
                        <div className="mb-8 p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl">
                            {data.heroIcon}
                        </div>
                        <h2 className="text-blue-100 font-bold tracking-widest uppercase text-sm mb-4">
                            Smart Eye Care Ecosystem
                        </h2>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
                            {data.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-50 max-w-2xl mx-auto font-light leading-relaxed">
                            {data.heroText}
                        </p>

                        <div className="mt-12">
                            <Link
                                href={`/register?role=${role}`}
                                className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-50 hover:scale-105 transition-all shadow-xl"
                            >
                                Get Started as {role.charAt(0).toUpperCase() + role.slice(1)} <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Features Grid */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Join Us?</h3>
                        <p className="text-gray-500 text-lg">{data.subtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {data.features.map((feature: any, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all"
                            >
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                                <p className="text-gray-500 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Workflow Steps / How it Works */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h3>
                            <div className="space-y-8">
                                {data.steps.map((step: string, idx: number) => (
                                    <div key={idx} className="flex items-start">
                                        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-6 ${isPatient ? 'bg-blue-600' : isDoctor ? 'bg-green-600' : 'bg-purple-600'
                                            }`}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-lg text-gray-700 font-medium pt-1">
                                                {step}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            {/* Role-Specific Mock UI */}
                            {isPatient && (
                                <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h4 className="font-bold text-gray-900">Eye Health Report</h4>
                                            <p className="text-xs text-gray-500">ID: #PT-88392 • Just now</p>
                                        </div>
                                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                            Completed
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-3">
                                                <Activity size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">Right Eye Analysis</div>
                                                <div className="text-xs text-gray-500">No diabetic retinopathy detected.</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-3 bg-red-50 rounded-xl border border-red-100">
                                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mr-3">
                                                <Award size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">Left Eye Alert</div>
                                                <div className="text-xs text-red-600 font-medium">Early signs of Cataract (82%)</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200">
                                            Book Specialist Consultation
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isDoctor && (
                                <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h4 className="font-bold text-gray-900">Priority Triage Queue</h4>
                                            <p className="text-xs text-gray-500">Live Dashboard • 3 High Risk</p>
                                        </div>
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <Activity size={16} className="text-green-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-white border border-red-200 rounded-xl shadow-sm relative">
                                            <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                            <div className="text-xs font-bold text-red-500 mb-1">HIGH CONFIDENCE (98.4%)</div>
                                            <div className="font-bold text-gray-900">Diabetic Retinopathy</div>
                                            <div className="text-xs text-gray-500 mt-2 flex gap-2">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">Patient #9921</span>
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">Male, 64</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl opacity-60">
                                            <div className="text-xs font-bold text-orange-500 mb-1">MODERATE (65%)</div>
                                            <div className="font-bold text-gray-900">Glaucoma Suspect</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {role === 'lab' && (
                                <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-purple-500"></div>
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h4 className="font-bold text-gray-900">Batch Verification</h4>
                                            <p className="text-xs text-gray-500">Batch ID #B-2024-X92</p>
                                        </div>
                                        <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                                            Processing
                                        </div>
                                    </div>
                                    <div className="relative h-48 bg-gray-900 rounded-xl overflow-hidden mb-4 group">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Activity className="text-green-400 w-16 h-16 opacity-50" />
                                        </div>
                                        {/* Scan Lines Overlay */}
                                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-size-[100%_4px]"></div>

                                        <div className="absolute bottom-0 left-0 w-full p-3 bg-black/60 backdrop-blur-sm">
                                            <div className="flex justify-between items-center">
                                                <div className="text-xs text-white">AI Pre-Labeling</div>
                                                <div className="text-xs text-green-400 font-mono">100% COMPLETE</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-2 bg-green-50 text-green-700 font-bold text-xs rounded-lg border border-green-200">
                                            Approve All
                                        </button>
                                        <button className="flex-1 py-2 bg-gray-50 text-gray-600 font-bold text-xs rounded-lg border border-gray-200">
                                            Manual Review
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-12 bg-gray-900 text-gray-400 text-center border-t border-gray-800">
                <p>© 2026 Smart Eye Care. Empowering {role}s everywhere.</p>
            </footer>
        </div>
    );
}
