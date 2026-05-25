import React, { useState, useEffect } from 'react';
import { mapService } from '../../api/mapService';
import MapViewer from './MapViewer';
import SwipeMapViewer from './SwipeMapViewer';
import SelectionPanel from './SelectionPanel';
import { Loader2, ArrowRightLeft } from 'lucide-react';
import './MapViewer.css';
import Breadcrumbs from './Controls/Breadcrumbs';
import { MAP_LEVELS } from '../../constants/mapConstants';

const UnifiedComparisonMap = ({
    sideA,
    sideB,
    activeSide,
    setActiveSide,
    comparisonMode,
    onOpenReport
}) => {
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('split'); // 'split' or 'swipe'

    const handleHome = (side) => {
        if (viewMode === 'swipe') {
            sideA.setViewLevel(MAP_LEVELS.DISTRICT);
            sideA.setSelection({ district: null, districtName: null, block: null, blockName: null, districtBBox: null, blockBBox: null });
            sideA.setSelectionInfo(null);
            sideB.setViewLevel(MAP_LEVELS.DISTRICT);
            sideB.setSelection({ district: null, districtName: null, block: null, blockName: null, districtBBox: null, blockBBox: null });
            sideB.setSelectionInfo(null);
            return;
        }
        const s = side === 'A' ? sideA : sideB;
        s.setViewLevel(MAP_LEVELS.DISTRICT);
        s.setSelection({ district: null, districtName: null, block: null, blockName: null, districtBBox: null, blockBBox: null });
        s.setSelectionInfo(null);
    };

    const handleBack = (side) => {
        if (viewMode === 'swipe') {
            sideA.setSelectionInfo(null);
            sideB.setSelectionInfo(null);
            if (sideA.viewLevel === MAP_LEVELS.GP) {
                sideA.setViewLevel(MAP_LEVELS.BLOCK);
                sideA.setSelection(p => ({ ...p, block: null, blockName: null, blockBBox: null }));
                sideB.setViewLevel(MAP_LEVELS.BLOCK);
                sideB.setSelection(p => ({ ...p, block: null, blockName: null, blockBBox: null }));
            } else {
                handleHome('A');
            }
            return;
        }

        const s = side === 'A' ? sideA : sideB;
        s.setSelectionInfo(null);
        if (s.viewLevel === MAP_LEVELS.GP) {
            s.setViewLevel(MAP_LEVELS.BLOCK);
            s.setSelection(p => ({ ...p, block: null, blockName: null, blockBBox: null }));
        } else {
            handleHome(side);
        }
    };

    const handleEnterSwipeMode = () => {
        setViewMode('swipe');
        // Force Side B to match Side A's geographic view when entering Swipe mode
        sideB.setViewLevel(sideA.viewLevel);
        sideB.setSelection(sideA.selection);
    };

    // --- Rendering Logic ---

    // 1. Single Map View
    if (!comparisonMode) {
        return (
            <div className="map-main-container active-focus" style={{ width: '100%', height: '100%' }}>
                <MapViewer
                    externalFilters={sideA.filters}
                    notifySummary={sideA.setSummary}
                    notifyStats={sideA.setStats}
                    setSelectionInfo={sideA.setSelectionInfo}
                    viewLevel={sideA.viewLevel}
                    setViewLevel={sideA.setViewLevel}
                    selection={sideA.selection}
                    setSelection={sideA.setSelection}
                />
                <SelectionPanel
                    info={sideA.selectionInfo ? { ...sideA.selectionInfo, onOpenReport: () => onOpenReport('A') } : null}
                    setInfo={sideA.setSelectionInfo}
                    side="A"
                    comparisonMode={false}
                />
            </div>
        );
    }

    // 2. Comparison View
    return (
        <div className="unified-comparison-wrapper" style={{ width: '100%', height: '100%' }}>
            {/* Global Premium Control Bar */}
            <div className="comparison-controls-overlay">
                {viewMode === 'split' ? (
                    <>
                        <div className="side-breadcrumb-group left">
                            <div className="side-label side-a-accent">SIDE A</div>
                            <Breadcrumbs
                                district={sideA.selection.districtName}
                                block={sideA.selection.blockName}
                                viewLevel={sideA.viewLevel}
                                onHome={() => handleHome('A')}
                                onBack={() => handleBack('A')}
                            />
                        </div>

                        <div className="view-toggle-group">
                            <button
                                className={`view-toggle-btn ${viewMode === 'split' ? 'active' : ''}`}
                                onClick={() => setViewMode('split')}
                            >
                                <ArrowRightLeft size={16} />
                                <span>Split View</span>
                            </button>
                            <button
                                className={`view-toggle-btn ${viewMode === 'swipe' ? 'active' : ''}`}
                                onClick={handleEnterSwipeMode}
                            >
                                <ArrowRightLeft size={16} />
                                <span>Swipe View</span>
                            </button>
                        </div>

                        <div className="side-breadcrumb-group right">
                            <Breadcrumbs
                                district={sideB.selection.districtName}
                                block={sideB.selection.blockName}
                                viewLevel={sideB.viewLevel}
                                onHome={() => handleHome('B')}
                                onBack={() => handleBack('B')}
                            />
                            <div className="side-label side-b-accent">SIDE B</div>
                        </div>
                    </>
                ) : (
                    <div className="diff-header-unified">

                        <div className="view-toggle-group">
                            <button
                                className={`view-toggle-btn ${viewMode === 'split' ? 'active' : ''}`}
                                onClick={() => setViewMode('split')}
                            >
                                <ArrowRightLeft size={16} />
                                <span>Split View</span>
                            </button>
                            <button
                                className={`view-toggle-btn ${viewMode === 'swipe' ? 'active' : ''}`}
                                onClick={handleEnterSwipeMode}
                            >
                                <ArrowRightLeft size={16} />
                                <span>Swipe View</span>
                            </button>
                        </div>
                        <Breadcrumbs
                            district={sideA.selection.districtName}
                            block={sideA.selection.blockName}
                            viewLevel={sideA.viewLevel}
                            onHome={() => handleHome('A')}
                            onBack={() => handleBack('A')}
                        />
                    </div>
                )}
            </div>

            {viewMode === 'split' ? (
                <div className="dashboard-grid comparison-mode">
                    <div
                        className={`map-main-container side-a ${activeSide === 'A' ? 'active-focus' : ''}`}
                        onClick={() => setActiveSide('A')}
                    >
                        <MapViewer
                            externalFilters={sideA.filters}
                            notifySummary={sideA.setSummary}
                            notifyStats={sideA.setStats}
                            setSelectionInfo={sideA.setSelectionInfo}
                            viewLevel={sideA.viewLevel}
                            setViewLevel={sideA.setViewLevel}
                            selection={sideA.selection}
                            setSelection={sideA.setSelection}
                            comparisonMode={true}
                            hideBreadcrumbs={true}
                        />
                        <SelectionPanel
                            info={sideA.selectionInfo ? { ...sideA.selectionInfo, onOpenReport: () => onOpenReport('A') } : null}
                            setInfo={sideA.setSelectionInfo}
                            side="A"
                            comparisonMode={true}
                        />
                    </div>
                    <div
                        className={`map-main-container side-b ${activeSide === 'B' ? 'active-focus' : ''}`}
                        onClick={() => setActiveSide('B')}
                    >
                        <MapViewer
                            externalFilters={sideB.filters}
                            notifySummary={sideB.setSummary}
                            notifyStats={sideB.setStats}
                            setSelectionInfo={sideB.setSelectionInfo}
                            viewLevel={sideB.viewLevel}
                            setViewLevel={sideB.setViewLevel}
                            selection={sideB.selection}
                            setSelection={sideB.setSelection}
                            comparisonMode={true}
                            hideBreadcrumbs={true}
                        />
                        <SelectionPanel
                            info={sideB.selectionInfo ? { ...sideB.selectionInfo, onOpenReport: () => onOpenReport('B') } : null}
                            setInfo={sideB.setSelectionInfo}
                            side="B"
                            comparisonMode={true}
                        />
                    </div>
                </div>
            ) : viewMode === 'swipe' ? (
                <div className="map-main-container swipe-mode active-focus" style={{ width: '100%', height: '100%' }}>
                    <SwipeMapViewer sideA={sideA} sideB={sideB} onOpenReport={onOpenReport} />
                </div>
            ) : null}
        </div>
    );
};

export default UnifiedComparisonMap;
