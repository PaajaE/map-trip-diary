import { useEffect, useCallback, useRef } from 'react';
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Stroke } from 'ol/style';
import LineString from 'ol/geom/LineString';
import { gpxToGeoJSON } from '../../utils/gpxUtils';
import type { Trip } from '../../types/supabase';
import { fromLonLat } from 'ol/proj';

interface TripTrackProps {
  map: Map;
  trip: Trip;
  onClick?: (trip: Trip, coordinates: number[]) => void;
}

export function TripTrack({ map, trip, onClick }: TripTrackProps) {
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
    if (!trip.gpx_data || !trip.id) return;

    const loadGpxTrack = async () => {
      try {
        if(!trip.gpx_data) return
        const geoJson = await gpxToGeoJSON(trip.gpx_data);
        
        if (!geoJson.features.length) return;

        // Find the first LineString feature (track)
        const trackFeature = geoJson.features.find(f => 
          f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString'
        );

        if (!trackFeature) return;

        let coordinates;
        if (trackFeature.geometry.type === 'LineString') {
          coordinates = trackFeature.geometry.coordinates;
        } else {
          // For MultiLineString, concatenate all line segments
          coordinates = trackFeature.geometry.coordinates.flat();
        }

        const transformedCoords = coordinates.map((coord: number[]) => 
          fromLonLat([coord[0], coord[1]])
        );

        const track = new Feature({
          geometry: new LineString(transformedCoords),
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
        console.error('Error loading GPX track:', error);
      }
    };

    loadGpxTrack();

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