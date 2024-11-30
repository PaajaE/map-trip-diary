import { useEffect, useCallback, useRef } from 'react';
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Stroke } from 'ol/style';
import LineString from 'ol/geom/LineString';
import { fromLonLat } from 'ol/proj';
import type { Trip } from '../../types/supabase';

interface TripPathProps {
  map: Map;
  trip: Trip;
  onClick?: (trip: Trip, coordinates: number[]) => void;
}

export function TripPath({ map, trip, onClick }: TripPathProps) {
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
    if (!trip.trip_path?.coordinates || !trip.id) return;

    try {
      const coordinates = trip.trip_path.coordinates.map((coord: number[]) => 
        fromLonLat([coord[0], coord[1]])
      );

      const track = new Feature({
        geometry: new LineString(coordinates),
        trip: trip
      });

      track.setStyle(
        new Style({
          stroke: new Stroke({
            color: '#3b82f6',
            width: 3
          })
        })
      );

      const vectorSource = new VectorSource({
        features: [track]
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        zIndex: 1 // Ensure tracks are below markers
      });

      layerRef.current = vectorLayer;
      map.addLayer(vectorLayer);

      if (onClick) {
        map.on('click', handleClick);
      }
    } catch (error) {
      console.error('Error creating trip path:', error);
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