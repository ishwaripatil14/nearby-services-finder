"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import api from '../lib/api';

const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
    const [services, setServices] = useState([]);
    const [category, setCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState([19.076, 72.8777]); // Default: Mumbai
    const [cityInput, setCityInput] = useState("");
    const [currentCity, setCurrentCity] = useState("Mumbai");
    const [searching, setSearching] = useState(false);

    const fetchServices = async (cat) => {
        try {
            setLoading(true);
            const res = await api.get(`/services?category=${cat}`);
            setServices(res.data);
        } catch (err) {
            console.error("Error fetching services:", err);
        } finally {
            setLoading(false);
        }
    };

    const searchCity = async () => {
        if (!cityInput.trim()) return;
        
        try {
            setSearching(true);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityInput)}&limit=1`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                setMapCenter([parseFloat(lat), parseFloat(lon)]);
                setCurrentCity(cityInput);
                setCityInput("");
                console.log(`Map centered on ${cityInput}: ${lat}, ${lon}`);
            } else {
                alert(`City "${cityInput}" not found. Please try a different city name.`);
            }
        } catch (err) {
            console.error("Error searching city:", err);
            alert("Error searching for city. Please try again.");
        } finally {
            setSearching(false);
        }
    };

    useEffect(() => {
        fetchServices(category);
    }, [category]);

    const categories = ["All", "hospital", "ATM", "shop", "others"];

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Nearby Services</h1>
                    <p className="text-gray-500 mt-1">Discover services around you on the map.</p>
                </div>
                <div className="flex items-center gap-3 self-start lg:self-auto">
                    <label className="text-sm font-medium text-gray-700">Filter:</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 capitalize"
                    >
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
                <div className="shadow-xl rounded-xl overflow-hidden border h-[70vh] lg:h-[calc(100vh-180px)]">
                    <Map services={services} center={mapCenter} key={mapCenter.toString()} />
                </div>

                <aside className="bg-white rounded-xl border shadow-sm overflow-hidden h-[70vh] lg:h-[calc(100vh-180px)] flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-semibold">Service List</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading...</div>
                        ) : services.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No services found for this category.</div>
                        ) : (
                            <div className="space-y-3">
                                {services.map(s => (
                                    <div key={s.id} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-900">{s.name}</h3>
                                            <span className="text-[10px] uppercase font-bold px-2 py-1 bg-primary-50 text-primary-600 rounded">
                                                {s.category}
                                            </span>
                                        </div>
                                        {s.rating && <p className="text-sm text-yellow-600 font-medium mt-1">⭐ {s.rating}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
