// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SpotifyAuthProvider } from './context/SpotifyAuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import HomePage from './pages/Home/Home';
// import AboutPage from './pages/About/About';
import DashboardPage from './pages/Dashboard/Dashboard';
// import ProfilePage from './pages/Profile/Profile';
import CallbackPage from './pages/Callback/Callback';
import NotFoundPage from './pages/NotFound/NotFound';
import UserSelectionPage from './pages/UserSelection/UserSelection';
import ArtworkGeneratorPage from './pages/ArtworkGenerator/ArtworkGenerator';
import ArtistMarketingPage from './pages/ArtistMarketing/ArtistMarketing';

const App: React.FC = () => {
  
  return (
    <Router>
      <SpotifyAuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public routes */}
          <Route index element={<HomePage />} />
            {/* <Route path="about" element={<AboutPage />} /> */}
          <Route path="/callback" element={<CallbackPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/user-selection" 
              element={
                <ProtectedRoute>
                  <UserSelectionPage />
                </ProtectedRoute>
              }
            />

            <Route 
              path="/artwork-generator" 
              element={
                <ProtectedRoute>
                  <ArtworkGeneratorPage />
                </ProtectedRoute>
              }
            />

            <Route 
              path="/artist-marketing" 
              element={
                <ProtectedRoute>
                  <ArtistMarketingPage />
                </ProtectedRoute>
              }
            />


            
            
            {/* <Route 
              path="profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            /> */}
            
            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </SpotifyAuthProvider>
    </Router>
  );
};

export default App;