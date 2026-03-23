import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { mapService } from '../../../api/mapService';
import { useState } from 'react';

const HeatmapLayer = ({ viewLevel, districtId, filters, points: externalPoints }) => {
    const map = useMap();
    const [points, setPoints] = useState([]);

    useEffect(() => {
        if (externalPoints) {
            const heatPoints = externalPoints
                .map(p => [
                    p.location_lat,
                    p.location_long,
                    0.8 // High constant intensity for dashboard visibility
                ]);
            setPoints(heatPoints);
            return;
        }

        if (viewLevel !== 'Block' || !districtId) {
            setPoints([]);
            return;
        }

        const fetchAllPoints = async () => {
            try {
                // Fetch all points in the district for the heatmap
                const response = await mapService.fetchPlantationPoints(districtId, filters, true);
                const pData = Array.isArray(response) ? response : (response.results || []);

                // Format for leaflet-heat: [lat, lng, intensity]
                const heatPoints = pData
                    .filter(p => p.location_lat && p.location_long)
                    .map(p => [
                        p.location_lat,
                        p.location_long,
                        // Added a baseline intensity (0.1) and increased scaling factor
                        Math.min(0.1 + parseFloat(p.number_of_plants) / 100, 1)
                    ]);

                setPoints(heatPoints);
            } catch (err) {
                console.error("Heatmap fetch failed:", err);
            }
        };

        fetchAllPoints();
    }, [viewLevel, districtId, filters, externalPoints]);

    useEffect(() => {
        if (!map || points.length === 0) return;

        const zoom = map.getZoom();
        const isMiniMap = zoom <= 7;

        const heatLayer = L.heatLayer(points, {
            radius: isMiniMap ? 25 : 18,
            blur: isMiniMap ? 15 : 25,
            maxZoom: 15,
            max: 0.6,
            minOpacity: isMiniMap ? 0.5 : 0.3,
            gradient: {
                0.2: '#2d3436',
                0.4: '#6c5ce7',
                0.6: '#fd79a8',
                0.8: '#fab1a0',
                1.0: '#ffeaa7'
            }
        }).addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, points]);

    return null;
};

export default HeatmapLayer;
