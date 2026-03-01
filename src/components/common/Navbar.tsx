import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Memoize nav links to avoid icon re-creation every render
  const mainNavLinks = useMemo(() => [
    { name: 'Code', path: '/code', icon: <Code size={22} /> },
    { name: 'Daily Question', path: '/question-of-the-day', icon: <Calendar size={22} /> },
    { name: 'Ranked Match', path: '/ranked-match', icon: <Swords size={22} /> },
  ], []);

  const dropdownLinks = useMemo(() => [
    { name: 'Study', path: '/study', icon: <BookOpen size={20} /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={20} /> },
    { name: 'Stats', path: '/stats', icon: <BarChart2 size={20} /> },
    { name: 'Home', path: '/profile', icon: <Home size={20} /> },
    { name: 'Contact Us', path: '/contact', icon: <Mail size={20} /> },
  ], []);

  // Close dropdown when clicking outside — single stable listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownButtonRef.current && !dropdownButtonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }, [navigate]);

  const toggleDropdown = useCallback(() => setDropdownOpen(prev => !prev), []);
  const toggleMobileMenu = useCallback(() => setMobileMenuOpen(prev => !prev), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

  return (
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

              {/* More button + dropdown wrapper */}
              <div className="relative">
                <button 
                  ref={dropdownButtonRef}
                  onClick={toggleDropdown}
                  className="click-animate flex items-center gap-2 text-base font-medium transition-colors hover:text-[var(--accent)]"
                >
                  <MoreHorizontal size={22} />
                  <span>More</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Desktop Dropdown — positioned relative to the More button */}
                <div
                  ref={dropdownRef}
                  className={`absolute top-full right-0 mt-3 w-48 rounded-lg shadow-xl overflow-hidden border border-white/15 transition-all duration-150 ease-out origin-top ${
                    dropdownOpen 
                      ? 'opacity-100 scale-100 pointer-events-auto' 
                      : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                  style={{
                    background: 'rgba(30, 18, 18, 0.98)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
                    zIndex: 9999,
                  }}
                >
                  {dropdownLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={closeDropdown}
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
                        onClick={() => { closeDropdown(); handleSignOut(); }}
                        className="flex items-center gap-3 p-4 w-full text-left hover:bg-[var(--primary)] hover:bg-opacity-50 transition-colors text-[var(--text)]"
                      >
                        <LogOut size={20} />
                        <span>Sign out</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
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
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation — inside nav, no extra flow elements */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ease-out ${
          mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container-custom py-4 flex flex-col space-y-4">
          {mainNavLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={closeMobileMenu}
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
              onClick={closeMobileMenu}
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
      </div>
    </nav>
  );
};

export default React.memo(Navbar);