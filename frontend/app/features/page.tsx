"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Zap,
    Search,
    Shield,
    Activity,
    Users,
    FlaskConical,
    Microscope,
    Cpu,
    Database,
    CloudIcon,
    ArrowRight,
    CheckCircle2,
    Calendar,
    Smartphone,
    Globe,
    BarChart3,
    Eye
} from 'lucide-react';
import Link from 'next/link';

const features = [
    {
        title: "AI-Powered Diagnostics",
        desc: "Instant analysis of retinal fundus images using ResNet-50 deep learning model with over 94% accuracy.",
        icon: <Cpu className="h-6 w-6 text-blue-500" />,
        details: [
            "Real-time DR detection",
            "Multi-stage grading (Mild, Moderate, Severe)",
            "Automated quality check",
            "Confidence score metrics"
        ]
    },
    {
        title: "Visual Health Heatmaps",
        desc: "Generates interpretable saliency maps (Grad-CAM) showing exactly where the AI identified abnormalities.",
        icon: <Activity className="h-6 w-6 text-purple-500" />,
        details: [
            "Pathology localization",
            "Explainable AI interface",
            "Overlay toggle on original scan",
            "Doctor annotation support"
        ]
    },
    {
        title: "Smart Lab Dashboard",
        desc: "A full-suite command center for diagnostic labs to manage large-scale screening workflows efficiently.",
        icon: <FlaskConical className="h-6 w-6 text-green-500" />,
        details: [
            "Batched request management",
            "Verification quality gate",
            "Lab technician portal",
            "Automated report generation"
        ]
    },
    {
        title: "Clinical Doctor Portal",
        desc: "Specialized tools for ophthalmologists to review, verify, and digitally sign AI-generated reports.",
        icon: <Users className="h-6 w-6 text-indigo-500" />,
        details: [
            "Unified patient records",
            "History trend analysis",
            "Secured messaging",
            "Digital verification workflow"
        ]
    },
    {
        title: "Secure Health Vault",
        desc: "End-to-end encrypted storage for medical data ensuring HIPAA and GDPR compliance across the system.",
        icon: <Shield className="h-6 w-6 text-red-500" />,
        details: [
            "JWT-based session security",
            "Immutable audit logs",
            "Data encryption at rest",
            "Role-based access control"
        ]
    },
    {
        title: "Appointment Scheduler",
        desc: "Seamless bridge between screening and treatment with integrated doctor booking and lab visit scheduling.",
        icon: <Calendar className="h-6 w-6 text-cyan-500" />,
        details: [
            "Sync with doctor calendars",
            "Auto-reminders via system",
            "Lab visit slots management",
            "Virtual queue tracking"
        ]
    }
];

const futureEnhancements = [
    {
        title: "Mobile Screening App",
        desc: "iOS & Android apps for on-the-go patient checkups and instant notification alerts.",
        icon: <Smartphone className="h-6 w-6" />,
        time: "Q3 2026"
    },
    {
        title: "AI Multi-Modal 2.0",
        desc: "Integrating OCT scans and patient history data for even higher diagnostic precision.",
        icon: <Zap className="h-6 w-6" />,
        time: "Q4 2026"
    },
    {
        title: "Global Health API",
        desc: "Opening our diagnostic engine for third-party clinic and hospital integrations.",
        icon: <Globe className="h-6 w-6" />,
        time: "2027"
    },
    {
        title: "Advanced Analytics",
        desc: "Population-scale health trends and predictive epidemiology for regional health boards.",
        icon: <BarChart3 className="h-6 w-6" />,
        time: "2027"
    }
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* 1. Navbar (Simple) */}
            <nav className="absolute w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
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
                        <div className="flex items-center space-x-6">
                            <Link href="/how-it-works" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">How it Works</Link>
                            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">Back to Home</Link>
                            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition-colors shadow-md">
                                Launch App
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 2. Header / Hero */}
            <section className="relative pt-32 pb-20 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-blue-400 uppercase bg-blue-400/10 rounded-full border border-blue-400/20">
                            <Zap className="h-4 w-4 mr-2" />
                            The Capabilities
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
                            Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Diagnostic Suite</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-slate-400 leading-relaxed">
                            Discover the powerful features that make Smart Eye Care the most complete platform for AI-driven ophthalmology and screening management.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
                            >
                                <div className="mb-6 bg-gray-50 p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                                <p className="text-gray-600 mb-8 leading-relaxed italic">
                                    "{feature.desc}"
                                </p>
                                <ul className="space-y-3">
                                    {feature.details.map((detail, dIdx) => (
                                        <li key={dIdx} className="flex items-center text-sm font-medium text-slate-700">
                                            <CheckCircle2 className="h-4 w-4 text-blue-500 mr-3" />
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technical Deep Dive */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl font-bold text-slate-900 mb-8 leading-tight">
                                How it Works: <br />
                                <span className="text-blue-600">The Anatomy of a Diagnosis</span>
                            </h2>
                            <div className="space-y-8">
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">1</div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2 text-slate-900">Image Pre-processing</h4>
                                        <p className="text-gray-600">Our system automatically resizes, normalizes and enhances the contrast of fundus images to ensure optimal feature visibility for the AI model.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xl">2</div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2 text-slate-900">Feature Extraction (ResNet)</h4>
                                        <p className="text-gray-600">The image passes through 50 layers of deep residual learning. It looks for micro-aneurysms, hemorrhages, and exudates that indicate disease.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xl">3</div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2 text-slate-900">Grading & Explainability</h4>
                                        <p className="text-gray-600">The model outputs a categorical result and generates a heatmap. This heatmap guides doctors to focus on the most suspicious clinical areas.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4">
                                    <Database className="text-blue-500/20 w-32 h-32" />
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center text-white/40 text-xs font-mono mb-4 pb-4 border-b border-white/10 uppercase tracking-widest">
                                        <span>Diagnostic-Server-780</span>
                                        <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div> Active</span>
                                    </div>
                                    <div className="font-mono text-sm text-blue-300">
                                        &gt; Receiving image_payload_v4.jpg <br />
                                        &gt; Applying CLAHE enhancement... [DONE] <br />
                                        &gt; Loading pre-trained weights [ResNet50_V2] <br />
                                        &gt; Analysis in progress (482ms) <br />
                                        &gt; <span className="text-green-400">Class: "Moderate NPDR"</span> <br />
                                        &gt; <span className="text-green-400">Confidence: 98.4%</span> <br />
                                        &gt; Generating Grad-CAM Map...
                                    </div>
                                </div>
                            </div>
                            {/* Floating Decorative Card - Updated with relevant content */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-6 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-blue-50 z-20"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg"><Zap className="text-blue-600 h-5 w-5" /></div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Precision</div>
                                        <div className="text-lg font-black text-slate-900">98.4%</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Future Roadmap */}
            <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black mb-6">Future Enhancements</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">The journey doesn't end here. We're constantly evolving to provide the best eye care technology globally.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {futureEnhancements.map((item, idx) => (
                            <div key={idx} className="relative group">
                                <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 group-hover:bg-white/10 transition-colors h-full">
                                    <div className="text-blue-400 mb-6">{item.icon}</div>
                                    <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">{item.time}</div>
                                    <h4 className="text-xl font-bold mb-4">{item.title}</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 p-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[40px] text-center">
                        <h3 className="text-3xl font-black mb-6">Ready to see the future of clinical diagnosis?</h3>
                        <Link href="/register">
                            <button className="bg-white text-blue-600 px-10 py-4 rounded-full font-black hover:scale-105 transition-transform flex items-center mx-auto shadow-xl">
                                Join the Network <ArrowRight className="ml-2 h-5 w-5" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-gray-50 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm font-medium">
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
