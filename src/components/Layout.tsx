import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LogIn, Menu, X, Maximize2 } from 'lucide-react';
import { logout, signIn } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const Layout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const handleLogin = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Error logging in: ", error);
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/ai-scanner', label: 'AI Scanner' },
    { path: '/find-waste-bank', label: 'Waste Banks' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/community', label: 'Community' },
    { path: '/education', label: 'Education' },
    { path: '/profile', label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-swiss-white selection:bg-swiss-red selection:text-white">
      {/* Top Navigation Bar - Strict Grid Alignment */}
      <nav className="border-b border-swiss-black sticky top-0 bg-swiss-white z-50 h-16 md:h-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 h-full">
          <div className="flex justify-between items-stretch h-full">
            {/* Logo Section */}
            <div className="flex items-center border-r border-swiss-black pr-4 sm:pr-6 md:pr-12">
              <Link to={user ? "/dashboard" : "/"} className="group flex items-center gap-2 sm:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center overflow-hidden shrink-0">
                  <img 
                    src="/logo.png" 
                    alt="OneBin Logo" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg md:text-2xl font-black tracking-tighter uppercase block leading-none group-hover:text-swiss-green transition-colors">
                    OneBin<span className="text-swiss-green">.</span>
                  </span>
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest hidden xs:block mt-1 opacity-40">Waste Management</span>
                </div>
              </Link>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex flex-grow items-stretch">
              {user && navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 xl:px-8 border-r border-swiss-black text-[10px] xl:text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-swiss-black hover:text-white ${
                    location.pathname === item.path ? 'bg-swiss-black text-white' : 'text-swiss-black'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex lg:hidden flex-grow items-center justify-end border-r border-swiss-black px-2 sm:px-4 md:px-6">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-swiss-black hover:text-swiss-red transition-colors p-2"
              >
                {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>

            {/* Auth Section */}
            <div className="flex items-center pl-4 sm:pl-6 md:pl-12">
              {user ? (
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:text-swiss-red transition-colors"
                >
                  <LogOut className="w-3 h-3" /> <span className="hidden xs:inline">Logout</span>
                </button>
              ) : (
                <button 
                  onClick={handleLogin} 
                  className="bg-swiss-black text-white px-4 py-2 md:px-6 md:py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-swiss-red transition-all"
                >
                  <span className="flex items-center gap-2">
                    <LogIn className="w-3 h-3" /> <span className="hidden xs:inline">Login</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && user && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-b border-swiss-black bg-swiss-white overflow-hidden shadow-xl"
            >
              <div className="flex flex-col">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-6 py-4 border-b border-swiss-black text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                      location.pathname === item.path ? 'bg-swiss-black text-white' : 'text-swiss-black hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12 lg:py-24">
        <Outlet />
      </main>

      {/* Footer - Minimalist Swiss Style */}
      <footer className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12 border-t border-swiss-black mt-12 md:mt-24">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-center md:text-left">
          <div>
            <span className="text-lg md:text-xl font-black uppercase tracking-tighter">OneBin<span className="text-swiss-green">.</span></span>
            <p className="mt-1 md:mt-2 text-[10px] md:text-xs leading-relaxed opacity-60 max-w-xs">
              A waste management education and tracking platform.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <Link to="/about" className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest hover:text-swiss-red transition-colors">
              Project Documentation
            </Link>
            <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-40">
              © 2026 ONEBIN. ALL RIGHTS RESERVED.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
