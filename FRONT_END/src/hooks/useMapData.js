import { useState, useEffect } from 'react';
import { mapService } from '../api/mapService';
import { MAP_LEVELS } from '../constants/mapConstants';

export const useMapData = (viewLevel, selection, filters) => {
    const [stats, setStats] = useState([]);
    const [geojsonData, setGeojsonData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({ total_sites: 0, total_plants: 0, by_type: {} });

    // Fetch Regional Stats
    useEffect(() => {
        const fetchStats = async () => {
            setStats([]); // Clear old stats to prevent "ghost" bubbles during transitions
            try {
                let data = [];
                if (viewLevel === MAP_LEVELS.DISTRICT) {
                    data = await mapService.fetchDistrictStats(filters);
                } else if (viewLevel === MAP_LEVELS.BLOCK) {
                    if (selection.district) {
                        data = await mapService.fetchBlockStats(selection.district, filters);
                    }
                } else if (viewLevel === MAP_LEVELS.GP) {
                    if (selection.block) {
                        data = await mapService.fetchGPStats(selection.block, filters);
                    } else if (selection.district) {
                        data = await mapService.fetchBlockStats(selection.district, filters);
                    }
                }
                setStats(data || []);
            } catch (err) {
                console.error("Failed to fetch regional stats:", err);
                setStats([]);
            }
        };

        fetchStats();
    }, [viewLevel, selection.district, selection.block, filters]);

    // Fetch GeoJSON Boundaries
    useEffect(() => {
        const fetchGeoJSON = async () => {
            // Remove immediate reset to prevent white-screen flicker.
            // Data will be swapped once the new fetch is complete.

            if (viewLevel === MAP_LEVELS.GP && !selection.block) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const data = await mapService.fetchGeoJSON(viewLevel, selection.district, selection.block);
                if (data && data.features) {
                    setGeojsonData(data);
                } else {
                    console.warn("WFS response had no features:", data);
                    setGeojsonData(null);
                }
            } catch (err) {
                console.error("Failed to fetch WFS GeoJSON:", err);
                setGeojsonData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchGeoJSON();
    }, [viewLevel, selection.district, selection.block]);

    // Fetch Summary Stats
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await mapService.fetchSummaryStats(filters, selection.district, selection.block);
                setSummary(data || { total_sites: 0, total_plants: 0, by_type: {} });
            } catch (err) {
                console.error("Failed to fetch summary:", err);
            }
        };
        fetchSummary();
    }, [filters, selection.district, selection.block]);

    return { stats, geojsonData, loading, summary };
};
