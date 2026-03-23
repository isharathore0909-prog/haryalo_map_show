import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Trees, TreePine, Apple, Sprout } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TYPE_COLORS } from '../../../constants/mapConstants';

const createIcon = (TypeIcon, color) => {
    const iconHtml = renderToStaticMarkup(
        <div style={{ color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TypeIcon size={18} strokeWidth={2.5} fill={color} fillOpacity={0.2} />
        </div>
    );

    return L.divIcon({
        html: iconHtml,
        className: 'custom-map-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

const TYPE_ICONS = {
    1: TreePine, // Block Plantation
    2: Trees,    // Miyawaki
    3: Apple,    // Fal Vatika
    'default': Sprout
};

const UnifiedPointLayer = ({ points }) => {
    if (!points || points.length === 0) return null;

    return (
        <>
            {points.map((p, idx) => {
                const IconComponent = TYPE_ICONS[p.plantation_type] || TYPE_ICONS.default;
                const color = TYPE_COLORS[p.plantation_type] || TYPE_COLORS.default;
                const icon = createIcon(IconComponent, color);

                return (
                    <Marker
                        key={`point-${p.id}-${idx}`}
                        position={[p.location_lat, p.location_long]}
                        icon={icon}
                    >
                        <Popup>
                            <div className="point-popup">
                                <strong>{p.gp_code || 'Plantation Site'}</strong>
                                <p>Type: {p.plantation_type_name || 'Forestry'}</p>
                                <p>Plants: {p.number_of_plants}</p>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </>
    );
};

export default UnifiedPointLayer;
