'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Eye, ShieldCheck, Activity, Brain,
  FileText, Server, Lock, CheckCircle, Smartphone, Cpu
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
    transition: { staggerChildren: 0.2 }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden text-gray-900 font-sans transition-colors">

      {/* 1. Navbar */}
      <nav className="absolute w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Eye size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
                Smart Eye Care
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">Features</Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">How it Works</Link>
              <Link href="/login" className="text-gray-900 font-medium hover:text-blue-600 transition-colors">Log In</Link>
              <Link href="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section with Morphing Blob */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeIn} className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-6 border border-blue-100">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                v2.0 Now Live with Multi-Model AI
              </motion.div>
              <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                Eye Care <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-violet-600">Reimagined</span>
              </motion.h1>
              <motion.p variants={fadeIn} className="text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Early detection of cataracts, glaucoma, and retinopathy using FDA-grade AI algorithms. Connected care for patients, doctors, and labs.
              </motion.p>
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link href="/register" className="flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-600/30">
                  Start Free Analysis <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="#demo" className="flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-gray-700 bg-gray-100/50 hover:bg-gray-100 border border-gray-200 transition-all backdrop-blur-sm">
                  View Demo
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative hidden lg:block"
            >
              {/* Morphing Blobs */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-linear-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-blob mix-blend-multiply filter opacity-70"></div>
              <div className="absolute top-0 -right-4 w-[400px] h-[400px] bg-linear-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-blob animation-delay-2000 mix-blend-multiply filter opacity-70"></div>
              <div className="absolute -bottom-8 right-20 w-[400px] h-[400px] bg-linear-to-r from-yellow-200/30 to-blue-200/30 rounded-full blur-3xl animate-blob animation-delay-4000 mix-blend-multiply filter opacity-70"></div>

              <div className="relative z-10 bg-white/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-2xl skew-y-3 transform hover:rotate-1 transition-transform duration-500">
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">JD</div>
                      <div>
                        <div className="font-bold text-gray-900">John Doe</div>
                        <div className="text-xs text-green-500 font-medium">Analysis Complete</div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">Just now</span>
                  </div>
                  <div className="h-48 bg-gray-900 rounded-xl mb-4 relative overflow-hidden group">
                    {/* Mock Eye Scan UI */}
                    <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/60"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="text-sm font-medium opacity-80">Detected Condition</div>
                      <div className="text-xl font-bold text-red-400">Diabetic Retinopathy</div>
                    </div>
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">High Risk</div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 w-[92%]"></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Confidence Score</span>
                      <span className="font-bold text-gray-900">92%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Feature Cards (High Level) */}
      <section className="py-20 bg-gray-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-blue-600" />}
              title="Instant AI Analysis"
              desc="Get results in seconds using our ensemble of deep learning models."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-8 w-8 text-purple-600" />}
              title="Medically Verified"
              desc="All critical results are flagged for doctor review and lab verification."
            />
            <FeatureCard
              icon={<Smartphone className="h-8 w-8 text-green-600" />}
              title="Accessible Anywhere"
              desc="Access your records, history, and appointments from any device."
            />
            <FeatureCard
              icon={<Eye className="h-8 w-8 text-rose-600" />}
              title="3D & AR View"
              desc="Visualize condition insights in 3D and simulated sight impact in AR (Privacy-focused)."
            />
            <FeatureCard
              icon={<Lock className="h-8 w-8 text-amber-600" />}
              title="Secure Storage"
              desc="Your medical data is encrypted with AES-256 and HIPAA compliant."
            />
            <FeatureCard
              icon={<Activity className="h-8 w-8 text-cyan-600" />}
              title="Smart History"
              desc="Track your eye health progression over time with automated trend analysis."
            />
          </motion.div>
        </div>
      </section>

      {/* 3.b C3-RAG Feature Highlight */}
      <section className="py-20 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                New Architecture
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-white tracking-tight">
                Meet <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">C3-RAG</span>
              </h2>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                The world's first <strong>Clinical Context-Constrained</strong> AI. We resolved the hallucination problem by enforcing a strict
                retrieval protocol against 500+ ophthalmology guidelines.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="p-3 bg-blue-900/30 rounded-lg mr-4 text-blue-400">
                    <Cpu size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Zero-Hallucination Protocol</h4>
                    <p className="text-slate-500 text-sm">A 2-stage verification engine that blocks any unverified medical advice with 99.9% safety rate.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-3 bg-purple-900/30 rounded-lg mr-4 text-purple-400">
                    <Brain size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Adaptive Persona Engine</h4>
                    <p className="text-slate-500 text-sm">Automatically switches complexity levels: simplified for Patients, technical for Doctors.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <Link href="/docs" className="inline-flex items-center text-blue-400 hover:text-blue-300 font-bold transition-colors">
                  Read the Technical Whitepaper <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Abstract Representation of RAG */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-6 md:p-8 overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-50">
                  <Activity className="text-slate-600 w-24 h-24" />
                </div>

                <div className="space-y-4 relative z-10">
                  {/* Chat Bubble 1 (User) */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-none max-w-xs shadow-lg">
                      <p className="text-sm">What does "Drusen" mean in my report?</p>
                    </div>
                  </div>

                  {/* Processing Indicator */}
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 my-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                    <span>Retrieving: AAO Guidelines (v2024)...</span>
                  </div>

                  {/* Chat Bubble 2 (AI) */}
                  <div className="flex justify-start">
                    <div className="bg-slate-700 text-slate-200 px-5 py-3 rounded-2xl rounded-tl-none max-w-sm border border-slate-600 shadow-lg">
                      <div className="flex items-center space-x-2 mb-2 border-b border-slate-600 pb-2">
                        <ShieldCheck size={14} className="text-green-400" />
                        <span className="text-xs font-bold text-green-400">Verified by Medical Guidelines</span>
                      </div>
                      <p className="text-sm">
                        Drusen are tiny yellow deposits under the retina. While common with aging, soft drusen can be an early sign of Age-related Macular Degeneration (AMD).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="py-24 bg-white transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-16 text-gray-900">Why Smart Eye Care?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatBox value="98%" label="Accuracy" />
            <StatBox value="50+" label="Hospitals" />
            <StatBox value="10k+" label="Scans" />
            <StatBox value="24/7" label="Support" />
          </div>
        </div>
      </section>

      {/* 5. How It Works (Visual) */}
      <section id="how-it-works" className="py-24 bg-linear-to-b from-white to-blue-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <Step
              number="01"
              title="Upload Scan"
              desc="Upload your retinal fundus image securely to our cloud."
            />
            <Step
              number="02"
              title="AI Analysis"
              desc="Our ResNet & AlexNet models analyze patterns instantly."
            />
            <Step
              number="03"
              title="Get Report"
              desc="Receive a detailed report with heatmaps and doctor notes."
            />
          </div>
        </div>
      </section>

      {/* 6. Who It's For (Role Cards) */}
      <section className="py-24 bg-white transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Who It's For</h2>
            <p className="mt-4 text-gray-500">Dedicated portals for every user</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <RoleCard
              role="Patients"
              icon={<Eye className="h-6 w-6" />}
              features={['Upload Scans', 'View History', 'Book Doctors']}
              link="/register?role=patient"
              color="blue"
            />
            <RoleCard
              role="Doctors"
              icon={<Activity className="h-6 w-6" />}
              features={['Review Cases', 'Manage Patients', 'Set Availability']}
              link="/register?role=doctor"
              color="green"
            />
            <RoleCard
              role="Labs"
              icon={<Server className="h-6 w-6" />}
              features={['Process Tests', 'Verify Results', 'Issue Reports']}
              link="/register?role=lab"
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* 7. AI You Can Trust */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">AI You Can Trust</h2>
            <p className="text-gray-400 mb-8 text-lg">
              We don't just guess. We use Explanable AI (Grad-CAM) to show you exactly
              where the model is looking. Our system combines ensemble learning with
              human-in-the-loop verification.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-300">
                <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                Ensemble Models (ResNet50 + AlexNet)
              </li>
              <li className="flex items-center text-gray-300">
                <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                Uncertainty Quantification
              </li>
              <li className="flex items-center text-gray-300">
                <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                Heatmap Visualizations
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600 blur-[100px] opacity-20"></div>
            <div className="relative bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex space-x-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="font-mono text-xs text-green-400">
                {`> Initializing Ensemble Mode...`}<br />
                {`> Loading ResNet50... OK`}<br />
                {`> Loading AlexNet... OK`}<br />
                {`> Analyzing Image Hashing...`}<br />
                {`> Prediction: CATARACT (98.4%)`}<br />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Conditions We Detect */}
      <section className="py-24 bg-white transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-16 text-gray-900">Conditions We Detect</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Condition title="Cataracts" />
            <Condition title="Diabetic Retinopathy" />
            <Condition title="Glaucoma" />
            <Condition title="Healthy Eyes" />
          </div>
        </div>
      </section>

      {/* 9. CTA */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">Ready to prioritize your vision?</h2>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
                Join thousands of patients and doctors trusting Smart Eye Care for early detection.
              </p>
              <Link href="/register" className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors shadow-lg">
                Get Started for Free
              </Link>
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          </div>
        </div>
      </section>

      {/* 10. Security & Privacy + Footer */}
      <footer className="bg-gray-50 pt-20 pb-10 border-t border-gray-200 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 p-2 rounded text-white mr-2"><Eye size={20} /></div>
                <span className="text-xl font-bold text-gray-900">Smart Eye Care</span>
              </div>
              <p className="text-gray-500 max-w-sm">
                Advanced AI-powered diagnostics platform committed to making eye care accessible, trusted, and secure.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-500">
                <li><Link href="/roles/patient" className="hover:text-blue-600">For Patients</Link></li>
                <li><Link href="/roles/doctor" className="hover:text-blue-600">For Doctors</Link></li>
                <li><Link href="/roles/lab" className="hover:text-blue-600">For Labs</Link></li>
                <li><Link href="/docs" className="hover:text-blue-600 font-bold text-blue-600">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                <Lock size={16} className="mr-2 text-green-600" /> Security
              </h4>
              <p className="text-xs text-gray-500">
                Your data is encrypted end-to-end. We comply with HIPAA and GDPR standards for medical data privacy.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2026 Smart Eye Care. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/medical-disclaimer" className="hover:text-red-500 font-medium">Medical Disclaimer</Link>
              <Link href="/privacy-policy" className="hover:text-gray-600">Privacy Policy</Link>
              <Link href="/terms-of-service" className="hover:text-gray-600">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-components
function FeatureCard({ icon, title, desc }: any) {
  return (
    <motion.div variants={fadeIn} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 h-full flex flex-col">
      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 grow">{desc}</p>
    </motion.div>
  );
}

function StatBox({ value, label }: any) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
      <div className="text-4xl font-bold text-blue-600 mb-1">{value}</div>
      <div className="text-sm text-gray-500 uppercase font-bold tracking-wider">{label}</div>
    </div>
  );
}

function Step({ number, title, desc }: any) {
  return (
    <div className="text-center relative z-10 bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
      <div className="text-6xl font-extrabold text-gray-100 absolute -top-4 -left-4 -z-10 select-none">{number}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{desc}</p>
    </div>
  );
}

function RoleCard({ role, icon, features, link, color }: any) {
  const bgColors: any = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    green: 'bg-green-50 border-green-100 text-green-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
  };
  const btnColors: any = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${bgColors[color]} bg-opacity-10`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{role}</h3>
      <ul className="space-y-3 mb-8">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center text-gray-500 text-sm">
            <CheckCircle size={16} className={`mr-2 ${color === 'blue' ? 'text-blue-500' : color === 'green' ? 'text-green-500' : 'text-purple-500'}`} />
            {f}
          </li>
        ))}
      </ul>
      <Link href={link} className={`block w-full text-center py-3 text-white font-bold rounded-xl transition-colors ${btnColors[color]}`}>
        Get Started
      </Link>
    </div>
  );
}

function Condition({ title }: any) {
  return (
    <div className="bg-gray-50 p-6 rounded-2xl flex flex-col items-center justify-center hover:bg-white hover:shadow-md transition-all cursor-default border border-transparent hover:border-gray-200">
      <Activity className="text-gray-400 mb-3" />
      <span className="font-bold text-gray-900">{title}</span>
    </div>
  );
}
