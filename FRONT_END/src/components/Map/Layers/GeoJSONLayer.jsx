import React from 'react';
import L from 'leaflet';
import { GeoJSON, Marker, CircleMarker, Popup } from 'react-leaflet';
import { TreePine } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getChoroplethColor } from '../../../utils/colorUtils';
import { MAP_LEVELS } from '../../../constants/mapConstants';
import { calculateBBox, calculateCentroid } from '../../../utils/geoUtils';

const createClusterIcon = (color) => {
    const iconHtml = renderToStaticMarkup(
        <div style={{ color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '50%', padding: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
            <TreePine size={22} strokeWidth={2.5} fill={color} fillOpacity={0.2} />
        </div>
    );

    return L.divIcon({
        html: iconHtml,
        className: 'custom-cluster-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
};

const GeoJSONLayer = ({
    geojsonData,
    stats,
    viewLevel,
    onFeatureClick,
    districtId,
    filters,
    setSelectionInfo,
    showBoundaries,
    blockId
}) => {
    if (!geojsonData) return null;

    // Filter data if we are at GP level (show ONLY the selected block)
    const activeData = viewLevel === MAP_LEVELS.GP && blockId
        ? {
            ...geojsonData,
            features: geojsonData.features.filter(f => {
                const id = f.properties.boundary_id || f.properties.district_id || f.properties.district_c || f.properties.DISTRICT_C || f.properties.block_id || f.properties.block_c || f.properties.id;
                return String(id) === String(blockId);
            })
        }
        : geojsonData;

    if (!activeData || !activeData.features || activeData.features.length === 0) {
        if (viewLevel === MAP_LEVELS.GP) return null; // Expected if we filtered everything
    }

    const getFeatureId = (feature) => {
        const props = feature.properties;
        return props.boundary_id || props.district_id || props.district_c || props.DISTRICT_C || props.block_id || props.block_c || props.id;
    };

    const onEachFeature = (feature, layer) => {
        const id = getFeatureId(feature);
        const name = feature.properties.name || feature.properties.district_n || feature.properties.district_name || "Unknown District";

        layer.on({
            mouseover: (e) => {
                const l = e.target;
                l.setStyle({ weight: 3, color: '#2d3748', fillOpacity: 0.9 });
            },
            mouseout: (e) => {
                const l = e.target;
                l.setStyle({
                    weight: 1.2,
                    color: '#1a202c',
                    fillOpacity: viewLevel === 'District' ? 0.8 : 0
                });
            },
            click: (e) => {
                const bbox = calculateBBox(feature);
                onFeatureClick(id, bbox, feature);
            }
        });
    };

    const style = (feature) => {
        const id = getFeatureId(feature);
        const districtData = stats?.find(s => s.code == id);
        const val = districtData ? (districtData.total_plants || 0) : 0;

        return {
            fillColor: viewLevel === 'District' ? getChoroplethColor(val) : 'transparent',
            weight: 1.2,
            opacity: 1,
            color: '#1a202c',
            fillOpacity: viewLevel === 'District' ? 0.8 : 0
        };
    };

    const baseStyle = {
        fillColor: '#edf2f7', // Stronger gray
        weight: 1.5,
        opacity: 1,
        color: '#a0aec0', // Visible border
        fillOpacity: 0.3,
        interactive: false
    };

    const renderBubbles = () => {
        if (viewLevel !== 'Block') return null;

        return geojsonData.features.map(feature => {
            const id = getFeatureId(feature);
            const blockData = stats?.find(s => s.code == id);
            const val = blockData ? (blockData.total_plants || 0) : 0;

            if (val === 0) return null;

            const latlng = calculateCentroid(feature);
            if (!latlng) return null;

            const radius = Math.sqrt(Number(val)) / 12;
            if (isNaN(radius)) return null;

            const sites = blockData ? blockData.site_count : 0;
            const name = feature.properties.name || feature.properties.block_n || (blockData ? blockData.name : "Unknown");

            return (
                <CircleMarker
                    key={`bubble-${id}`}
                    center={latlng}
                    radius={Math.max(radius, 6)}
                    pathOptions={{
                        fillColor: '#2f855a',
                        color: 'white',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.8
                    }}
                    eventHandlers={{
                        click: (e) => {
                            L.DomEvent.stopPropagation(e);
                            setSelectionInfo({
                                title: name,
                                type: 'Block Cluster',
                                details: [
                                    { label: 'Total Plants', value: val.toLocaleString() },
                                    { label: 'Plantation Sites', value: sites.toLocaleString() }
                                ]
                            });
                        }
                    }}
                />
            );
        });
    };

    return (
        <>
            {/* Background Layer: only show if explicitly enabled via Legend */}
            {showBoundaries && (
                <GeoJSON
                    data={activeData}
                    style={baseStyle}
                />
            )}

            {/* Interactive/Data Layer */}
            <GeoJSON
                key={`${viewLevel}-${districtId || 'all'}-${blockId || 'none'}-${activeData.features?.length}`}
                data={activeData}
                style={style}
                onEachFeature={onEachFeature}
            />
            {renderBubbles()}
        </>
    );
};

export default GeoJSONLayer;
