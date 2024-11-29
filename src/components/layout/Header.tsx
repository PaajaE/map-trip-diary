import React from 'react';
import { Link } from 'react-router-dom';
import { Map, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function Header() {
  const { user, signOut } = useAuthStore();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Map className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Trip Map Diary</span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/trips" className="text-gray-700 hover:text-indigo-600">
                  My Trips
                </Link>
                <Link to="/observations" className="text-gray-700 hover:text-indigo-600">
                  Observations
                </Link>
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="flex items-center text-gray-700 hover:text-indigo-600">
                    <User className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center text-gray-700 hover:text-indigo-600"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}