import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { useTripStore } from '../../store/tripStore';
import { TripMap } from '../../components/trips/TripMap';
import { PhotoGallery } from '../../components/trips/PhotoGallery';
import { formatDateForDisplay } from '../../utils/dateUtils';
import { generateListKey } from '../../utils/keyUtils';

export function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTrip, loading, error, fetchTripById } = useTripStore();

  useEffect(() => {
    if (!id) {
      navigate('/trips');
      return;
    }

    fetchTripById(id);
  }, [id, fetchTripById, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => id && fetchTripById(id)}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!currentTrip) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600">Trip not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{currentTrip.title}</h1>
        <div className="mt-4 flex items-center space-x-4 text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {formatDateForDisplay(currentTrip.trip_date)}
          </div>
          {currentTrip.location && (
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>
                {currentTrip.location.lat.toFixed(6)}, {currentTrip.location.lng.toFixed(6)}
              </span>
            </div>
          )}
        </div>
      </div>

      {currentTrip.description && (
        <div className="prose max-w-none">
          <p className="text-gray-700">{currentTrip.description}</p>
        </div>
      )}

      {currentTrip.tags && currentTrip.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentTrip.tags.map((tag) => (
            <span
              key={generateListKey(tag, currentTrip.id, 'detail-tag', (t) => t)}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {currentTrip.location && (
        <div className="h-96 rounded-lg overflow-hidden shadow-md">
          <TripMap location={currentTrip.location} />
        </div>
      )}

      {currentTrip.photos && currentTrip.photos.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Photos</h2>
          <PhotoGallery trip_id={currentTrip.id} photos={currentTrip.photos} />
        </div>
      )}
    </div>
  );
}