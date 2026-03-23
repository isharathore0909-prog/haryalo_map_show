import { API_BASE_URL, GEOSERVER_WFS_URL } from '../api/config';

const buildParams = (filters, extra = {}) => {
    const params = new URLSearchParams(extra);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.land_ownership) params.append('land_ownership', filters.land_ownership);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);

    if (filters?.status === true || filters?.status === false || filters?.status === 'true' || filters?.status === 'false') {
        params.append('status', filters.status);
    }
    if (filters?.species) params.append('species', filters.species);
    return params;
};

// Simple cache for API responses
const requestCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const fetchWithCache = async (url) => {
    const cached = requestCache.get(url);
    if (cached && cached.expiry > Date.now()) {
        return cached.data;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();

    requestCache.set(url, {
        data,
        expiry: Date.now() + CACHE_TTL
    });

    return data;
};

export const mapService = {
    fetchDistrictStats: async (filters) => {
        const params = buildParams(filters);
        return fetchWithCache(`${API_BASE_URL}/district-stats/?${params.toString()}`);
    },

    fetchBlockStats: async (districtId, filters) => {
        const params = buildParams(filters, { district: districtId });
        return fetchWithCache(`${API_BASE_URL}/block-stats/?${params.toString()}`);
    },

    fetchGPStats: async (blockId, filters) => {
        const params = buildParams(filters, { block: blockId });
        return fetchWithCache(`${API_BASE_URL}/gp-stats/?${params.toString()}`);
    },

    fetchPlantationPoints: async (id, filters, isDistrict = false) => {
        const extra = {};
        if (id) {
            if (isDistrict) extra.district = id;
            else extra.block = id;
        }
        const params = buildParams(filters, extra);
        return fetchWithCache(`${API_BASE_URL}/plantation-points/?${params.toString()}`);
    },

    fetchSummaryStats: async (filters, districtId = null, blockId = null) => {
        const extra = {};
        if (districtId) extra.district = districtId;
        if (blockId) extra.block = blockId;
        const params = buildParams(filters, extra);
        return fetchWithCache(`${API_BASE_URL}/summary-stats/?${params.toString()}`);
    },

    fetchDepartments: async () => {
        return fetchWithCache(`${API_BASE_URL}/departments/`);
    },

    fetchLandOwnerships: async () => {
        return fetchWithCache(`${API_BASE_URL}/land-ownership/`);
    },

    fetchGeoJSON: async (viewLevel, districtId) => {
        const typeName = viewLevel === 'District' ? 'svg_workspace:districts_view' : 'svg_workspace:block_view';
        const paramsStr = viewLevel === 'Block' ? `district_id:${districtId}` : '';

        let url = `${GEOSERVER_WFS_URL}?service=WFS&version=1.0.0&request=GetFeature&typeName=${typeName}&outputFormat=application/json`;
        if (paramsStr) url += `&viewparams=${encodeURIComponent(paramsStr)}`;

        return fetchWithCache(url);
    }
};

