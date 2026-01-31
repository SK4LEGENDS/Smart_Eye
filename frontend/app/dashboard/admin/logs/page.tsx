'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
    Activity,
    Clock,
    User,
    Box,
    ExternalLink,
    Search,
    RefreshCw
} from 'lucide-react';

interface LogEntry {
    id: number;
    action: string;
    target_type: string;
    target_id: number;
    details: string;
    timestamp: string;
    actor_name: string;
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/logs', {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs);
            }
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(l =>
        l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.actor_name || 'System').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getActionColor = (action: string) => {
        if (action.includes('DELETE')) return 'text-red-600 bg-red-50 border-red-100';
        if (action.includes('CREATE')) return 'text-green-600 bg-green-50 border-green-100';
        if (action.includes('UPDATE')) return 'text-blue-600 bg-blue-50 border-blue-100';
        if (action.includes('EXPORT')) return 'text-purple-600 bg-purple-50 border-purple-100';
        if (action.includes('ANALYSIS')) return 'text-indigo-600 bg-indigo-50 border-indigo-100';
        if (action.includes('STATUS')) return 'text-teal-600 bg-teal-50 border-teal-100';
        return 'text-gray-600 bg-gray-50 border-gray-100';
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Accessing system audit trails...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
                    <p className="text-gray-500">Comprehensive system-wide audit trail</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh Logs</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Filter logs by keyword, admin, or action..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 text-gray-500 font-bold">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">Actor</th>
                                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">Entity</th>
                                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-xs text-gray-900 font-medium whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600 border border-gray-200">
                                                {(log.actor_name || 'System').charAt(0)}
                                            </div>
                                            <span className="font-bold text-gray-900">{log.actor_name || 'System'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold border ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                                            <Box size={14} className="text-gray-400" />
                                            {log.target_type} #{log.target_id}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                        <div className="max-w-xs xl:max-w-md truncate" title={log.details}>
                                            {log.details}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredLogs.length === 0 && (
                    <div className="p-16 text-center">
                        <Activity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No system activity matches your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
