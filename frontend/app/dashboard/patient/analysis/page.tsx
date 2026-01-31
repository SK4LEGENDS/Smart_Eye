'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, Box, Maximize2, X, ChevronLeft, Play, Sparkles, Camera, CameraOff, Eye, Loader2 } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows, Float, PresentationControls, Stage, Center } from '@react-three/drei';

const RealisticEyeModel = () => {
    // Load the 33MB / 4K texture model from public assets
    const { scene } = useGLTF('/assets/3d/realistic_human_eye.glb');

    return (
        <primitive object={scene} />
    );
};



// Fallback for 3D loading
const ModelLoader = () => (
    <div className="flex flex-col items-center justify-center gap-4 text-blue-600">
        <Loader2 className="animate-spin" size={40} />
        <div className="text-[10px] font-black tracking-widest uppercase">Loading 4K Digital Twin...</div>
    </div>
);

// --- Shared Utility Components ---

const HUDCard = ({ title, value, color, align = 'left' }: any) => {
    const borderColors: any = {
        blue: 'border-l-blue-500',
        cyan: 'border-l-cyan-500',
    };
    const textColors: any = {
        blue: 'text-blue-600',
        cyan: 'text-cyan-600',
    };

    return (
        <div className={`p-4 bg-white border-l-4 ${borderColors[color]} rounded-xl shadow-sm min-w-[160px] transition-all hover:shadow-md`}>
            <div className="text-[9px] font-black text-gray-400 tracking-wider mb-1 uppercase">{title}</div>
            <div className={`font-mono text-sm font-bold ${textColors[color]}`}>{value}</div>
        </div>
    );
};

const ControlItem = ({ icon, title, status }: any) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-4 text-gray-900">
            <div className="text-blue-500 bg-blue-50 p-2 rounded-lg">{icon}</div>
            <div className="text-xs font-bold">{title}</div>
        </div>
        <div className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md uppercase tracking-tighter">{status}</div>
    </div>
);

const FilterToggle = ({ title, active, onClick, icon }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-md ${active ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-900'}`}
    >
        <div className="flex items-center gap-4">
            <div className={`${active ? 'text-white' : 'text-blue-500 bg-blue-50'} p-2 rounded-lg`}>{icon}</div>
            <div className="text-xs font-bold text-left">{title}</div>
        </div>
        {active && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
    </button>
);

// --- Visual & Simulation Components ---

// Static 2D version for previews
const ThreeDEyePreview = () => (
    <motion.div
        className="relative w-48 h-48 mx-auto mb-8 cursor-pointer"
        whileHover={{ scale: 1.05 }}
    >
        <motion.div
            className="absolute inset-0"
            animate={{
                y: [0, -10, 0],
                rotateZ: [0, 5, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <circle cx="50" cy="50" r="45" fill="url(#eyeGlow)" opacity="0.4" />
                <ellipse cx="50" cy="50" rx="45" ry="32" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="22" fill="#3B82F6" />
                <motion.circle
                    cx="50" cy="50" r="18"
                    fill="url(#irisGradient)"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />
                <circle cx="50" cy="50" r="10" fill="#0F172A" />
                <motion.circle
                    cx="44" cy="44" r="4"
                    fill="white"
                    opacity="0.8"
                    animate={{ x: [-2, 2, -2], y: [-1, 1, -1] }}
                    transition={{ duration: 5, repeat: Infinity }}
                />

                <defs>
                    <radialGradient id="eyeGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 50) rotate(90) scale(45)">
                        <stop stopColor="#60A5FA" />
                        <stop offset="1" stopColor="#60A5FA" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="irisGradient" x1="50" y1="28" x2="50" y2="72" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#60A5FA" />
                        <stop offset="0.5" stopColor="#2563EB" />
                        <stop offset="1" stopColor="#1E40AF" />
                    </linearGradient>
                </defs>
            </svg>
        </motion.div>
    </motion.div>
);

const ARTheatre = ({ isOpen, onClose, type }: { isOpen: boolean, onClose: () => void, type: 'ar' | 'twin' }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [condition, setCondition] = useState<'none' | 'glaucoma' | 'cataract' | 'blur'>('none');
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        if (cameraActive && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Video play failed:", e));
        }
    }, [cameraActive, stream]);

    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            return;
        }
        if (type === 'ar') startCamera();
        return () => stopCamera();
    }, [isOpen, type]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            setStream(mediaStream);
            setCameraActive(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraActive(false);
    };

    const getFilterStyle = (): React.CSSProperties => {
        switch (condition) {
            case 'glaucoma': return { filter: 'none' }; // Handled by CSS shadow
            case 'cataract': return { backdropFilter: 'blur(10px) contrast(0.5) brightness(1.2)' };
            case 'blur': return { backdropFilter: 'blur(8px)' };
            default: return { backdropFilter: 'none' };
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 bg-black/40 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full h-full max-w-7xl bg-white md:rounded-[40px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-gray-100 flex flex-col"
                    >
                        {/* Theatre Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 z-50 bg-white/80 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Maximize2 size={20} /></div>
                                <div>
                                    <div className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Immersive Lab</div>
                                    <div className="text-gray-900 font-bold">{type === 'ar' ? 'Vision AR Theatre' : 'Digital Twin Reconstruction'}</div>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* Simulation Stage */}
                            <div className="relative flex-1 bg-white flex items-center justify-center overflow-hidden">
                                {type === 'ar' && (
                                    <>
                                        {cameraActive ? (
                                            <div className="relative w-full h-full flex items-center justify-center bg-black">
                                                <video
                                                    ref={videoRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    className="w-full h-full object-cover scale-x-[-1] min-w-full min-h-full"
                                                />
                                                <div
                                                    className="absolute inset-0 pointer-events-none transition-all duration-700 overflow-hidden z-20"
                                                    style={getFilterStyle()}
                                                >
                                                    {condition === 'glaucoma' && (
                                                        <div className="absolute inset-0 bg-transparent shadow-[inset_0_0_200px_120px_rgba(0,0,0,0.95)]"></div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-12 bg-gray-50 rounded-[32px] border border-gray-100 space-y-6">
                                                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-400">
                                                    <CameraOff size={32} />
                                                </div>
                                                <h3 className="text-gray-900 font-bold text-xl mb-2">Camera Access Required</h3>
                                                <button
                                                    onClick={startCamera}
                                                    className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-blue-700 shadow-xl shadow-blue-500/20"
                                                >
                                                    Enable Camera
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {type === 'twin' && (
                                    <div className="relative w-full h-full bg-white min-h-[400px] flex items-center justify-center">
                                        <Suspense fallback={<ModelLoader />}>
                                            <Canvas
                                                shadows
                                                camera={{ position: [0, 0, 10], fov: 45 }}
                                            >
                                                <ambientLight intensity={1.5} />
                                                <pointLight position={[10, 10, 10]} intensity={2} />
                                                <pointLight position={[-10, -10, -10]} intensity={1} />

                                                <Center>
                                                    <RealisticEyeModel />
                                                </Center>

                                                <OrbitControls
                                                    makeDefault
                                                    minPolarAngle={0}
                                                    maxPolarAngle={Math.PI}
                                                />
                                            </Canvas>
                                        </Suspense>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px] opacity-40 pointer-events-none"></div>
                            </div>

                            {/* Theatre Controls */}
                            <div className="md:w-96 bg-gray-50 p-8 flex flex-col border-t md:border-t-0 md:border-l border-gray-100 overflow-y-auto">
                                <div className="mb-10">
                                    <div className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full w-fit mb-6 tracking-widest uppercase">
                                        {type === 'twin' ? 'ANATOMICAL_TWIN' : 'VISION_AR_SYNC'}
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                                        {type === 'twin' ? 'Explore your Digital Reconstruction' : 'Visual Condition Simulation'}
                                    </h2>
                                    <p className="text-gray-500 text-xs leading-relaxed">
                                        {type === 'twin'
                                            ? 'Interact with a high-fidelity 3D reconstruction of your ocular anatomy.'
                                            : 'Experience real-world simulations of ocular conditions over your live environment.'}
                                    </p>
                                </div>

                                <div className="space-y-3 mb-auto">
                                    {type === 'ar' ? (
                                        <>
                                            <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 ml-1">Simulation Filters</div>
                                            <FilterToggle title="Natural Vision" active={condition === 'none'} onClick={() => setCondition('none')} icon={<Eye size={18} />} />
                                            <FilterToggle title="Glaucoma Simulator" active={condition === 'glaucoma'} onClick={() => setCondition('glaucoma')} icon={<Maximize2 size={18} />} />
                                            <FilterToggle title="Cataract Clouding" active={condition === 'cataract'} onClick={() => setCondition('cataract')} icon={<Sparkles size={18} />} />
                                            <FilterToggle title="Visual Blur (Myopia)" active={condition === 'blur'} onClick={() => setCondition('blur')} icon={<Activity size={18} />} />
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-4 ml-1">Ocular Anatomy</div>
                                            <div className="space-y-3">
                                                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:bg-blue-50/30">
                                                    <div className="text-xs font-bold text-gray-900 mb-1">Cornea & Lens</div>
                                                    <div className="text-[10px] text-gray-500 leading-relaxed italic">The "window" of the eye that focuses incoming light.</div>
                                                </div>
                                                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:bg-blue-50/30">
                                                    <div className="text-xs font-bold text-gray-900 mb-1">Macula & Retina</div>
                                                    <div className="text-[10px] text-gray-500 leading-relaxed italic">The ultra-sensitive layer that converts light into neural signals.</div>
                                                </div>
                                                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:bg-blue-50/30">
                                                    <div className="text-xs font-bold text-gray-900 mb-1">Ocular Nerve</div>
                                                    <div className="text-[10px] text-gray-500 leading-relaxed italic">Direct communication pathway to the visual cortex.</div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="pt-8">
                                    {type === 'ar' && (
                                        <div className="flex gap-3">
                                            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                                                Capture Filtered View
                                            </button>
                                            <button
                                                onClick={cameraActive ? stopCamera : startCamera}
                                                className={`p-4 rounded-2xl border border-gray-100 shadow-sm transition-all active:scale-95 ${cameraActive ? 'bg-red-50 text-red-600' : 'bg-white text-blue-600'}`}
                                            >
                                                {cameraActive ? <CameraOff size={20} /> : <Camera size={20} />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- Page Level Components ---

const SelectionCard = ({ title, desc, icon, onClick, preview, color }: any) => {
    const borderColors: any = {
        blue: 'border-l-blue-500',
        cyan: 'border-l-cyan-500',
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            onClick={onClick}
            className={`group bg-white p-8 rounded-xl shadow-sm border-l-4 ${borderColors[color]} cursor-pointer transition-all hover:shadow-lg flex gap-6 items-center`}
        >
            <div className="flex-1">
                <div className="mb-4">{icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{desc}</p>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 transition-colors">
                    Launch Experience <Play size={10} className="fill-current" />
                </div>
            </div>
            <div className="hidden sm:block w-24 h-24 relative opacity-40 group-hover:opacity-100 transition-opacity overflow-hidden">
                {preview}
            </div>
        </motion.div>
    );
};

const ThreeDEyeSmall = () => (
    <div className="scale-75 translate-y-2">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-md">
            <circle cx="50" cy="50" r="40" fill="#F8FAFC" stroke="#E2E8F0" />
            <circle cx="50" cy="50" r="20" fill="#3B82F6" />
            <circle cx="50" cy="50" r="10" fill="#0F172A" />
        </svg>
    </div>
);

const ARTheatrePreview = () => (
    <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-blue-500/50 transition-colors">
        <div className="w-full h-[1px] bg-blue-400 animate-scanline opacity-50"></div>
        <Zap className="text-blue-400/20 w-10 h-10" />
    </div>
);

// --- Main Page Export ---

export default function AnalysisHubPage() {
    const { user, logout } = useAuth();
    const [theatre, setTheatre] = useState<{ isOpen: boolean, type: 'ar' | 'twin' }>({ isOpen: false, type: 'ar' });

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <nav className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl text-blue-600 font-bold">Smart Eye Care</span>
                        </div>
                        <div className="flex items-center space-x-5 text-gray-700 font-medium">
                            <span className="text-sm">
                                Welcome, <Link href="/settings" className="hover:text-blue-600 transition-colors font-bold">{user.name}</Link>
                            </span>
                            <button onClick={logout} className="text-red-600 hover:text-red-800 transition-colors font-bold text-sm">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white rounded-lg shadow-sm p-8 mb-10 relative overflow-hidden">
                    <div className="relative z-10">
                        <Link href="/dashboard/patient" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6 text-sm font-bold group">
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Personal Analysis Hub</h1>
                        <p className="text-gray-500 max-w-2xl leading-relaxed">
                            Welcome to your immersive diagnostic environment. Explore deep anatomical insights and real-world vision simulations based on your latest retinal screening.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <Activity size={120} className="text-blue-600" />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <SelectionCard
                        title="3D Digital Twin"
                        desc="Explore a full anatomical reconstruction of your eye based on screening data."
                        icon={<Box size={24} className="text-blue-600" />}
                        onClick={() => setTheatre({ isOpen: true, type: 'twin' })}
                        preview={<ThreeDEyeSmall />}
                        color="blue"
                    />
                    <SelectionCard
                        title="Vision AR Theatre"
                        desc="Simulate the visual impact of detected conditions through immersive spatial filters."
                        icon={<Maximize2 size={24} className="text-cyan-600" />}
                        onClick={() => setTheatre({ isOpen: true, type: 'ar' })}
                        preview={<ARTheatrePreview />}
                        color="cyan"
                    />
                </div>

                <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4 items-start">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mt-1">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900 text-sm mb-1">Advanced AI Analysis</h4>
                        <p className="text-blue-700/80 text-xs leading-relaxed max-w-3xl">
                            The theatre provides a visualization of localized detections from your retinal scan. All simulations should be reviewed with your consulting specialist.
                        </p>
                    </div>
                </div>
            </main>

            <ARTheatre
                isOpen={theatre.isOpen}
                onClose={() => setTheatre({ ...theatre, isOpen: false })}
                type={theatre.type}
            />
        </div>
    );
}
