'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    Activity,
    ShieldAlert
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, isLoading } = useAuth();
    const pathname = usePathname();

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!user || user.user_type !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                    <div className="bg-red-100 p-3 rounded-full inline-block mb-4">
                        <ShieldAlert className="text-red-600" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
                    <p className="text-gray-600 mb-6">You need administrator privileges to access this area.</p>
                    <button
                        onClick={logout}
                        className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Login as Admin
                    </button>
                    <Link href="/" className="block mt-4 text-sm text-gray-500 hover:text-blue-600">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const navItems = [
        { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
        { name: 'System Reports', href: '/dashboard/admin/reports', icon: FileText },
        { name: 'Activity Logs', href: '/dashboard/admin/logs', icon: Activity },
    ];

    return (
        <div className="h-screen bg-gray-100 flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg font-bold text-xl">SE</div>
                        <span className="font-bold text-lg tracking-tight">Smart Eye Care</span>
                    </div>
                    <div className="mt-2 text-xs uppercase text-gray-400 font-bold tracking-widest px-1">Admin Portal</div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-blue-600 text-white font-bold'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800 space-y-1">
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
                    >
                        <Settings size={20} />
                        <span>Settings</span>
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all text-left"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-6 transition-colors">
                    <div className="md:hidden flex items-center gap-2">
                        <div className="bg-blue-600 p-1 rounded font-bold text-white">SE</div>
                        <span className="font-bold dark:text-gray-100">Smart Eye</span>
                    </div>
                    <div className="flex-1 md:flex-none"></div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{user.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold border border-gray-300 dark:border-gray-600">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
