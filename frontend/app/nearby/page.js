"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import api from '../../lib/api';

const Map = dynamic(() => import('../../components/Map'), { ssr: false });

export default function NearbyPage() {
    const [formData, setFormData] = useState({ lat: "19.076", lng: "72.8777", radius: "2", category: "All" });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState([19.076, 72.8777]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setHasSearched(true);
        try {
            const { lat, lng, radius, category } = formData;
            const latNum = parseFloat(lat);
            const lngNum = parseFloat(lng);
            const radiusNum = parseFloat(radius) || 0;

            if (Number.isNaN(latNum) || Number.isNaN(lngNum) || Number.isNaN(radiusNum)) {
                alert("Please enter valid numbers for latitude, longitude and radius.");
                setLoading(false);
                return;
            }

            const categoryParam = category && category !== "All" ? `&category=${encodeURIComponent(category)}` : "";
            const res = await api.get(`/services/nearby?lat=${latNum}&lng=${lngNum}&radius=${radiusNum}${categoryParam}`);
            setResults(res.data);
            setMapCenter([latNum, lngNum]);
        } catch (err) {
            alert("Error searching nearby services");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold mb-4">Radius Search</h1>

            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
                <div>
                    <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl border space-y-4 shadow-sm">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">What are you looking for?</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="All">All</option>
                                <option value="hospital">Hospital</option>
                                <option value="ATM">ATM</option>
                                <option value="shop">Shop</option>
                                <option value="others">Others</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                            <input
                                type="number" step="any" required
                                value={formData.lat}
                                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                            <input
                                type="number" step="any" required
                                value={formData.lng}
                                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Radius (km)</label>
                            <input
                                type="number" step="any" required
                                value={formData.radius}
                                onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Searching..." : "Find Services"}
                        </button>
                    </form>

                    {results.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-lg font-bold mb-4">{results.length} Services Found</h2>
                            <div className="space-y-3">
                                {results.map(s => (
                                    <div key={s.id} className="bg-white p-3 rounded-lg border text-sm">
                                        <p className="font-bold">{s.name}</p>
                                        <p className="text-primary-600 font-medium">{s.distance_km} km away</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="shadow-xl rounded-xl overflow-hidden border h-[70vh] lg:h-[calc(100vh-180px)] relative bg-gray-100">
                    <Map services={results} center={mapCenter} zoom={14} />

                    {hasSearched && results.length === 0 && !loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                            <div className="px-4 py-3 rounded-lg border border-dashed border-gray-400 bg-white text-sm text-gray-700 shadow-sm text-center">
                                I can’t search this service. Please try another.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
