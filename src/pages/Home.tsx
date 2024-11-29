import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Map, Camera, Tag, Mountain, Plus, Compass } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { TripCard } from '../components/trips/TripCard';
import { generateListKey } from '../utils/keyUtils';

export function Home() {
  const { trips, loading, error, fetchTrips } = useTripStore();
  const recentTrips = trips.slice(0, 3);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Document Your Adventures
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600">
          Capture and preserve your family trips with photos, maps, and observations.
          Create lasting memories of your outdoor experiences.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/trips/new"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Start New Trip
          </Link>
          <Link
            to="/trips"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Map className="h-5 w-5 mr-2" />
            View All Trips
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <Camera className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Photo Gallery</h3>
          <p className="text-gray-600">
            Upload and organize photos from your trips, complete with GPS locations and descriptions.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <Compass className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">GPS Tracking</h3>
          <p className="text-gray-600">
            Record your routes with GPS tracking and visualize them on detailed maps.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <Mountain className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nature Log</h3>
          <p className="text-gray-600">
            Document plants, animals, and geological features you encounter on your journeys.
          </p>
        </div>
      </div>

      {/* Recent Trips */}
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Trips</h2>
          <Link
            to="/trips"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all trips
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={() => fetchTrips()}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Try again
            </button>
          </div>
        ) : recentTrips.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {recentTrips.map((trip, index) => (
              <TripCard 
                key={generateListKey(trip, index, 'recent-trip', (t) => t.id)} 
                trip={trip} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Map className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No trips yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first trip.</p>
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
        )}
      </div>
    </div>
  );
}