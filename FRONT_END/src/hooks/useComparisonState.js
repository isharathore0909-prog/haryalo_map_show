import { useState } from 'react';
import { MAP_LEVELS } from '../constants/mapConstants';

export const useComparisonState = () => {
    const [comparisonMode, setComparisonMode] = useState(false);
    const [activeSide, setActiveSide] = useState('A');

    // State for Side A
    const [filtersA, setFiltersA] = useState({
        type: null, status: null, from_date: null, to_date: null, department: null, land_ownership: null
    });
    const [selectionA, setSelectionA] = useState({
        district: null, districtName: null, block: null, blockName: null, districtBBox: null, blockBBox: null
    });
    const [viewLevelA, setViewLevelA] = useState(MAP_LEVELS.DISTRICT);
    const [summaryA, setSummaryA] = useState({ total_sites: 0, total_plants: 0, by_type: {} });
    const [statsA, setStatsA] = useState([]);
    const [selectionInfoA, setSelectionInfoA] = useState(null);

    // State for Side B
    const [filtersB, setFiltersB] = useState({
        type: null, status: null, from_date: null, to_date: null, department: null, land_ownership: null
    });
    const [selectionB, setSelectionB] = useState({
        district: null, districtName: null, block: null, blockName: null, districtBBox: null, blockBBox: null
    });
    const [viewLevelB, setViewLevelB] = useState(MAP_LEVELS.DISTRICT);
    const [summaryB, setSummaryB] = useState({ total_sites: 0, total_plants: 0, by_type: {} });
    const [statsB, setStatsB] = useState([]);
    const [selectionInfoB, setSelectionInfoB] = useState(null);

    return {
        comparisonMode, setComparisonMode,
        activeSide, setActiveSide,
        sideA: {
            filters: filtersA, setFilters: setFiltersA,
            selection: selectionA, setSelection: setSelectionA,
            viewLevel: viewLevelA, setViewLevel: setViewLevelA,
            summary: summaryA, setSummary: setSummaryA,
            stats: statsA, setStats: setStatsA,
            selectionInfo: selectionInfoA, setSelectionInfo: setSelectionInfoA
        },
        sideB: {
            filters: filtersB, setFilters: setFiltersB,
            selection: selectionB, setSelection: setSelectionB,
            viewLevel: viewLevelB, setViewLevel: setViewLevelB,
            summary: summaryB, setSummary: setSummaryB,
            stats: statsB, setStats: setStatsB,
            selectionInfo: selectionInfoB, setSelectionInfo: setSelectionInfoB
        }
    };
};
