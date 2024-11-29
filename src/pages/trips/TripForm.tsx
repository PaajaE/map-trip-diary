import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { useTripStore } from '../../store/tripStore';
import { LocationPicker } from '../../components/trips/LocationPicker';
import { FileUpload } from '../../components/trips/FileUpload';
import { PhotoUpload } from '../../components/trips/PhotoUpload';
import { TagInput } from '../../components/trips/TagInput';
import { formatDateForAPI } from '../../utils/dateUtils';

export function TripForm() {
  const navigate = useNavigate();
  const createTrip = useTripStore(state => state.createTrip);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trip_date: new Date().toISOString().split('T')[0],
    location: null as { lat: number; lng: number } | null,
    gpx_file: null as File | null,
    photos: [] as File[],
    tags: [] as string[]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationSelect = useCallback((location: { lat: number; lng: number } | null) => {
    setFormData(prev => ({ ...prev, location }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createTrip({
        title: formData.title,
        description: formData.description || undefined,
        trip_date: formatDateForAPI(formData.trip_date),
        location: formData.location || undefined,
        photos: formData.photos.length > 0 ? formData.photos : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        gpx_file: formData.gpx_file || undefined,
      });

      navigate('/trips');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Trip</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Trip Title
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="trip_date" className="block text-sm font-medium text-gray-700">
            Trip Date
          </label>
          <input
            type="date"
            id="trip_date"
            required
            value={formData.trip_date}
            onChange={(e) => setFormData(prev => ({ ...prev, trip_date: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <LocationPicker onLocationSelect={handleLocationSelect} />

        <PhotoUpload
          onPhotosChange={(photos) => setFormData(prev => ({ ...prev, photos }))}
        />

        <FileUpload
          accept=".gpx"
          label="GPX Track"
          onChange={(file) => setFormData(prev => ({ ...prev, gpx_file: file }))}
        />

        <TagInput
          onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            Save Trip
          </button>
        </div>
      </form>
    </div>
  );
}