'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Server, Database, Code, Cpu, Activity, User,
    ShieldCheck, Eye, FileText, Share2, Layers, Zap
} from 'lucide-react';
import Link from 'next/link';

// --- Variants ---
const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const pipelineVariant = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
        pathLength: 1,
        opacity: 1,
        transition: { duration: 2, ease: "easeInOut" }
    }
};

export default function HowItWorksPage() {
    const [activeTab, setActiveTab] = useState('patient');

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">

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
                            <Link href="/features" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">Features</Link>
                            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">Back to Home</Link>
                            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition-colors shadow-md">
                                Launch App
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 2. Hero Section */}
            <section className="relative pt-32 pb-20 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] translate-y-1/2"></div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                        <span className="inline-flex items-center px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-blue-400 uppercase bg-blue-400/10 rounded-full border border-blue-400/20">
                            <Zap className="h-4 w-4 mr-2" />
                            System Architecture & Workflow
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
                            Under the Hood of <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AI-Driven Ophthalmology</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            A deep dive into how Smart Eye Care orchestrates patients, doctors, labs, and deep learning models into one seamless, secure healthcare ecosystem with advanced 3D & AR visualization.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 3. Interactive System Architecture */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-4">The Ecosystem</h2>
                        <p className="text-gray-500">Live data flow simulation across our micro-services.</p>
                    </div>

                    {/* The Diagram Container */}
                    <div className="relative bg-slate-900 rounded-3xl p-6 overflow-hidden shadow-2xl">
                        {/* Grid Background */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>

                        {/* Animated Gradient Background */}
                        <motion.div
                            className="absolute inset-0 opacity-30"
                            style={{
                                background: 'linear-gradient(90deg, #1e3a8a 0%, #581c87 50%, #1e3a8a 100%)',
                                backgroundSize: '200% 100%'
                            }}
                            animate={{
                                backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />


                        {/* Linear Flow - 4 Cards in a Row */}
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 py-8">

                            {/* Card 1: Frontend */}
                            <div className="w-40">
                                <ArchitectureNode
                                    icon={<Code className="h-6 w-6 text-cyan-400" />}
                                    title="Frontend"
                                    desc="Next.js"
                                    delay={0}
                                />
                            </div>

                            {/* Arrow 1 */}
                            <ArrowConnector color="cyan" delay={0} />

                            {/* Card 2: Backend */}
                            <div className="w-40">
                                <ArchitectureNode
                                    icon={<Server className="h-6 w-6 text-green-400" />}
                                    title="Backend"
                                    desc="Flask API"
                                    delay={0.3}
                                />
                            </div>

                            {/* Arrow 2 */}
                            <ArrowConnector color="blue" delay={0.3} />

                            {/* Card 3: AI Engine */}
                            <div className="w-40">
                                <ArchitectureNode
                                    icon={<Cpu className="h-6 w-6 text-purple-400" />}
                                    title="AI & AR Engine"
                                    desc="PyTorch + Three.js"
                                    delay={0.6}
                                />
                            </div>

                            {/* Arrow 3 */}
                            <ArrowConnector color="purple" delay={0.6} />

                            {/* Card 4: Database */}
                            <div className="w-40">
                                <ArchitectureNode
                                    icon={<Database className="h-6 w-6 text-yellow-400" />}
                                    title="Database"
                                    desc="SQLite"
                                    delay={0.9}
                                />
                            </div>

                        </div>

                    </div>
                </div>
            </section>

            {/* 4. Journey Flow (Tabs) */}
            <section className="py-24 bg-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Complete User Journey</h2>
                        <p className="text-gray-600">See exactly what happens when a user interacts with the system.</p>
                    </div>

                    <div className="flex justify-center mb-12 space-x-4">
                        <TabButton role="patient" active={activeTab} onClick={setActiveTab} label="Patient Flow" icon={<User size={18} />} />
                        <TabButton role="doctor" active={activeTab} onClick={setActiveTab} label="Doctor Flow" icon={<Activity size={18} />} />
                        <TabButton role="lab" active={activeTab} onClick={setActiveTab} label="Lab Flow" icon={<ShieldCheck size={18} />} />
                    </div>

                    <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-blue-100 min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {activeTab === 'patient' && (
                                <motion.div
                                    key="patient"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <FlowStep number="1" title="Registration & Login" desc="Patient creates a secure account with email and gets redirected to their dashboard." />
                                    <FlowStep number="2" title="Upload Scan" desc="Patient uploads a retinal fundus image. The system validates the file format." />
                                    <FlowStep number="3" title="Real-time Analysis" desc="The AI Engine processes the image and returns a condition prediction + heatmap." />
                                    <FlowStep number="4" title="Book Appointment" desc="If critical, the patient can browse doctors and book an appointment instantly." />
                                </motion.div>
                            )}
                            {activeTab === 'doctor' && (
                                <motion.div
                                    key="doctor"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <FlowStep number="1" title="Doctor Dashboard" desc="Doctor logs in to see patients awaiting review and upcoming appointments." />
                                    <FlowStep number="2" title="Review Report" desc="Doctor views the patient's AI report, overlays the heatmap, interacts with the 3D retinal model, and adds expert notes." />
                                    <FlowStep number="3" title="Verify & Share" desc="Doctor verifies the findings. The report status updates to 'Verified' for the patient." />
                                    <FlowStep number="4" title="Manage Schedule" desc="Doctor toggles their availability status (Available/Away) for new patients." />
                                </motion.div>
                            )}
                            {activeTab === 'lab' && (
                                <motion.div
                                    key="lab"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <FlowStep number="1" title="Receive Request" desc="Lab Admin sees a new test request from a patient or doctor." />
                                    <FlowStep number="2" title="Conduct Test" desc="Lab technician performs the scan and uploads the high-res images to the portal." />
                                    <FlowStep number="3" title="Quality Gate" desc="System auto-checks image quality. Lab verifies confidence score before releasing." />
                                    <FlowStep number="4" title="Release Report" desc="Final report is digitally signed and pushed to both Patient and Doctor portals." />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* 5. Tech Stack Grid */}
            <section className="py-24 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-16">Technology Stack</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <TechCard title="Next.js 14" desc="React Framework" color="bg-gray-800" />
                        <TechCard title="Tailwind CSS" desc="Utility-First Styling" color="bg-blue-900" />
                        <TechCard title="Framer Motion" desc="Animation Library" color="bg-purple-900" />
                        <TechCard title="Python Flask" desc="Backend API" color="bg-gray-700" />
                        <TechCard title="PyTorch" desc="Deep Learning" color="bg-orange-900" />
                        <TechCard title="SQLite" desc="Relational DB" color="bg-blue-800" />
                        <TechCard title="Chart.js" desc="Data Visualization" color="bg-pink-900" />
                        <TechCard title="Chart.js" desc="Data Visualization" color="bg-pink-900" />
                        <TechCard title="Three.js" desc="3D Rendering" color="bg-indigo-900" />
                    </div>
                </div>
            </section>

            {/* 6. AI & Machine Learning Details */}
            <section className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="w-full md:w-1/2">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-2xl">
                                <h3 className="text-2xl font-bold mb-4">The AI Engine</h3>
                                <div className="space-y-6">
                                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                        <div className="text-xs font-mono text-blue-200 mb-1">MODEL 1</div>
                                        <div className="font-bold text-lg">ResNet-50</div>
                                        <div className="text-sm opacity-80">Deep Residual Learning for complex feature extraction.</div>
                                    </div>
                                    <div className="flex justify-center text-2xl font-bold">+</div>
                                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                        <div className="text-xs font-mono text-blue-200 mb-1">MODEL 2</div>
                                        <div className="font-bold text-lg">AlexNet</div>
                                        <div className="text-sm opacity-80">Classic CNN architecture for robust pattern recognition.</div>
                                    </div>
                                    <div className="border-t border-white/20 pt-4 mt-6">
                                        <div className="font-bold mb-2">Techniques Used:</div>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-blue-500 rounded-full text-xs font-bold">Ensemble Learning</span>
                                            <span className="px-3 py-1 bg-purple-500 rounded-full text-xs font-bold">Grad-CAM (XAI)</span>
                                            <span className="px-3 py-1 bg-green-500 rounded-full text-xs font-bold">Uncertainty UQ</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Explainable AI (XAI)</h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                We don't just give a diagnosis; we show you <strong>why</strong>.
                                Using Gradient-weighted Class Activation Mapping (Grad-CAM), we generate heatmaps
                                that highlight the exact regions of the retina influencing the model's decision.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <div className="bg-green-100 p-2 rounded-lg mr-4 text-green-600 mt-1"><ShieldCheck size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Builds Trust</h4>
                                        <p className="text-sm text-gray-500">Doctors can verify if the AI is looking at the lesion or an artifact.</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <div className="bg-blue-100 p-2 rounded-lg mr-4 text-blue-600 mt-1"><Layers size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Uncertainty Quantification</h4>
                                        <p className="text-sm text-gray-500">The system flags low-confidence predictions for manual review.</p>
                                        <p className="text-sm text-gray-500">The system flags low-confidence predictions for manual review.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-24 bg-gray-50 border-t border-gray-200 text-center">
                <h2 className="text-3xl font-bold mb-8 text-slate-900">Ready to see it in action?</h2>
                <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                    Start Using Smart Eye Care
                </Link>
            </section>

            {/* Main Footer */}
            <footer className="py-12 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm font-medium">
                    <div>© 2026 Smart Eye Care Lab. All rights reserved.</div>
                    <div className="flex space-x-6 mt-6 md:mt-0">
                        <Link href="/medical-disclaimer" className="hover:text-red-500 font-medium">Medical Disclaimer</Link>
                        <Link href="/docs" className="hover:text-blue-600 font-bold">Documentation</Link>
                        <Link href="/privacy-policy" className="hover:text-gray-600">Privacy Policy</Link>
                        <Link href="/terms-of-service" className="hover:text-gray-600">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// --- Sub Components ---

function ArchitectureNode({ icon, title, desc, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors relative z-20 shadow-lg backdrop-blur-sm"
        >
            <div className="mb-2 bg-slate-700/50 p-3 rounded-full">{icon}</div>
            <h3 className="text-white font-bold text-sm mb-1 text-center whitespace-nowrap">{title}</h3>
            <p className="text-slate-400 text-xs text-center leading-tight">{desc}</p>
        </motion.div>
    );
}

function ArrowConnector({ color, delay }: { color: string; delay: number }) {
    const gradients: Record<string, { from: string; to: string }> = {
        cyan: { from: '#22d3ee', to: '#3b82f6' },
        blue: { from: '#3b82f6', to: '#a855f7' },
        purple: { from: '#a855f7', to: '#eab308' }
    };

    const grad = gradients[color] || gradients.cyan;

    return (
        <div className="hidden md:flex items-center relative z-0">
            <svg width="60" height="40" viewBox="0 0 60 40" className="overflow-visible">
                <defs>
                    <linearGradient id={`arrow-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={grad.from} />
                        <stop offset="100%" stopColor={grad.to} />
                    </linearGradient>
                    <filter id={`glow-${color}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Background Dotted Line (Static & Faint) */}
                <line
                    x1="0" y1="20" x2="50" y2="20"
                    stroke={grad.from}
                    strokeWidth="2"
                    strokeDasharray="1, 8"
                    strokeLinecap="round"
                    opacity="0.3"
                />

                {/* Animated Dotted Arrow line */}
                <motion.line
                    x1="0" y1="20" x2="50" y2="20"
                    stroke={`url(#arrow-${color})`}
                    strokeWidth="4"
                    strokeDasharray="1, 8"
                    strokeLinecap="round"
                    filter={`url(#glow-${color})`}
                    initial={{ strokeDashoffset: 36, opacity: 0 }}
                    animate={{
                        strokeDashoffset: 0,
                        opacity: 1
                    }}
                    transition={{
                        strokeDashoffset: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        },
                        opacity: { duration: 0.8, delay }
                    }}
                />

                {/* Arrow head */}
                <motion.polygon
                    points="50,15 60,20 50,25"
                    fill={grad.to}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: delay + 0.5 }}
                />
            </svg>
        </div>
    );
}

function ConnectionLine({ delay }: any) {
    return null; // Deprecated
}

function DataPacket({ delay }: any) {
    return null; // Deprecated
}

function TabButton({ role, active, onClick, label, icon }: any) {
    const isActive = active === role;
    return (
        <button
            onClick={() => onClick(role)}
            className={`flex items-center px-6 py-3 rounded-full font-bold transition-all ${isActive
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
        >
            <span className="mr-2">{icon}</span>
            {label}
        </button>
    );
}

function FlowStep({ number, title, desc }: any) {
    return (
        <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-6 mt-1">
                {number}
            </div>
            <div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">{title}</h4>
                <p className="text-gray-600 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function TechCard({ title, desc, color }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`${color} p-6 rounded-xl border border-white/10`}
        >
            <h4 className="font-bold text-lg mb-1">{title}</h4>
            <p className="text-white/60 text-sm">{desc}</p>
        </motion.div>
    );
}
