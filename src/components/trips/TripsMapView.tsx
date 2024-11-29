import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import Overlay from 'ol/Overlay';
import { mapyCZService } from '../../services/mapycz/api';
import type { Trip } from '../../types/supabase';
import 'ol/ol.css';

interface TripsMapViewProps {
  trips: Trip[];
}

export function TripsMapView({ trips }: TripsMapViewProps) {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  useEffect(() => {
    if (!mapRef.current || !popupRef.current || mapInstance.current) return;

    const tripsWithLocation = trips.filter(trip => trip.location);

    // Create base layer
    const turistTiles = mapyCZService.getTileUrl('turist');
    const turistLayer = new TileLayer({
      source: new XYZ({
        url: turistTiles.url,
        minZoom: turistTiles.minZoom,
        maxZoom: turistTiles.maxZoom,
      }),
    });

    // Create markers
    const features = tripsWithLocation.map(trip => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([trip.location!.lng, trip.location!.lat])),
        trip: trip,
      });

      feature.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: 'https://cdn.mapmarker.io/api/v1/pin?size=50&background=%234F46E5&icon=fa-map-marker&color=%23FFFFFF',
            scale: 0.7,
          }),
        })
      );

      return feature;
    });

    const vectorSource = new VectorSource({
      features: features,
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    // Create popup overlay
    const popup = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      offset: [0, -20],
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });

    // Calculate center and zoom
    let center = fromLonLat([15.3350758, 49.7417517]); // Czech Republic center
    let zoom = 7;

    if (tripsWithLocation.length > 0) {
      const sumLat = tripsWithLocation.reduce((sum, trip) => sum + trip.location!.lat, 0);
      const sumLng = tripsWithLocation.reduce((sum, trip) => sum + trip.location!.lng, 0);
      center = fromLonLat([
        sumLng / tripsWithLocation.length,
        sumLat / tripsWithLocation.length,
      ]);
    }

    // Create map
    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [turistLayer, vectorLayer],
      overlays: [popup],
      view: new View({
        center: center,
        zoom: zoom,
      }),
    });

    // Add click handler
    mapInstance.current.on('click', (event) => {
      const feature = mapInstance.current?.forEachFeatureAtPixel(
        event.pixel,
        feature => feature
      );

      if (feature) {
        const trip = (feature as any).get('trip') as Trip;
        const coordinates = (feature.getGeometry() as Point).getCoordinates();
        
        setSelectedTrip(trip);
        popup.setPosition(coordinates);
      } else {
        setSelectedTrip(null);
        popup.setPosition(undefined);
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, [trips]);

  return (
    <>
      <div ref={mapRef} className="w-full h-[calc(100vh-12rem)] rounded-lg shadow-md" />
      <div ref={popupRef} className="hidden">
        {selectedTrip && (
          <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
            <h3 className="font-medium text-gray-900">{selectedTrip.title}</h3>
            {selectedTrip.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {selectedTrip.description}
              </p>
            )}
            <button
              onClick={() => navigate(`/trips/${selectedTrip.id}`)}
              className="mt-3 w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
            >
              View Details
            </button>
          </div>
        )}
      </div>
    </>
  );
}