import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { GEOSERVER_WMS_URL } from '../../../api/config';

const StaticWMSLayer = ({ layers, viewparams = '' }) => {
    const map = useMap();
    const layerRef = useRef(null);

    useEffect(() => {
        if (layerRef.current) {
            map.removeLayer(layerRef.current);
        }

        const wmsOptions = {
            layers: layers,
            format: 'image/png',
            transparent: true,
            version: '1.1.1',
            tileSize: 512,
            updateWhenIdle: true,
            opacity: 0.8
        };

        if (viewparams) {
            wmsOptions.viewparams = viewparams;
        }

        layerRef.current = L.tileLayer.wms(GEOSERVER_WMS_URL, wmsOptions);
        layerRef.current.addTo(map);

        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
            }
        };
    }, [map, layers, viewparams]);

    return null;
};

export default StaticWMSLayer;
