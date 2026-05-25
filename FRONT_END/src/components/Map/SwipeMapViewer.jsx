import React, { useState, useRef, useEffect } from 'react';
import MapViewer from './MapViewer';
import { ArrowRightLeft } from 'lucide-react';

const SwipeMapViewer = ({ sideA, sideB, onOpenReport }) => {
    const [position, setPosition] = useState(50);
    const containerRef = useRef(null);
    const mapARef = useRef(null);
    const mapBRef = useRef(null);
    const isSyncing = useRef(false);

    // Synchronize Leaflet maps
    useEffect(() => {
        const mapA = mapARef.current;
        const mapB = mapBRef.current;

        if (!mapA || !mapB) return;

        const syncMaps = (source, target) => {
            const handleMove = () => {
                if (isSyncing.current) return;
                isSyncing.current = true;
                target.setView(source.getCenter(), source.getZoom(), { animate: false });
                isSyncing.current = false;
            };
            source.on('move', handleMove);
            return () => source.off('move', handleMove);
        };

        const cleanupA = syncMaps(mapA, mapB);
        const cleanupB = syncMaps(mapB, mapA);

        return () => {
            cleanupA();
            cleanupB();
        };
    }, [mapARef.current, mapBRef.current]);

    const handleMouseDown = (e) => {
        e.preventDefault();
        
        const handleMouseMove = (moveEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            let percent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
            percent = Math.max(0, Math.min(100, percent));
            setPosition(percent);
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleSetSelection = (updater) => {
        sideA.setSelection(updater);
        sideB.setSelection(updater);
    };

    const handleSetViewLevel = (level) => {
        sideA.setViewLevel(level);
        sideB.setViewLevel(level);
    };

    const handleSetSelectionInfo = (info) => {
        sideA.setSelectionInfo(info);
        sideB.setSelectionInfo(info);
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* Map A (Bottom layer - Left side) */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <MapViewer
                    externalFilters={sideA.filters}
                    notifySummary={sideA.setSummary}
                    notifyStats={sideA.setStats}
                    setSelectionInfo={handleSetSelectionInfo}
                    viewLevel={sideA.viewLevel}
                    setViewLevel={handleSetViewLevel}
                    selection={sideA.selection}
                    setSelection={handleSetSelection}
                    comparisonMode={true}
                    hideBreadcrumbs={true}
                    onMapReady={(m) => { mapARef.current = m; }}
                />
            </div>

            {/* Map B (Top layer - Right side, clipped) */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                clipPath: `polygon(${position}% 0, 100% 0, 100% 100%, ${position}% 100%)`,
                pointerEvents: 'none' // Let map interactions fall through to Map A
            }}>
                <MapViewer
                    externalFilters={sideB.filters}
                    notifySummary={sideB.setSummary}
                    notifyStats={sideB.setStats}
                    setSelectionInfo={handleSetSelectionInfo}
                    viewLevel={sideB.viewLevel}
                    setViewLevel={handleSetViewLevel}
                    selection={sideB.selection}
                    setSelection={handleSetSelection}
                    comparisonMode={true}
                    hideBreadcrumbs={true}
                    onMapReady={(m) => { mapBRef.current = m; }}
                />
            </div>

            {/* Divider Handle */}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    position: 'absolute',
                    left: `${position}%`,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                    transform: 'translateX(-50%)',
                    cursor: 'ew-resize',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#ffffff',
                    borderRadius: '50%',
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#333'
                }}>
                    <ArrowRightLeft size={18} />
                </div>
            </div>
            
            {/* Badges to indicate sides */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                padding: '6px 12px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: '4px',
                fontWeight: 'bold',
                zIndex: 900,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                pointerEvents: 'none'
            }}>
                SIDE A
            </div>
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '6px 12px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: '4px',
                fontWeight: 'bold',
                zIndex: 900,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                pointerEvents: 'none'
            }}>
                SIDE B
            </div>
        </div>
    );
};

export default SwipeMapViewer;
