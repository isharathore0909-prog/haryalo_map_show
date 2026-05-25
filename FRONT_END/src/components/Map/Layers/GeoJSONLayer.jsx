import React, { useState } from 'react';
import L from 'leaflet';
import { GeoJSON, Marker, CircleMarker, Popup } from 'react-leaflet';
import { TreePine } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getChoroplethColor, getDiffChoroplethColor } from '../../../utils/colorUtils';
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
    blockId,
    diffData,
    isDiffMode
}) => {
    const [highlightedId, setHighlightedId] = useState(null);

    // Helper to get color for change detection (Delta)
    const getDiffColor = (delta) => {
        if (!delta) return 'transparent';

        // Extract value from delta object (backend returns { total_plants: { value, percent }, ... })
        let val = 0;
        if (typeof delta === 'object') {
            val = (delta.total_plants && typeof delta.total_plants === 'object')
                ? delta.total_plants.value
                : (delta.total_plants ?? 0);
        } else {
            val = delta;
        }

        return getDiffChoroplethColor(val);
    };

    if (!geojsonData) return null;

    // Feature selection/filtering
    const activeData = geojsonData;

    if (!activeData || !activeData.features || activeData.features.length === 0) {
        if (viewLevel === MAP_LEVELS.GP) return null; // Expected if we filtered everything
    }

    const getFeatureId = (feature) => {
        const props = feature.properties;
        if (viewLevel === MAP_LEVELS.GP) {
            return props.boundary_id || props.gp_id || props.gp_code || props.gp_c || props.GP_C ||
                props.GP_FINAL_C || props.gp_final_c || props.GP_ENTITY_ || props.id;
        } else if (viewLevel === MAP_LEVELS.BLOCK) {
            return props.boundary_id || props.block_id || props.block_c || props.id;
        } else {
            return props.boundary_id || props.district_id || props.district_c || props.DISTRICT_C || props.id;
        }
    };

    const onEachFeature = (feature, layer) => {
        const id = getFeatureId(feature);

        layer.on({
            mouseover: (e) => {
                setHighlightedId(id);
                const l = e.target;
                l.bringToFront();
            },
            mouseout: (e) => {
                setHighlightedId(null);
            },
            click: (e) => {
                const bbox = calculateBBox(feature);
                onFeatureClick(id, bbox, feature);

                if (viewLevel === MAP_LEVELS.GP) {
                    const props = feature.properties;
                    const name = props.name || props.gp_name || props.GP_FINAL_N || props.district_n || "Unknown";
                    const itemStats = stats?.find(s => String(s.code) === String(id));
                    setSelectionInfo({
                        title: name,
                        type: 'Gram Panchayat',
                        details: [
                            { label: 'Total Plants', value: (itemStats?.total_plants || 0).toLocaleString() },
                            { label: 'Plantation Sites', value: (itemStats?.site_count || 0).toLocaleString() }
                        ]
                    });
                }
            }
        });
    };

    const style = (feature) => {
        const props = feature.properties;
        const id = getFeatureId(feature);
        const name = props.name || props.district_n || props.district_name || props.block_name || props.gp_name || "";
        const isHighlighted = String(id) === String(highlightedId);

        if (isDiffMode && diffData && diffData.regionalDiff) {
            // Normalize ID by removing BOM (\uFEFF) and leading zeros
            const rawId = String(id).replace(/\uFEFF/g, '').trim();
            const normalizedId = rawId.replace(/^0+/, '');

            // 1. Try matching with multiple ID variants
            let delta = diffData.regionalDiff[rawId] ||
                diffData.regionalDiff[normalizedId];

            // If still no luck, try matching against keys in regionalDiff normalized
            if (delta === undefined) {
                const diffKeys = Object.keys(diffData.regionalDiff);
                const matchKey = diffKeys.find(k => k.replace(/\uFEFF/g, '').replace(/^0+/, '') === normalizedId);
                if (matchKey) delta = diffData.regionalDiff[matchKey];
            }

            // 2. Fallback: Try matching by NAME if ID fails
            if (delta === undefined && stats) {
                const nameMatch = stats.find(s =>
                    String(s.name || "").toLowerCase().trim() === name.toLowerCase().trim()
                );
                if (nameMatch) {
                    const matchCode = String(nameMatch.code).replace(/\uFEFF/g, '');
                    const normalizedMatchCode = matchCode.replace(/^0+/, '');
                    delta = diffData.regionalDiff[matchCode] ||
                        diffData.regionalDiff[normalizedMatchCode];
                }
            }

            return {
                fillColor: getDiffColor(delta),
                weight: isHighlighted ? 4 : 2,
                opacity: 1,
                color: isHighlighted ? '#000000' : '#1a202c',
                fillOpacity: isHighlighted ? 0.95 : 0.8
            };
        }

        if (isDiffMode) {
            return {
                fillColor: 'transparent',
                weight: 1.2,
                opacity: 1,
                color: '#1a202c',
                fillOpacity: 0
            };
        }

        const districtData = stats?.find(s => s.code == id);
        const val = districtData ? (districtData.total_plants || 0) : 0;

        const isDistrict = viewLevel === MAP_LEVELS.DISTRICT;

        return {
            fillColor: isDistrict ? getChoroplethColor(val) : 'transparent',
            weight: isHighlighted ? 4 : 1.2,
            opacity: 1,
            color: isHighlighted ? '#000000' : '#1a202c',
            fillOpacity: isDistrict ? (isHighlighted ? 0.95 : 0.8) : 0
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
        if (diffData || isDiffMode) return null;
        if (viewLevel !== 'Block' && viewLevel !== 'GP') return null;

        return geojsonData.features.map(feature => {
            const id = getFeatureId(feature);
            const dataObj = stats?.find(s => s.code == id);
            
            let val = 0;
            let bubbleColor = '#2f855a'; // green for block
            let titleType = 'Block Cluster';
            let label = 'Total Plants';
            
            if (viewLevel === 'Block') {
                val = dataObj ? (dataObj.total_plants || 0) : 0;
            } else if (viewLevel === 'GP') {
                val = dataObj ? (dataObj.individual_plants || 0) : 0;
                bubbleColor = '#f97316'; // orange for individual
                titleType = 'Individual Plantations';
                label = 'Individual Plants';
            }

            if (val === 0) return null;

            const latlng = calculateCentroid(feature);
            if (!latlng) return null;

            const radius = Math.sqrt(Number(val)) / 12;
            if (isNaN(radius)) return null;

            const sites = dataObj ? dataObj.site_count : 0;
            const name = feature.properties.name || feature.properties.block_n || feature.properties.gp_name || (dataObj ? dataObj.name : "Unknown");

            return (
                <CircleMarker
                    key={`bubble-${viewLevel}-${id}`}
                    center={latlng}
                    radius={Math.max(radius, 6)}
                    pathOptions={{
                        fillColor: bubbleColor,
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
                                type: titleType,
                                details: viewLevel === 'Block' ? [
                                    { label: 'Total Plants', value: val.toLocaleString() },
                                    { label: 'Plantation Sites', value: sites.toLocaleString() }
                                ] : [
                                    { label: label, value: val.toLocaleString() }
                                ]
                            });
                        }
                    }}
                />
            );
        });
    };

    const geoJsonRef = React.useRef(null);

    React.useEffect(() => {
        if (geoJsonRef.current) {
            // Re-apply style to all features in the GeoJSON layer
            geoJsonRef.current.setStyle(style);
        }
    }, [stats, diffData, isDiffMode, highlightedId, viewLevel]);

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
                ref={geoJsonRef}
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
