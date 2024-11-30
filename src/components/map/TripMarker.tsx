import { useEffect, useCallback, useRef } from 'react';
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import type { Trip } from '../../types/supabase';

interface TripMarkerProps {
  map: Map;
  trip: Trip;
  onClick?: (trip: Trip, coordinates: number[]) => void;
}

export function TripMarker({ map, trip, onClick }: TripMarkerProps) {
  const layerRef = useRef<VectorLayer<VectorSource>>();

  const handleClick = useCallback((event: any) => {
    map.forEachFeatureAtPixel(event.pixel, (feature) => {
      const tripData = feature.get('trip');
      if (tripData?.id === trip.id && onClick) {
        onClick(tripData, event.coordinate);
      }
    });
  }, [map, trip, onClick]);

  useEffect(() => {
    if (!trip.location || !trip.id) return;

    const marker = new Feature({
      geometry: new Point(fromLonLat([trip.location.lng, trip.location.lat])),
      trip: trip
    });

    marker.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          scale: 0.5
        })
      })
    );

    const vectorSource = new VectorSource({
      features: [marker]
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      zIndex: 2 // Ensure markers are above tracks
    });

    layerRef.current = vectorLayer;
    map.addLayer(vectorLayer);

    if (onClick) {
      map.on('click', handleClick);
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
      if (onClick) {
        map.un('click', handleClick);
      }
    };
  }, [map, trip, onClick, handleClick]);

  return null;
}