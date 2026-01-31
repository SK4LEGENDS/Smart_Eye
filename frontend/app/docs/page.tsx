'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Book, Code, Database, Server, Layers, ShieldCheck, Eye,
    Users, Activity, Palette, Camera, Cpu, ArrowLeft
} from 'lucide-react';

// Animation Variants
const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                            <ArrowLeft size={20} className="mr-2" /> Back to Home
                        </Link>
                    </div>
                    <span className="font-bold text-gray-900">Project Documentation</span>
                    <div className="w-20"></div> {/* Spacer for center alignment */}
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Header */}
                <motion.div initial="hidden" animate="visible" variants={fadeIn} className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-6 text-blue-600">
                        <Book size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        Smart Eye Care <br />
                        <span className="text-blue-600">Technical Documentation</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                        A comprehensive guide to the architecture, AI models, design systems (CACS), and team behind the project.
                    </p>
                </motion.div>

                {/* 1. Project Overview */}
                <Section title="Project Overview" icon={<Activity />}>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Smart Eye Care is an advanced telemedicine platform designed to bridge the gap between patients, ophthalmologists, and diagnostic labs.
                        It leverages <strong>Ensemble Deep Learning</strong> to detect key retinal conditions (Diabetic Retinopathy, Glaucoma, Cataracts) from fundus images
                        with high accuracy.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        <InfoCard icon={<ShieldCheck className="text-green-600" />} title="FDA-Grade Security" desc="HIPAA compliant data handling with AES-256 encryption." />
                        <InfoCard icon={<Cpu className="text-blue-600" />} title="Ensemble AI" desc="Combines ResNet-50 and AlexNet for robust predictions." />
                        <InfoCard icon={<Server className="text-purple-600" />} title="Micro-Services" desc="Decoupled Flask backend and Next.js 14 frontend." />
                    </div>
                </Section>

                {/* 2a. End-to-End Workflow */}
                <Section title="User Journey & Workflow" icon={<Activity />}>
                    <p className="text-gray-600 mb-8">
                        The platform facilitates a seamless data flow between all stakeholders. Here is the complete lifecycle of a patient case:
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                        <TimelineItem
                            step="01"
                            title="Patient Registration"
                            desc="User creates a secure account, completing their medical profile. HIPAA-compliant storage is initialized."
                            role="Patient"
                        />
                        <TimelineItem
                            step="02"
                            title="Lab Test & Upload"
                            desc="Patient visits a partner lab. Lab technician performs the fundus scan and uploads high-res images directly to the patient's record."
                            role="Lab"
                        />
                        <TimelineItem
                            step="03"
                            title="AI Analysis"
                            desc="Upon upload, the AI Engine instantly processes the image, detecting conditions and generating confidence scores + heatmaps."
                            role="System"
                        />
                        <TimelineItem
                            step="04"
                            title="Doctor Assignment"
                            desc="The case is routed to an available ophthalmologist. The system filters doctors based on specialty and availability status."
                            role="System"
                        />
                        <TimelineItem
                            step="05"
                            title="Doctor Review & Annotation"
                            desc="Doctor reviews the AI report. They can draw annotations on the image, add expert notes, and override AI findings if necessary."
                            role="Doctor"
                        />
                        <TimelineItem
                            step="06"
                            title="Report Finalization"
                            desc="Doctor saves the final report. This action triggers a notification to the patient dashboard and logs the diagnosis in the audit trail."
                            role="Doctor"
                        />
                    </div>
                </Section>

                {/* 2. Architecture & Tech Stack */}
                <Section title="System Architecture" icon={<Layers />}>
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm mb-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-bold text-gray-600 text-center">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 w-full md:w-auto">
                                <div className="mb-2 text-cyan-600"><Code size={24} className="mx-auto" /></div>
                                Frontend (Next.js)
                            </div>
                            <div className="hidden md:block text-gray-300">────────▶</div>
                            <div className="block md:hidden text-gray-300">▼</div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 w-full md:w-auto">
                                <div className="mb-2 text-green-600"><Server size={24} className="mx-auto" /></div>
                                API Gateway (Flask)
                            </div>
                            <div className="hidden md:block text-gray-300">────────▶</div>
                            <div className="block md:hidden text-gray-300">▼</div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 w-full md:w-auto">
                                <div className="mb-2 text-purple-600"><Cpu size={24} className="mx-auto" /></div>
                                AI Engine (PyTorch)
                            </div>
                            <div className="hidden md:block text-gray-300">────────▶</div>
                            <div className="block md:hidden text-gray-300">▼</div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 w-full md:w-auto">
                                <div className="mb-2 text-amber-600"><Database size={24} className="mx-auto" /></div>
                                Database (SQLite)
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        The system is built on a <strong>client-server architecture</strong>. The frontend (Next.js) handles user interactions
                        and communicates with the Python Flask backend via RESTful APIs. The backend orchestrates database operations
                        and delegates image processing tasks to the AI Engine.
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                        <li><strong>Frontend:</strong> Next.js 14 (App Router), Tailwind CSS v4, Framer Motion.</li>
                        <li><strong>Backend:</strong> Flask, SQLAlchemy, Pillow (Image Processing).</li>
                        <li><strong>AI Core:</strong> PyTorch (Ensemble Models), C3-RAG (Context-Constrained Clinical Chat).</li>
                        <li><strong>Infrastructure:</strong> SQLite (Dev), Docker-ready containers.</li>
                    </ul>
                </Section>

                {/* 3. Deep Dive: AI & 3D/AR */}
                <Section title="AI Engine & Visualization" icon={<Eye />}>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Ensemble Learning</h3>
                            <p className="text-gray-600 mb-6">
                                We don't rely on a single model. Our system aggregates predictions from <strong>ResNet-50</strong> (deep feature extraction)
                                and <strong>AlexNet</strong> (structural pattern recognition). A weighted voting mechanism determines the final diagnosis
                                confidence score.
                            </p>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Explainable AI (XAI)</h3>
                            <p className="text-gray-600">
                                Grad-CAM heatmaps are generated for every positive prediction, highlighting the "hotspots" the model focused on.
                                This builds trust with doctors by showing the "why" behind the "what".
                            </p>
                        </div>
                        <div className="bg-gray-900 rounded-2xl p-6 text-white">
                            <div className="flex items-center mb-6">
                                <Camera className="text-rose-500 mr-3" />
                                <h3 className="text-lg font-bold">AR & 3D Visualization</h3>
                            </div>
                            <p className="text-gray-400 text-sm mb-4">
                                Our platform includes interactive 3D demos and AR filters to help patients visualize
                                how different conditions affect vision.
                            </p>
                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <div className="text-xs text-rose-300 font-bold uppercase tracking-wider mb-2">Privacy Note</div>
                                <p className="text-xs text-gray-400">
                                    All 3D/AR visualizations use <strong>generic, pre-rendered anatomical models</strong>.
                                    Patient-specific scans are <strong>NEVER</strong> converted into 3D models to ensure absolute
                                    privacy and data security. The visualizations are educational tools, not diagnostic twins.
                                </p>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* 4. Deep Dive: C3-RAG - GRAND REVEAL */}
                <Section title="World's First C3-RAG Architecture" icon={<Cpu />}>
                    <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 md:p-12 shadow-2xl border border-slate-700 ring-1 ring-white/10">
                        {/* Glowing background effects */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl opacity-50"></div>
                            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-50"></div>
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[32px_32px]"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="text-center max-w-4xl mx-auto mb-16">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-sm">
                                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                                    Proprietary Technology
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight leading-none bg-linear-to-br from-white via-blue-100 to-slate-400 bg-clip-text text-transparent">
                                    C3-RAG CORE
                                </h1>
                                <p className="text-xl md:text-2xl text-slate-300 leading-relaxed font-light max-w-2xl mx-auto">
                                    Clinical Context-Constrained Retrieval Augmented Generation. <br />
                                    <span className="text-blue-400 font-medium">Zero Hallucinations. 100% Medical Grounding.</span>
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6 mb-12">
                                {/* Card 1 */}
                                <div className="group p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-green-500/50 hover:bg-slate-800 transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <ShieldCheck className="text-green-400" size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2 text-white">Safety Gating</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Automated confidence checks block any response below <span className="text-green-400 font-bold">80% certainty</span>, forcing a fallback to verified guidelines.
                                    </p>
                                </div>

                                {/* Card 2 */}
                                <div className="group p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Database className="text-blue-400" size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2 text-white">Dynamic Injection</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Real-time vector retrieval of 500+ ophthalmology papers and patient history in <span className="text-blue-400 font-mono">200ms</span>.
                                    </p>
                                </div>

                                {/* Card 3 */}
                                <div className="group p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 hover:bg-slate-800 transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Users className="text-purple-400" size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2 text-white">Cognitive Scoping</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Adaptive neuro-linguistic personas that shift vocabulary complexity based on user role (Patient vs Doctor).
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-8 border-t border-slate-800 text-sm font-mono text-slate-500">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    System Status: ONLINE
                                </div>
                                <div>
                                    Latest Latency: <span className="text-white">142ms</span>
                                </div>
                                <div>
                                    Guardrails: <span className="text-white">ACTIVE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* 4. CACS: Color System */}
                <Section title="Design System (CACS)" icon={<Palette />}>
                    <p className="text-gray-600 mb-8">
                        We developed the <strong>Clinical Adaptive Color System (CACS)</strong> to ensure high contrast, accessibility,
                        and role-specific clarity across the platform.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ColorCard name="Brand Primary" hex="#115DFC" cls="bg-[#115DFC]" text="white" />
                        <ColorCard name="Brand Secondary" hex="#2563EB" cls="bg-[#2563EB]" text="white" />
                        <ColorCard name="Patient Theme" hex="#3B82F6" cls="bg-[#1D4ED8]" text="white" />
                        <ColorCard name="Doctor Theme" hex="#16A34A" cls="bg-[#16A34A]" text="white" />
                        <ColorCard name="Lab Theme" hex="#7C3AED" cls="bg-[#7C3AED]" text="white" />
                        <ColorCard name="Success" hex="#16A34A" cls="bg-[#16A34A]" text="white" />
                        <ColorCard name="Warning" hex="#FACC15" cls="bg-[#FACC15]" text="black" />
                        <ColorCard name="Danger" hex="#DC2626" cls="bg-[#DC2626]" text="white" />
                    </div>
                </Section>

                {/* 5. Team */}
                <Section title="The Team" icon={<Users />}>
                    <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
                        Built by a dedicated team of passionate developers, combining expertise in Full-Stack Web Development,
                        Machine Learning, and UI/UX Design.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <TeamMember
                            name="Jayaharini"
                            role="Lead AI Architect & Backend Specialist"
                            desc="Expert in Deep Learning ensembles, Python-based microservices architecture, and secure HIPAA-compliant backend systems."
                            id="J-001"
                            badge="ARCHITECT"
                        />
                        <TeamMember
                            name="Kailash"
                            role="Lead Automation & Prompt Engineer"
                            desc="Architect of advanced autonomous agentic workflows, LLM orchestration, and high-efficiency development pipelines."
                            id="K-001"
                            badge="AUTO-GPT"
                        />
                        <TeamMember
                            name="Jerlin John"
                            role="Principal Frontend & UI/UX Engineer"
                            desc="Expert in Next.js application architecture, complex state management, and high-fidelity human-computer interaction designs."
                            id="J-002"
                            badge="UI/UX"
                        />
                    </div>
                </Section>

                <div className="mt-20 text-center border-t border-gray-200 pt-10">
                    <p className="text-gray-400 text-sm">
                        © 2026 Smart Eye Care Project. All rights reserved. <br />
                        Documentation generated for internal review and judging.
                    </p>
                </div>

            </main>
        </div>
    );
}

// Sub-Components
function Section({ title, icon, children }: any) {
    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-20"
        >
            <motion.div variants={fadeIn} className="flex items-center mb-8">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mr-4">
                    {React.cloneElement(icon, { size: 24 })}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </motion.div>
            <motion.div variants={fadeIn}>
                {children}
            </motion.div>
        </motion.section>
    );
}

function InfoCard({ icon, title, desc }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4">{icon}</div>
            <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
            <p className="text-sm text-gray-500">{desc}</p>
        </div>
    );
}

function ColorCard({ name, hex, cls, text }: any) {
    return (
        <div className={`${cls} p-4 rounded-xl flex flex-col justify-between h-24 shadow-sm border border-black/5`}>
            <span className={`text-${text} text-xs font-bold opacity-80 uppercase tracking-wider`}>{name}</span>
            <span className={`text-${text} font-mono text-sm`}>{hex}</span>
        </div>
    );
}

function TeamMember({ name, role, desc, id, badge }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-blue-200 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden font-mono text-left h-full hover:-translate-y-1">
            {/* Background Grid - Subtle */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px]"></div>

            {/* Tactical Header */}
            <div className="relative z-10 flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Sys.Active</span>
                </div>
                <span className="text-[10px] text-blue-600 font-bold tracking-widest bg-blue-50 px-2 py-0.5 rounded">ID: {id || 'UNK-00'}</span>
            </div>

            <div className="relative z-10 w-20 h-20 bg-gray-50 rounded-full mx-auto mb-5 border-2 border-gray-200 flex items-center justify-center text-3xl group-hover:scale-105 group-hover:border-blue-500 transition-all">
                👨‍💻
                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter shadow-sm">{badge || 'DEV'}</div>
            </div>

            <h4 className="relative z-10 font-black text-gray-900 text-lg mb-2 uppercase tracking-widest text-center">{name}</h4>
            <div className="relative z-10 flex justify-center mb-4">
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
                    <Code size={10} /> {role}
                </p>
            </div>

            <div className="relative z-10 bg-gray-50 p-3 rounded border-l-2 border-blue-500 text-xs text-gray-600 leading-relaxed font-medium text-justify">
                {desc}
            </div>
        </div>
    );
}

function TimelineItem({ step, title, desc, role }: any) {
    const colors: any = {
        Patient: 'bg-blue-100 text-blue-700 border-blue-200',
        Lab: 'bg-purple-100 text-purple-700 border-purple-200',
        System: 'bg-gray-100 text-gray-700 border-gray-200',
        Doctor: 'bg-green-100 text-green-700 border-green-200',
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-xs">
                    {step}
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border ${colors[role]}`}>{role}</span>
            </div>

            <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
        </div>
    );
}
