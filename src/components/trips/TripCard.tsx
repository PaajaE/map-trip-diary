import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag } from 'lucide-react';
import type { Trip } from '../../types/supabase';
import { formatDateForDisplay } from '../../utils/dateUtils';
import { generateListKey } from '../../utils/keyUtils';

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const coverPhoto = trip.photos?.find(p => p.is_cover_photo) || trip.photos?.[0];

  return (
    <Link 
      to={`/trips/${trip.id}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {coverPhoto && (
        <div className="relative h-48">
          <img
            src={coverPhoto.url}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900">{trip.title}</h3>
        {trip.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{trip.description}</p>
        )}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDateForDisplay(trip.trip_date)}
            </div>
            {trip.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Has location</span>
              </div>
            )}
          </div>
          {trip.tags && trip.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {trip.tags.map((tag) => (
                <span
                  key={generateListKey(tag, trip.id, 'tag', (t) => t)}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}