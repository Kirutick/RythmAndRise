import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import AdminDashboard from './AdminDashboard';
import GalleryPage from './GalleryPage';
import LoginPage from './LoginPage';
import UserDashboard from './UserDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

import { SessionProvider } from './hooks/useSessions';

export default function App() {
  return (
    <SessionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard" element={
            <ProtectedRoute allowedRole="user">
              <UserDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </SessionProvider>
  );
}