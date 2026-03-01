import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Calendar, Swords, BookOpen, Trophy, BarChart2, Home, Mail, LogOut, Menu, X, ChevronDown, MoreHorizontal } from 'lucide-react';
import LogoIcon from './LogoIcon';
import GlowText from './GlowText';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/firebase/auth';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

  // Main navigation links
  const mainNavLinks = [
    { name: 'Code', path: '/code', icon: <Code size={22} /> },
    { name: 'Daily Question', path: '/question-of-the-day', icon: <Calendar size={22} /> },
    { name: 'Ranked Match', path: '/ranked-match', icon: <Swords size={22} /> },
  ];

  // Links moved to dropdown
  const dropdownLinks = [
    { name: 'Study', path: '/study', icon: <BookOpen size={20} /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={20} /> },
    { name: 'Stats', path: '/stats', icon: <BarChart2 size={20} /> },
    { name: 'Home', path: '/profile', icon: <Home size={20} /> },
    { name: 'Contact Us', path: '/contact', icon: <Mail size={20} /> },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownButtonRef.current && !dropdownButtonRef.current.contains(event.target as Node)) {
        const dropdownElement = document.getElementById('navbar-dropdown');
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setDropdownOpen(false);
        }
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Close dropdown when route changes
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location]);

  // Scroll-aware navbar opacity
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Get dropdown position
  const getDropdownPosition = () => {
    if (dropdownButtonRef.current) {
      const rect = dropdownButtonRef.current.getBoundingClientRect();
      return {
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      };
    }
    return { top: 80, right: 32 };
  };

  return (
    <>
      {/* Main Navbar - Fixed height and structure */}
      <nav className={`liquid-glass-navbar shadow-lg py-4 sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="w-full px-6 lg:px-10">
          <div className="flex justify-between items-center">
            {/* Logo and Brand - Extreme left */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="flex items-center gap-3 click-animate hover:scale-105 transition-transform"
              >
                <LogoIcon variant="navbar" />
                <GlowText variant="navbar" size="lg">
                  CodoSphere
                </GlowText>
              </Link>
            </div>

            {/* Desktop Navigation - Center */}
            <div className="hidden md:flex items-center flex-1 justify-center">
              <div className="flex items-center space-x-8">
                {mainNavLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="nav-link-hover click-animate flex items-center gap-2 text-base font-medium transition-colors hover:text-[var(--accent)] relative overflow-visible group"
                  >
                    <span className="group-hover:scale-110 transition-transform">
                      {link.icon}
                    </span>
                    <span>{link.name}</span>
                    {location.pathname === link.path && (
                      <div className="h-[3px] w-full nav-indicator-active absolute -bottom-1 left-0" />
                    )}
                  </Link>
                ))}

                {/* More button - NO dropdown content in navbar */}
                <button 
                  ref={dropdownButtonRef}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="click-animate flex items-center gap-2 text-base font-medium transition-colors hover:text-[var(--accent)]"
                >
                  <MoreHorizontal size={22} />
                  <span>More</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Auth Button - Right side */}
            <div className="flex-shrink-0">
              {currentUser ? (
                <button 
                  className="click-animate hidden md:flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200"
                  onClick={handleSignOut}
                >
                  <LogOut size={18} />
                  <span>Sign out</span>
                </button>
              ) : (
                <Link 
                  to="/login"
                  className="click-animate hidden md:flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200"
                >
                  <span>Sign in</span>
                </Link>
              )}
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-[var(--text)] p-2 rounded-lg hover:bg-[var(--accent)] hover:bg-opacity-10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Inside navbar but separate */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden dropdown-menu bg-opacity-95 backdrop-blur-md sticky top-0 z-30"
          >
            <div className="container-custom py-4 flex flex-col space-y-4">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                    location.pathname === link.path 
                      ? 'bg-[var(--accent)] bg-opacity-20 text-[var(--accent)]' 
                      : 'text-[var(--text)] hover:bg-[var(--accent)] hover:bg-opacity-10'
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}

              <div className="h-px bg-white/10 my-2"></div>
              
              {dropdownLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                    location.pathname === link.path 
                      ? 'bg-[var(--accent)] bg-opacity-20 text-[var(--accent)]' 
                      : 'text-[var(--text)] hover:bg-[var(--accent)] hover:bg-opacity-10'
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
              
              {currentUser ? (
                <button 
                  className="flex items-center gap-2 py-3 px-4 text-[var(--text)] hover:text-[var(--accent)]"
                  onClick={handleSignOut}
                >
                  <LogOut size={20} />
                  <span>Sign out</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 py-3 px-4 text-[var(--text)] hover:text-[var(--accent)]"
                >
                  <LogOut size={20} />
                  <span>Sign in</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Dropdown Menu - Completely separate from navbar, using portal-like positioning */}
      {dropdownOpen && (
        <div
          id="navbar-dropdown"
          className="fixed z-50"
          style={{
            top: `${getDropdownPosition().top}px`,
            right: `${getDropdownPosition().right}px`,
          }}
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-48 dropdown-menu rounded-lg shadow-xl overflow-hidden border border-white/15"
            >
              {dropdownLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-3 p-4 transition-colors ${
                    location.pathname === link.path 
                      ? 'bg-white bg-opacity-10 text-white border-l-4 border-[var(--accent)] font-medium' 
                      : 'text-[var(--text)] hover:bg-[var(--primary)] hover:bg-opacity-50'
                  }`}
                >
                  <span className={location.pathname === link.path ? 'text-[var(--accent)]' : ''}>
                    {link.icon}
                  </span>
                  <span>{link.name}</span>
                </Link>
              ))}
              
              {currentUser && (
                <>
                  <div className="h-px bg-white/10 mx-4"></div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-3 p-4 w-full text-left hover:bg-[var(--primary)] hover:bg-opacity-50 transition-colors text-[var(--text)]"
                  >
                    <LogOut size={20} />
                    <span>Sign out</span>
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export default Navbar;