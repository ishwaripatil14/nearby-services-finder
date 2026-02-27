"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

export default function DashboardPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: '', category: 'shop', lat: '', lng: '', rating: '' });
    const [editingId, setEditingId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const router = useRouter();

    const fetchServices = async () => {
        try {
            const res = await api.get('/admin/services');
            setServices(res.data);
        } catch (err) {
            if (err.response?.status === 401) router.push('/admin/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/services/${editingId}`, form);
            } else {
                await api.post('/services', form);
            }
            setForm({ name: '', category: 'shop', lat: '', lng: '', rating: '' });
            setEditingId(null);
            fetchServices();
        } catch (err) {
            alert("Error saving service");
        }
    };

    const handleEdit = (service) => {
        setEditingId(service.id);
        setForm({
            name: service.name,
            category: service.category,
            lat: service.lat,
            lng: service.lng,
            rating: service.rating || ''
        });
    };

    const handleDelete = async (id) => {
        // first click: ask for confirmation inline
        if (confirmDeleteId !== id) {
            setConfirmDeleteId(id);
            return;
        }

        try {
            await api.delete(`/services/${id}`);
            setConfirmDeleteId(null);
            fetchServices();
        } catch (err) {
            alert("Error deleting service");
        }
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl border shadow-sm sticky top-24">
                        <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Service" : "Add New Service"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text" required value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary-500"
                                    >
                                        <option value="hospital">Hospital</option>
                                        <option value="ATM">ATM</option>
                                        <option value="shop">Shop</option>
                                        <option value="others">Others</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                                    <input
                                        type="number" step="0.1" max="5" min="0" value={form.rating}
                                        onChange={(e) => setForm({ ...form, rating: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                                    <input
                                        type="number" step="any" required value={form.lat}
                                        onChange={(e) => setForm({ ...form, lat: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                                    <input
                                        type="number" step="any" required value={form.lng}
                                        onChange={(e) => setForm({ ...form, lng: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                            <div className="pt-2 flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary-600 text-white font-bold py-2 rounded-lg hover:bg-primary-700"
                                >
                                    {editingId ? "Update" : "Save"}
                                </button>
                                {editingId && (
                                    <button
                                        type="button" onClick={() => { setEditingId(null); setForm({ name: '', category: 'shop', lat: '', lng: '', rating: '' }); }}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Rating</th>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                                ) : services.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No services found.</td></tr>
                                ) : (
                                    services.map(s => (
                                        <tr key={s.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                                            <td className="px-6 py-4 capitalize text-gray-600">{s.category}</td>
                                            <td className="px-6 py-4">{s.rating || '-'}</td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <button
                                                    onClick={() => handleEdit(s)}
                                                    className="text-primary-600 font-medium hover:underline"
                                                >
                                                    Edit
                                                </button>
                                                {confirmDeleteId === s.id ? (
                                                    <span className="inline-flex items-center gap-2 ml-2 text-xs">
                                                        <span className="text-gray-500">Delete this service?</span>
                                                        <button
                                                            onClick={() => handleDelete(s.id)}
                                                            className="text-red-600 font-semibold hover:underline"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmDeleteId(null)}
                                                            className="text-gray-400 hover:underline"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDelete(s.id)}
                                                        className="text-red-600 font-medium hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
