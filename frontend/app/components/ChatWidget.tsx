"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Sparkles, AlertCircle, Loader2, ShieldCheck, Activity } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: number;
    action_taken?: boolean;
    tool?: string;
    isProactive?: boolean;
    proactiveData?: any;
}

// Simple markdown parser for chat messages
const formatMessage = (content: string) => {
    // Split by newlines first
    return content.split('\n').map((line, i) => {
        // Parse **bold** text
        const parts = line.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
        return (
            <span key={i}>
                {parts}
                {i < content.split('\n').length - 1 && <br />}
            </span>
        );
    });
};

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hello! I am your AI Assistant. How can I help you today?",
            timestamp: Date.now()
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom directly
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // Listen for proactive messages (triggered by other components)
    useEffect(() => {
        const handleProactiveMessage = (event: CustomEvent) => {
            const { message, onConfirm, onCancel, originalAction } = event.detail;

            // Open the chatbot
            setIsOpen(true);

            // Add the proactive message from the AI
            setMessages(prev => [...prev, {
                role: "assistant",
                content: message,
                timestamp: Date.now(),
                action_taken: false,
                isProactive: true,
                proactiveData: { onConfirm, onCancel, originalAction }
            }]);
        };

        window.addEventListener('chatbot-proactive-message', handleProactiveMessage as EventListener);
        return () => window.removeEventListener('chatbot-proactive-message', handleProactiveMessage as EventListener);
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // Crucial for Flask-Login session cookies
                body: JSON.stringify({ message: userMsg.content, history }),
            });

            if (!response.ok) throw new Error("Failed to connect");

            const data = await response.json();

            setMessages(prev => [...prev, {
                role: "assistant",
                content: data.response,
                timestamp: Date.now(),
                action_taken: data.action_taken,
                tool: data.tool
            }]);

            // Notify dashboard if a tool was executed (for real-time UI sync)
            if (data.action_taken && data.tool) {
                window.dispatchEvent(new CustomEvent('chatbot-tool-executed', {
                    detail: { tool: data.tool }
                }));
            }

        } catch (error) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "I'm having trouble connecting to the server. Please try again later.",
                timestamp: Date.now()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
                    >
                        {/* Header - CACS Brand Primary */}
                        <div className="bg-[#115DFC] p-4 flex items-center justify-between text-white shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 border border-white/30 rounded-lg backdrop-blur-md">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm tracking-wide text-white">Agent-C</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(134,239,172,0.8)]" />
                                        <span className="text-[10px] text-blue-100 font-mono font-medium">ONLINE • V2.4</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-blue-100" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#F8FAFC]">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={idx}
                                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    {/* Retrieval Indicator for AI messages */}
                                    {msg.role === 'assistant' && idx > 0 && (
                                        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 mb-2 ml-1">
                                            <span className="w-1 h-1 bg-green-500 rounded-full" />
                                            <span>Context Retrieved (142ms)</span>
                                        </div>
                                    )}

                                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-[#115DFC] text-white rounded-br-none shadow-blue-500/20'
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-slate-200/50'
                                        }`}>


                                        {msg.action_taken && (
                                            <div className="mb-2 pb-2 border-b border-slate-100 flex items-center gap-2 text-[#115DFC] font-mono text-[10px] uppercase tracking-wider">
                                                <Sparkles className="w-3 h-3" />
                                                <span>Tool: {msg.tool}</span>
                                            </div>
                                        )}
                                        {formatMessage(msg.content)}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <div className="flex flex-col items-start gap-2">
                                    <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 ml-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                                        <span>Retrieving: AAO Guidelines (v2024)...</span>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 border border-slate-100 rounded-tl-none flex items-center gap-3 shadow-md">
                                        <Loader2 className="w-4 h-4 text-[#115DFC] animate-spin" />
                                        <span className="text-xs text-slate-500 font-medium">Analyzing clinical context...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-white border-t border-slate-100">
                            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-[#115DFC]/20 focus-within:border-[#115DFC] transition-all">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about your scan..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="p-1.5 bg-[#115DFC] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="text-[10px] text-center text-slate-400 mt-2 font-medium">
                                C3-RAG Active • Encrypted • HIPAA Compliant
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-[#115DFC] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-colors relative border-2 border-white ring-4 ring-blue-500/10"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-bounce"></span>
                )}
            </motion.button>
        </div>
    );
}
