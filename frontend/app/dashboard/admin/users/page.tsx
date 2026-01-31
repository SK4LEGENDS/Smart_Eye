'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
    Search,
    Filter,
    Edit,
    Trash2,
    Shield,
    User as UserIcon,
    Stethoscope,
    FlaskConical,
    Mail,
    Phone,
    MapPin,
    Plus,
    X,
    Save,
    AlertTriangle,
    Lock,
    RefreshCw,
    Building
} from 'lucide-react';

interface UserData {
    id?: number;
    name: string;
    email: string;
    user_type: string;
    phone: string;
    location: string;
    specialist?: string;
    lab_license?: string;
    clinic_name?: string;
    password?: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    // Modals
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState<UserData>({
        name: '', email: '', user_type: 'patient', phone: '', location: '', specialist: '', lab_license: '', clinic_name: '', password: ''
    });
    const [deletingUser, setDeletingUser] = useState<UserData | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/all_users', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
                setErrorMsg('');
            } else {
                const err = await res.json();
                setErrorMsg(err.error || 'Access denied or server error');
            }
        } catch (error) {
            setErrorMsg('Network error connectivity lost');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || u.user_type === typeFilter;
        return matchesSearch && matchesType;
    });

    const handleOpenForm = (user?: UserData) => {
        if (user) {
            setFormData({ ...user, password: '' });
        } else {
            setFormData({ name: '', email: '', user_type: 'patient', phone: '', location: '', specialist: '', lab_license: '', clinic_name: '', password: '' });
        }
        setShowFormModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/user/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });
            if (res.ok) {
                setShowFormModal(false);
                fetchUsers();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save user');
            }
        } catch (error) {
            alert('Network error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingUser?.id) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/admin/user/delete/${deletingUser.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setShowDeleteModal(false);
                fetchUsers();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to delete user');
            }
        } catch (error) {
            alert('Network error');
        } finally {
            setSubmitting(false);
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'admin': return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200"><Shield size={12} /> Admin</span>;
            case 'doctor': return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200"><Stethoscope size={12} /> Doctor</span>;
            case 'lab': return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200"><FlaskConical size={12} /> Lab</span>;
            default: return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200"><UserIcon size={12} /> Patient</span>;
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Retrieving user database...</p>
        </div>
    );

    if (errorMsg) return (
        <div className="bg-red-50 border border-red-200 p-8 rounded-xl text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-red-900 mb-2">Failed to load users</h2>
            <p className="text-red-700 mb-6">{errorMsg}</p>
            <button onClick={fetchUsers} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700">Try Again</button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Full administrative control over all accounts</p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    <span>Create User</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-gray-400" size={18} />
                    <select
                        className="border border-gray-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 font-medium"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="patient">Patients</option>
                        <option value="doctor">Doctors</option>
                        <option value="lab">Labs</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{u.name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1"><Mail size={10} /> {u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getTypeBadge(u.user_type)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-xs text-gray-900 font-medium flex items-center gap-1">
                                            <Phone size={12} className="text-gray-400" /> {u.phone || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <MapPin size={12} className="text-gray-400" /> {u.location || 'Local'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenForm(u)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                title="Edit User"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => { setDeletingUser(u); setShowDeleteModal(true); }}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal */}
            {showFormModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">{formData.id ? 'Edit User Details' : 'Create New System User'}</h2>
                            <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                    <input required type="text" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                                    <input required type="email" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">System Role</label>
                                    <select className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium"
                                        value={formData.user_type} onChange={e => setFormData({ ...formData, user_type: e.target.value })}>
                                        <option value="patient">Patient</option>
                                        <option value="doctor">Doctor</option>
                                        <option value="lab">Lab</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                                    <input type="text" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium"
                                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Clinic / Facility Name</label>
                                    <input type="text" placeholder="e.g. City Eye Hospital" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium"
                                        value={formData.clinic_name || ''} onChange={e => setFormData({ ...formData, clinic_name: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Set Password {formData.id && '(Leave blank to keep current)'}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="password" placeholder={formData.id ? "Keep current password" : "••••••••"}
                                            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium"
                                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                    </div>
                                </div>

                                {formData.user_type === 'doctor' && (
                                    <div className="col-span-2 slide-in-from-top-2 animate-in duration-300">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Medical Specialty</label>
                                        <input type="text" placeholder="e.g. Retina Specialist" className="w-full p-2.5 border rounded-lg focus:ring-2 border-green-200 outline-none text-gray-900 font-medium"
                                            value={formData.specialist} onChange={e => setFormData({ ...formData, specialist: e.target.value })} />
                                    </div>
                                )}
                                {formData.user_type === 'lab' && (
                                    <div className="col-span-2 slide-in-from-top-2 animate-in duration-300">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lab License ID</label>
                                        <input type="text" className="w-full p-2.5 border rounded-lg focus:ring-2 border-purple-200 outline-none text-gray-900 font-medium"
                                            value={formData.lab_license} onChange={e => setFormData({ ...formData, lab_license: e.target.value })} />
                                    </div>
                                )}
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowFormModal(false)} className="flex-1 px-4 py-2.5 border rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                    {submitting ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                                    {formData.id ? 'Save Changes' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border-2 border-red-50">
                        <div className="p-8 text-center text-gray-900">
                            <div className="bg-red-100 p-4 rounded-full inline-block mb-4 text-red-600">
                                <AlertTriangle size={48} />
                            </div>
                            <h2 className="text-2xl font-black mb-2">Nuclear Delete Action</h2>
                            <p className="text-gray-600 mb-6 font-medium">
                                You are about to permanently delete <span className="font-bold text-gray-900">{deletingUser?.name}</span>.
                                <br /><br />
                                <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">WARNING:</span> This will wipe all associated medical records, appointments, and predictions. This action is irreversible.
                            </p>
                            <div className="flex gap-4">
                                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 border rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button onClick={handleDelete} disabled={submitting} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 transition-all disabled:opacity-50">
                                    {submitting ? 'DELETING...' : 'DELETE FOREVER'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
