import React from 'react';
import { useMap } from 'react-leaflet';
import { Plus, Minus } from 'lucide-react';

const ZoomControls = () => {
    const map = useMap();
    return (
        <div className="map-controls-right">
            <div className="control-group">
                <button className="control-btn" onClick={() => map.zoomIn()}><Plus size={20} /></button>
                <div className="divider"></div>
                <button className="control-btn" onClick={() => map.zoomOut()}><Minus size={20} /></button>
            </div>
        </div>
    );
};

export default ZoomControls;
