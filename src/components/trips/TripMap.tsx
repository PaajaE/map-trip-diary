import { useState } from 'react';
import { fromLonLat } from 'ol/proj';
import type { Trip } from '../../types/supabase';
import { BaseMap } from '../map/BaseMap';
import { TripMarker } from '../map/TripMarker';
import { TripTrack } from '../map/TripTrack';
import Map from 'ol/Map';

interface TripMapProps {
  trip: Trip;
}

export function TripMap({ trip }: TripMapProps) {
  const [map, setMap] = useState<Map | null>(null);
  
  if (!trip?.location) return null;

  const center = fromLonLat([trip.location.lng, trip.location.lat]);

  return (
    <div className="h-96 rounded-lg overflow-hidden shadow-md">
      <BaseMap 
        center={center} 
        zoom={13}
        onMapInit={setMap}
      >
        {map && (
          <>
            <TripMarker map={map} trip={trip} />
            {trip?.gpx_data && <TripTrack map={map} trip={trip} />}
          </>
        )}
      </BaseMap>
    </div>
  );
}