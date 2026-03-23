import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_LEVELS } from '../../../constants/mapConstants';
import { GEOSERVER_WMS_URL } from '../../../api/config';

const WMSLayer = ({ viewLevel, districtId, blockId }) => {
    const map = useMap();
    const layerRef = useRef(null);

    useEffect(() => {
        if (layerRef.current) {
            map.removeLayer(layerRef.current);
            layerRef.current = null;
        }

        if (viewLevel !== MAP_LEVELS.GP) return;

        const layerName = 'svg_workspace:gp_view';
        const paramsStr = `block_id:${blockId}`;

        const wmsOptions = {
            layers: layerName,
            format: 'image/png',
            transparent: true,
            version: '1.1.1',
            t: Date.now(),
            tileSize: 512,
            updateWhenIdle: true,
            viewparams: paramsStr
        };

        layerRef.current = L.tileLayer.wms(GEOSERVER_WMS_URL, wmsOptions);
        layerRef.current.addTo(map);

        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
                layerRef.current = null;
            }
        };
    }, [map, viewLevel, districtId, blockId]);

    return null;
};

export default WMSLayer;
