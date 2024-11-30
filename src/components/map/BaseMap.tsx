import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { defaults as defaultControls } from 'ol/control';
import 'ol/ol.css';

interface BaseMapProps {
  center: number[];
  zoom: number;
  children?: React.ReactNode;
  onMapInit?: (map: Map) => void;
}

export function BaseMap({ center, zoom, children, onMapInit }: BaseMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center,
        zoom,
        minZoom: 5,
        maxZoom: 19
      }),
      controls: defaultControls({
        attribution: true,
        zoom: true,
        rotate: false
      })
    });

    mapInstance.current = map;
    if (onMapInit) {
      onMapInit(map);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, []);

  // Update view when center or zoom changes
  useEffect(() => {
    if (!mapInstance.current) return;

    const view = mapInstance.current.getView();
    view.animate({
      center,
      zoom,
      duration: 250
    });
  }, [center, zoom]);

  return (
    <div ref={mapRef} className="w-full h-full">
      {children}
    </div>
  );
}