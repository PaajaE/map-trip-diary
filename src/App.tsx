import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/layout/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Home } from './pages/Home';
import { TripList } from './pages/trips/TripList';
import { TripForm } from './pages/trips/TripForm';
import { TripDetail } from './pages/trips/TripDetail';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuthStore();

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const initialize = useAuthStore(state => state.initialize);
  const { user, initialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Home />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <PrivateRoute>
              <Layout>
                <TripList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/trips/new"
          element={
            <PrivateRoute>
              <Layout>
                <TripForm />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/trips/:id"
          element={
            <PrivateRoute>
              <Layout>
                <TripDetail />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/observations"
          element={
            <PrivateRoute>
              <Layout>
                <div>Observations Page (Coming soon)</div>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;