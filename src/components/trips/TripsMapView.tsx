import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fromLonLat } from 'ol/proj';
import Map from 'ol/Map';
import type { Trip } from '../../types/supabase';
import { BaseMap } from '../map/BaseMap';
import { MapFeatures } from '../map/MapFeatures';
import { TripPopup } from '../map/TripPopup';

interface TripsMapViewProps {
  trips: Trip[];
}

export function TripsMapView({ trips }: TripsMapViewProps) {
  const navigate = useNavigate();
  const [map, setMap] = useState<Map | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [popupCoordinates, setPopupCoordinates] = useState<number[] | null>(null);

  const { center, zoom } = React.useMemo(() => {
    // Filter out trips without valid locations
    const tripsWithLocation = trips.filter(trip => 
      trip && trip.location && trip.location.lat && trip.location.lng
    );

    let center = fromLonLat([15.3350758, 49.7417517]); // Czech Republic center
    let zoom = 7;

    if (tripsWithLocation.length > 0) {
      const sumLat = tripsWithLocation.reduce((sum, trip) => sum + trip.location!.lat, 0);
      const sumLng = tripsWithLocation.reduce((sum, trip) => sum + trip.location!.lng, 0);
      center = fromLonLat([
        sumLng / tripsWithLocation.length,
        sumLat / tripsWithLocation.length,
      ]);
      zoom = tripsWithLocation.length === 1 ? 12 : 8;
    }

    return { center, zoom };
  }, [trips]);

  const handleTripClick = useCallback((trip: Trip, coordinates?: number[]) => {
    if (!trip || !trip.id) return;
    setSelectedTrip(trip);
    if (coordinates) {
      setPopupCoordinates(coordinates);
    }
  }, []);

  const handlePopupClose = useCallback(() => {
    setSelectedTrip(null);
    setPopupCoordinates(null);
  }, []);

  const handleTripDetail = useCallback((trip: Trip) => {
    if (!trip || !trip.id) return;
    navigate(`/trips/${trip.id}`);
  }, [navigate]);

  return (
    <div className="w-full h-[calc(100vh-12rem)] rounded-lg shadow-md relative">
      <BaseMap 
        center={center} 
        zoom={zoom}
        onMapInit={setMap}
      >
        {map && (
          <MapFeatures
            map={map}
            trips={trips}
            onTripClick={handleTripClick}
          />
        )}
      </BaseMap>
      
      {selectedTrip && selectedTrip.id && popupCoordinates && (
        <TripPopup
          trip={selectedTrip}
          coordinates={popupCoordinates}
          onClose={handlePopupClose}
          onClick={() => handleTripDetail(selectedTrip)}
        />
      )}
    </div>
  );
}