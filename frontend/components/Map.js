"use client";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icons in Leaflet
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Colored icons for different service categories
const createColoredIcon = (color) => {
    return L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

const getMarkerColor = (category) => {
    const colors = {
        'hospital': 'green',
        'ATM': 'red', 
        'shop': 'blue',
        'others': 'yellow',
        'default': 'grey'
    };
    return colors[category] || colors.default;
};

function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function Map({ services, center = [19.076, 72.8777], zoom = 13 }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-[500px] bg-gray-100 flex items-center justify-center">Loading Map...</div>;

    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView center={center} zoom={zoom} />
            {services.map((service) => (
                <Marker 
                    key={service.id} 
                    position={[service.lat, service.lng]}
                    icon={createColoredIcon(getMarkerColor(service.category))}
                >
                    <Popup>
                        <div className="p-1">
                            <h3 className="font-bold text-sm">{service.name}</h3>
                            <p className="text-xs text-gray-600 capitalize">{service.category}</p>
                            {service.rating && <p className="text-xs font-semibold text-yellow-600">⭐ {service.rating}</p>}
                            {service.distance_km && (
                                <p className="text-xs text-blue-600 mt-1">{service.distance_km} km away</p>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
