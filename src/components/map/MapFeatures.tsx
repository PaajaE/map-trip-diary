import React from 'react';
import Map from 'ol/Map';
import type { Trip } from '../../types/supabase';
import { TripMarker } from './TripMarker';
import { TripPath } from './TripPath';

interface MapFeaturesProps {
  map: Map;
  trips: Trip[];
  onTripClick?: (trip: Trip, coordinates: number[]) => void;
}

export function MapFeatures({ map, trips, onTripClick }: MapFeaturesProps) {
  // Filter out invalid trips and ensure they have either location or path
  const validTrips = trips.filter(trip => 
    trip && 
    trip.id && 
    (
      (trip.location && trip.location.lat && trip.location.lng) || 
      (trip.trip_path && trip.trip_path.coordinates?.length > 0)
    )
  );

  return (
    <>
      {validTrips.map(trip => (
        <React.Fragment key={`trip-${trip.id}`}>
          {trip.location && (
            <TripMarker 
              map={map} 
              trip={trip} 
              onClick={onTripClick}
            />
          )}
          {trip.trip_path && (
            <TripPath 
              map={map} 
              trip={trip} 
              onClick={onTripClick}
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
}