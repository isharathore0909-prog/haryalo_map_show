import { useState, useEffect } from 'react';
import { mapService } from '../api/mapService';

export const useAllPoints = (filters, viewLevel, selection) => {
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPoints = async () => {
            setLoading(true);
            try {
                let id = null;
                let isDistrict = false;

                if (viewLevel === 'Block') {
                    id = selection?.district || null;
                    isDistrict = true;
                } else if (viewLevel === 'GP') {
                    id = selection?.block || null;
                    isDistrict = false;
                }

                const response = await mapService.fetchPlantationPoints(id, filters, isDistrict);
                const pData = Array.isArray(response) ? response : (response?.results || []);
                const validPoints = pData.filter(p => p.location_lat && p.location_long);
                setPoints(validPoints);
            } catch (err) {
                console.error("Failed to fetch points for dashboard:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPoints();
    }, [
        JSON.stringify(filters),
        viewLevel,
        selection?.district,
        selection?.block
    ]);

    return { points, loading };
};
