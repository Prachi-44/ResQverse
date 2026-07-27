import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { EmergencyProvider } from './context/EmergencyContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';

// Components
import { Navbar } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';
import { ProtectedRoute, PublicRoute } from './components/RouteGuard';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { SOSSuccess } from './pages/SOSSuccess';
import { FamilyDashboard } from './pages/FamilyDashboard';
import { Profile } from './pages/Profile';
import { EmergencyHistory } from './pages/EmergencyHistory';

import './App.css';

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col guardian-mesh-bg transition-colors duration-300">
      <OfflineBanner />
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sos-success" 
            element={
              <ProtectedRoute>
                <SOSSuccess />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/family-dashboard" 
            element={
              <ProtectedRoute>
                <FamilyDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <EmergencyHistory />
              </ProtectedRoute>
            } 
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <EmergencyProvider>
            <ToastProvider>
              <LanguageProvider>
                <AppContent />
              </LanguageProvider>
            </ToastProvider>
          </EmergencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
