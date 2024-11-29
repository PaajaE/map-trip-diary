import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';
import { mapyCZService } from '../../services/mapycz/api';
import 'ol/ol.css';

interface TripMapProps {
  location: {
    lat: number;
    lng: number;
  };
}

export function TripMap({ location }: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const turistTiles = mapyCZService.getTileUrl('turist');
    const turistLayer = new TileLayer({
      source: new XYZ({
        url: turistTiles.url,
        minZoom: turistTiles.minZoom,
        maxZoom: turistTiles.maxZoom,
      }),
    });

    // Create marker
    const markerFeature = new Feature({
      geometry: new Point(fromLonLat([location.lng, location.lat])),
    });

    markerFeature.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'https://cdn.mapmarker.io/api/v1/pin?size=50&background=%23DC2626&icon=fa-map-marker&color=%23FFFFFF',
          scale: 0.7,
        }),
      })
    );

    const vectorSource = new VectorSource({
      features: [markerFeature],
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    // Create map
    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [turistLayer, vectorLayer],
      view: new View({
        center: fromLonLat([location.lng, location.lat]),
        zoom: 13,
      }),
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, [location]);

  return (
    <div ref={mapRef} className="w-full h-full" />
  );
}