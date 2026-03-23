import React, { useState, useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Trees, TreePine, Apple, Sprout } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapService } from '../../../api/mapService';
import { TYPE_COLORS } from '../../../constants/mapConstants';

const createIcon = (TypeIcon, color) => {
    const iconHtml = renderToStaticMarkup(
        <div style={{
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'white',
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            border: `2px solid ${color}`,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }}>
            <TypeIcon size={16} strokeWidth={2.5} fill={color} fillOpacity={0.1} />
        </div>
    );

    return L.divIcon({
        html: iconHtml,
        className: 'custom-gp-icon',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
    });
};

const TYPE_ICONS = {
    1: TreePine, // Block Plantation
    2: Trees,    // Miyawaki
    3: Apple,    // Fal Vatika
    'default': Sprout
};

// Pre-generate icons for each type
const CACHED_ICONS = Object.entries(TYPE_ICONS).reduce((acc, [type, Icon]) => {
    acc[type] = createIcon(Icon, TYPE_COLORS[type] || TYPE_COLORS.default);
    return acc;
}, {});

const formatSpeciesName = (text) => {
    if (!text || text === 'null' || text === 'None') return 'Mixed';
    try {
        // The database field contains JSON strings like [{"name": "Neem", ...}]
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
            const names = data.map(item => item.name.split('(')[0].trim());
            return names.length > 0 ? names.join(', ') : 'Mixed';
        }
    } catch (e) {
        // If not JSON, return as is (stripping brackets if any)
        return text.replace(/[\[\]]/g, '').trim() || 'Mixed';
    }
    return text;
};

const PointLayer = ({ viewLevel, blockId, filters, setSelectionInfo }) => {
    const [points, setPoints] = useState([]);

    useEffect(() => {
        if (viewLevel !== 'GP' || !blockId) {
            setPoints([]);
            return;
        }

        const fetchPoints = async () => {
            try {
                const id = String(blockId).length <= 3 ? `08${String(blockId).padStart(3, '0')}` : blockId;
                const response = await mapService.fetchPlantationPoints(id, filters);
                const pData = Array.isArray(response) ? response : (response.results || []);
                const validPoints = pData.filter(p => p.location_lat && p.location_long);
                setPoints(validPoints);
            } catch (err) {
                console.error("Fetch points failed:", err);
            }
        };

        fetchPoints();
    }, [viewLevel, blockId, filters]);

    if (viewLevel !== 'GP') return null;

    return (
        <>
            {points.map((p) => {
                const icon = CACHED_ICONS[p.plantation_type] || CACHED_ICONS.default;
                const typeName = p.plantation_type === 1 ? 'Plantation' :
                    p.plantation_type === 2 ? 'Miyawaki' :
                        p.plantation_type === 3 ? 'Fal Vatika' : 'Other';

                return (
                    <Marker
                        key={`site-${p.id}`}
                        position={[p.location_lat, p.location_long]}
                        icon={icon}
                        eventHandlers={{
                            click: () => {
                                setSelectionInfo({
                                    title: 'Plantation Site',
                                    type: typeName,
                                    details: [
                                        { label: 'Plant Name', value: formatSpeciesName(p.planta_name_text) },
                                        { label: 'Plants', value: parseInt(p.number_of_plants).toLocaleString() },
                                        { label: 'Gram Panchayat', value: (p.gp_name || p.gp_code)?.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) },
                                        { label: 'Block', value: p.block_name },
                                        { label: 'District', value: p.district_name }
                                    ]
                                });
                            }
                        }}
                    />
                );
            })}
        </>
    );
};

export default PointLayer;
