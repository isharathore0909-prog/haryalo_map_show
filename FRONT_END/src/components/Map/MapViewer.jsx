import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapData } from '../../hooks/useMapData';
import { SimplePositiveCRS, zoomToBBox } from '../../utils/geoUtils';
import { MAP_LEVELS } from '../../constants/mapConstants';
import ZoomControls from './Controls/ZoomControls';
import Breadcrumbs from './Controls/Breadcrumbs';
import GeoJSONLayer from './Layers/GeoJSONLayer';
import WMSLayer from './Layers/WMSLayer';
import PointLayer from './Layers/PointLayer';
import Legend from './Legend';
import './MapViewer.css';

const MapRefCapture = ({ mapRef }) => {
    const map = useMap();
    useEffect(() => {
        mapRef.current = map;
    }, [map, mapRef]);
    return null;
};

const MapClickEvents = ({ onClick }) => {
    useMapEvents({
        click: () => {
            onClick();
        },
    });
    return null;
};

const MapViewer = ({
    externalFilters,
    notifySummary,
    notifyStats,
    setSelectionInfo,
    viewLevel,
    setViewLevel,
    selection,
    setSelection,
    label,
    comparisonMode
}) => {
    const mapRef = useRef(null);
    const [showBoundaries, setShowBoundaries] = useState(false);
    const { stats, geojsonData, loading, summary } = useMapData(viewLevel, selection, externalFilters);

    // Auto-center and invalidate size when layout changes
    useEffect(() => {
        if (mapRef.current) {
            // Multiple triggers to ensure map captures the correct final size
            const invalidate = () => {
                mapRef.current.invalidateSize();
                if (!selection.district && !selection.block) {
                    mapRef.current.flyToBounds([[23.3, 69.4], [30.2, 78.2]], { duration: 1.5, padding: [20, 20] });
                } else {
                    const bounds = selection.blockBBox || selection.districtBBox;
                    if (bounds) zoomToBBox(mapRef.current, bounds);
                }
            };

            const timer1 = setTimeout(invalidate, 100);
            const timer2 = setTimeout(invalidate, 400); // After CSS transition

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [comparisonMode, !!label]);

    // Notify App of new summary stats
    useEffect(() => {
        if (notifySummary) notifySummary(summary);
    }, [summary, notifySummary]);

    // Notify App of regional stats
    useEffect(() => {
        if (notifyStats) notifyStats(stats);
    }, [stats, notifyStats]);

    // Sync names from stats if they are missing in selection (e.g. on navigation or reload)
    useEffect(() => {
        if (!stats || stats.length === 0) return;

        let updatedSelection = null;
        // Sync District Name
        if (selection.district) {
            const isCode = !selection.districtName || selection.districtName === String(selection.district) || /^\d+$/.test(selection.districtName);
            if (isCode) {
                const districtData = stats.find(s => String(s.code).trim() === String(selection.district).trim());
                if (districtData && districtData.name && !/^\d+$/.test(districtData.name)) {
                    const name = districtData.name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
                    updatedSelection = { ...(updatedSelection || selection), districtName: name };
                }
            }
        }

        // Sync Block Name
        if (selection.block) {
            const isCode = !selection.blockName || selection.blockName === String(selection.block) || /^\d+$/.test(selection.blockName);
            if (isCode) {
                const blockData = stats.find(s => String(s.code).trim() === String(selection.block).trim());
                if (blockData && blockData.name && !/^\d+$/.test(blockData.name)) {
                    const name = blockData.name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
                    updatedSelection = { ...(updatedSelection || selection), blockName: name };
                }
            }
        }

        if (updatedSelection) {
            setSelection(updatedSelection);
        }
    }, [stats, selection.district, selection.districtName, selection.block, selection.blockName]);

    const handleHome = () => {
        setViewLevel(MAP_LEVELS.DISTRICT);
        setSelection({ district: null, districtName: null, block: null, blockName: null, districtBBox: null, blockBBox: null });
        setSelectionInfo(null);
        if (mapRef.current) {
            // Rajasthan GPS Bounds
            mapRef.current.flyToBounds([[23.3, 69.4], [30.2, 78.2]], { duration: 1.5, padding: [10, 10] });
        }
    };

    const handleBack = () => {
        setSelectionInfo(null);
        if (viewLevel === MAP_LEVELS.GP) {
            setViewLevel(MAP_LEVELS.BLOCK);
            setSelection(p => ({ ...p, block: null, blockName: null, blockBBox: null }));
            if (selection.districtBBox) {
                zoomToBBox(mapRef.current, selection.districtBBox);
            }
        } else {
            handleHome();
        }
    };

    const handleFeatureClick = (id, bbox, feature) => {
        const itemStats = stats?.find(s => String(s.code) === String(id));
        // Prioritize names from stats (our DB) then feature properties (Geoserver aliases)
        let name = (itemStats ? itemStats.name : null) ||
            feature.properties.block_n ||
            feature.properties.block_name ||
            feature.properties.BLOCK_NAME ||
            feature.properties.BLOCK_N ||
            feature.properties.district_n ||
            feature.properties.district_name ||
            feature.properties.DISTRICT_N ||
            feature.properties.DISTRICT_NAME ||
            feature.properties.GP_FINAL_N ||
            feature.properties.name ||
            id;

        // Ensure name is treated as string for comparison/display
        name = String(name);

        if (typeof name === 'string') {
            name = name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        }

        if (viewLevel === MAP_LEVELS.DISTRICT) {
            setSelection(p => ({ ...p, district: id, districtName: name, districtBBox: bbox }));
            setViewLevel(MAP_LEVELS.BLOCK);
        } else if (viewLevel === MAP_LEVELS.BLOCK) {
            setSelection(p => ({ ...p, block: id, blockName: name, blockBBox: bbox }));
            setViewLevel(MAP_LEVELS.GP);
        }
        setSelectionInfo(null);
        if (bbox) zoomToBBox(mapRef.current, bbox);
    };

    return (
        <div className="map-viewer-wrapper">
            {label && <div className={`side-indicator-badge ${label.toLowerCase().replace(' ', '-')}`}>{label}</div>}
            <Breadcrumbs
                district={selection.districtName}
                block={selection.blockName}
                viewLevel={viewLevel}
                onHome={handleHome}
                onBack={handleBack}
                loading={loading}
            />

            <MapContainer
                center={[26.5, 74.0]}
                zoom={7}
                zoomSnap={0.5}
                className="leaflet-container"
                zoomControl={false}
                attributionControl={false}
            >
                <GeoJSONLayer
                    key={viewLevel} // This ensures proper layer cleanup between levels without excessive flickers
                    geojsonData={geojsonData}
                    stats={stats}
                    viewLevel={viewLevel}
                    districtId={selection.district}
                    blockId={selection.block}
                    filters={externalFilters}
                    onFeatureClick={handleFeatureClick}
                    setSelectionInfo={setSelectionInfo}
                    showBoundaries={showBoundaries}
                />

                <WMSLayer
                    viewLevel={viewLevel}
                    districtId={selection.district}
                    blockId={selection.block}
                />

                <PointLayer
                    viewLevel={viewLevel}
                    blockId={selection.block}
                    filters={externalFilters}
                    setSelectionInfo={setSelectionInfo}
                />

                <MapRefCapture mapRef={mapRef} />
                <ZoomControls />
                <Legend
                    viewLevel={viewLevel}
                    showBoundaries={showBoundaries}
                    onToggleBoundaries={setShowBoundaries}
                />
                <MapClickEvents onClick={() => setSelectionInfo(null)} />
            </MapContainer>
        </div>
    );
};

export default MapViewer;
