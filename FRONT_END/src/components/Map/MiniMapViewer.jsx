import React from 'react';
import { MapContainer, useMap, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapViewer.css';

const SyncMap = ({ center, zoom, bounds }) => {
    const map = useMap();
    React.useEffect(() => {
        if (bounds && Array.isArray(bounds) && bounds.length === 4) {
            const [minX, minY, maxX, maxY] = bounds;
            // Leaflet expects [[lat1, lng1], [lat2, lng2]]
            // Our bbox is [minX, minY, maxX, maxY] (lng, lat, lng, lat)
            const leafletBounds = [[minY, minX], [maxY, maxX]];

            // Validate numbers
            if (!isNaN(minX) && !isNaN(minY) && isFinite(minX) && isFinite(minY)) {
                map.fitBounds(leafletBounds, { animate: true, padding: [10, 10] });
            }
        } else if (center && !isNaN(center[0]) && !isNaN(center[1])) {
            map.setView(center, zoom);
        }
    }, [center, zoom, JSON.stringify(bounds), map]);
    return null;
};

const MiniMapViewer = ({
    center = [26.5, 74.0],
    zoom = 5.5,
    bounds,
    children,
    label
}) => {
    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <MapContainer
                center={center}
                zoom={zoom}
                zoomControl={false}
                attributionControl={false}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                className="mini-leaflet-container"
                style={{ height: '100%', width: '100%', background: '#f8fafc' }}
            >
                {children}
                <SyncMap center={center} zoom={zoom} bounds={bounds} />
            </MapContainer>
        </div>
    );
};

export default MiniMapViewer;
