import { useState, useEffect } from 'react';
import { mapService } from '../api/mapService';

export const useFilterOptions = () => {
    const [options, setOptions] = useState({
        departments: [],
        landOwnerships: [],
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [deps, lands] = await Promise.all([
                    mapService.fetchDepartments(),
                    mapService.fetchLandOwnerships()
                ]);
                setOptions({
                    departments: deps,
                    landOwnerships: lands,
                    loading: false,
                    error: null
                });
            } catch (err) {
                console.error("Failed to fetch filter options:", err);
                setOptions(prev => ({ ...prev, loading: false, error: err }));
            }
        };
        fetchOptions();
    }, []);

    return options;
};
