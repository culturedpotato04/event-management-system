import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import EventListing from './pages/public/EventListing';
import EventDetail from './pages/public/EventDetail';

// User Pages
import MyBookings from './pages/user/MyBookings';
import BookingDetail from './pages/user/BookingDetail';
import Profile from './pages/user/Profile';
import Notifications from './pages/user/Notifications';

// Organizer Pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<EventListing />} />
          <Route path="/events/:id" element={<EventDetail />} />

          {/* User Routes */}
          <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          
          {/* Organizer Routes */}
          <Route path="/organizer" element={<ProtectedRoute requiredRole="organizer"><OrganizerDashboard /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<div className="p-20 text-center text-2xl">404 - Not Found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
