'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// API Base URL - using Next.js proxy to avoid CORS/cookie issues
const API_URL = '/api';

interface User {
    id: number;
    name: string;
    email: string;
    user_type: 'patient' | 'doctor' | 'lab' | 'admin';
    phone?: string;
    location?: string;
    dob?: string;
    gender?: string;
    language?: string;
    timezone?: string;
    notif_email?: boolean;
    notif_sms?: boolean;
    notif_appointments?: boolean;
    notif_reports?: boolean;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    two_factor_enabled?: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (data: any, type: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUserLocal: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const res = await fetch(`${API_URL}/me`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Crucial for session cookies
            });
            const data = await res.json();
            if (data.authenticated) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Session check failed', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: any) => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
            credentials: 'include',
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Login failed');
        }

        const data = await res.json();
        setUser(data.user);

        // Redirect based on role
        switch (data.user.user_type) {
            case 'patient': router.push('/dashboard/patient'); break;
            case 'doctor': router.push('/dashboard/doctor'); break;
            case 'lab': router.push('/dashboard/lab'); break;
            case 'admin': router.push('/dashboard/admin'); break;
            default: router.push('/');
        }
    };

    const register = async (data: any, type: string) => {
        let endpoint = '/register';
        if (type === 'doctor') endpoint = '/register_doctor';
        if (type === 'lab') endpoint = '/register_lab';

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Registration failed');
        }

        router.push('/login'); // Redirect to login after registration
    };

    const updateUserLocal = (userData: User) => {
        setUser(userData);
    };

    const logout = async () => {
        if (!window.confirm("Are you sure you want to log out?")) {
            return;
        }

        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUserLocal }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
