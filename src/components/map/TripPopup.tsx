import React from 'react';
import { MapPin, Calendar } from 'lucide-react';
import type { Trip } from '../../types/supabase';
import { formatDateForDisplay } from '../../utils/dateUtils';

interface TripPopupProps {
  trip: Trip;
  coordinates: number[];
  onClose: () => void;
  onClick: () => void;
}

export function TripPopup({ trip, onClose, onClick }: TripPopupProps) {
  const coverPhoto = trip.photos?.find(p => p.is_cover_photo) || trip.photos?.[0];

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 min-w-[300px] z-10">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ×
      </button>
      
      <div className="space-y-3">
        {coverPhoto?.url && (
          <div className="relative h-32 -mx-4 -mt-4 mb-4">
            <img
              src={coverPhoto.url}
              alt={trip.title}
              className="w-full h-full object-cover rounded-t-lg"
            />
          </div>
        )}

        <h3 className="font-medium text-lg text-gray-900">{trip.title}</h3>
        
        {trip.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{trip.description}</p>
        )}
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {trip.trip_date && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDateForDisplay(trip.trip_date)}
            </div>
          )}
          
          {trip.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {trip.location.lat.toFixed(4)}, {trip.location.lng.toFixed(4)}
              </span>
            </div>
          )}
        </div>

        {trip.tags && trip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {trip.tags.map(tag => (
              <span 
                key={tag}
                className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={onClick}
          className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}