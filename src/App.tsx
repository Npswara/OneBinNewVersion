import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Community from './pages/Community';
import Education from './pages/Education';
import Profile from './pages/Profile';
import FindWasteBank from './pages/FindWasteBank';
import AIScanner from './pages/AIScanner';
import About from './pages/About';
import { signIn } from './services/firebase';
import { LogIn } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest text-xs">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-swiss-white p-6">
        <div className="max-w-xl w-full border-t-8 border-swiss-black pt-12">
          <span className="swiss-label block mb-4">Authentication Required</span>
          <h1 className="text-6xl font-black tracking-tighter mb-8 leading-none">SIGN IN TO <br />ONEBIN.</h1>
          <p className="text-sm leading-relaxed opacity-60 mb-12 max-w-sm">
            Access the systematic waste management dashboard. Join the community to track your environmental impact and earnings.
          </p>
          <button
            onClick={signIn}
            className="swiss-button w-full flex items-center justify-center gap-4 group"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" />
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route 
              path="dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="leaderboard" 
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="community" 
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="education" 
              element={
                <ProtectedRoute>
                  <Education />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="find-waste-bank" 
              element={
                <ProtectedRoute>
                  <FindWasteBank />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="ai-scanner" 
              element={
                <ProtectedRoute>
                  <AIScanner />
                </ProtectedRoute>
              } 
            />
            <Route path="about" element={<About />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
