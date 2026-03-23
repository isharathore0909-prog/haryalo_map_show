import L from 'leaflet';

export const SimplePositiveCRS = L.extend({}, L.CRS.Simple, {
    code: 'EPSG:404000',
    transformation: new L.Transformation(1, 0, -1, 1000)
});

export const calculateBBox = (feature) => {
    if (feature.bbox) return feature.bbox;
    if (!feature.geometry || !feature.geometry.coordinates) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let found = false;

    const processCoords = (coords) => {
        if (!coords) return;
        if (typeof coords[0] === 'number') {
            const [x, y] = coords;
            if (!isNaN(x) && !isNaN(y)) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
                found = true;
            }
        } else if (Array.isArray(coords)) {
            coords.forEach(processCoords);
        }
    };

    processCoords(feature.geometry.coordinates);

    if (!found || minX === Infinity) return null;

    return [minX, minY, maxX, maxY];
};

export const calculateCentroid = (feature) => {
    const bbox = calculateBBox(feature);
    if (!bbox) return null;
    const [minX, minY, maxX, maxY] = bbox;

    const lat = (minY + maxY) / 2;
    const lng = (minX + maxX) / 2;

    if (isNaN(lat) || isNaN(lng)) return null;

    return [lat, lng]; // [lat, lng] format for Leaflet
};

export const zoomToBBox = (map, bbox) => {
    if (!map || !bbox) return;
    const [minX, minY, maxX, maxY] = bbox;

    if (isNaN(minX) || isNaN(minY) || isNaN(maxX) || isNaN(maxY)) return;
    if (minX === Infinity || minY === Infinity) return;

    // Use flyToBounds for a smoother, high-quality cinematic transition
    map.flyToBounds(
        [[minY, minX], [maxY, maxX]],
        {
            padding: [40, 40],
            duration: 1.5,
            easeLinearity: 0.25
        }
    );
};
