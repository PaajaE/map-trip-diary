import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Map, List } from 'lucide-react';
import { useTripStore } from '../../store/tripStore';
import { TripCard } from '../../components/trips/TripCard';
import { TripsMapView } from '../../components/trips/TripsMapView';
import { generateListKey } from '../../utils/keyUtils';

type ViewMode = 'list' | 'map';

export function TripList() {
  const { trips, loading, error, fetchTrips } = useTripStore();
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

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
          onClick={() => fetchTrips()}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center px-3 py-1.5 rounded ${
                viewMode === 'list'
                  ? 'bg-white shadow text-gray-800'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <List className="h-4 w-4 mr-1" />
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center px-3 py-1.5 rounded ${
                viewMode === 'map'
                  ? 'bg-white shadow text-gray-800'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Map className="h-4 w-4 mr-1" />
              Map
            </button>
          </div>
        </div>
        <Link
          to="/trips/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12">
          <Map className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No trips yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new trip.</p>
          <div className="mt-6">
            <Link
              to="/trips/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create your first trip
            </Link>
          </div>
        </div>
      ) : viewMode === 'map' ? (
        <TripsMapView trips={trips} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip, index) => (
            <TripCard 
              key={generateListKey(trip, index, 'trip', (t) => t.id)} 
              trip={trip} 
            />
          ))}
        </div>
      )}
    </div>
  );
}