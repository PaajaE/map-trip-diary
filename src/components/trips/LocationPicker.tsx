import React, { useState, useEffect, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number } | null) => void;
}

export function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const { latitude, longitude, error, loading } = useGeolocation();
  const [locationEnabled, setLocationEnabled] = useState(false);

  const handleLocationChange = useCallback(() => {
    if (locationEnabled && latitude && longitude) {
      onLocationSelect({ lat: latitude, lng: longitude });
    } else {
      onLocationSelect(null);
    }
  }, [latitude, longitude, locationEnabled, onLocationSelect]);

  useEffect(() => {
    handleLocationChange();
  }, [handleLocationChange]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Location
      </label>
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm">
          <MapPin className="h-5 w-5 text-gray-400 mr-2" />
          {loading ? (
            <span className="text-gray-500">Detecting location...</span>
          ) : error ? (
            <span className="text-red-500">{error}</span>
          ) : latitude && longitude && locationEnabled ? (
            <span className="text-gray-700">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </span>
          ) : (
            <span className="text-gray-500">No location selected</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setLocationEnabled(!locationEnabled)}
          className={`
            px-3 py-1 rounded-md text-sm font-medium
            ${locationEnabled
              ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          {locationEnabled ? 'Disable Location' : 'Enable Location'}
        </button>
      </div>
    </div>
  );
}