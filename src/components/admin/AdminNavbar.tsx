import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Users, LogOut, Menu, X, Shield } from 'lucide-react';
import LogoIcon from '../common/LogoIcon';
import GlowText from '../common/GlowText';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/firebase/auth';

const adminNavLinks = [
  { name: 'Problems', path: '/admin', icon: <FileText size={20} /> },
  { name: 'Players', path: '/admin/players', icon: <Users size={20} /> },
];

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

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

  return (
    <>
      <nav className={`liquid-glass-navbar shadow-lg py-4 sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="w-full px-6 lg:px-10">
          <div className="flex justify-between items-center">
            {/* Logo + Admin badge */}
            <div className="flex-shrink-0">
              <Link
                to="/admin"
                className="flex items-center gap-3 click-animate hover:scale-105 transition-transform"
              >
                <LogoIcon variant="navbar" />
                <GlowText variant="navbar" size="lg">
                  CodoSphere
                </GlowText>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full ml-1">
                  <Shield size={10} />
                  Admin
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center flex-1 justify-center">
              <div className="flex items-center space-x-8">
                {adminNavLinks.map((link) => (
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
                      <motion.div
                        className="h-[3px] w-full nav-indicator-active absolute -bottom-1 left-0"
                        layoutId="admin-navbar-indicator"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side: back to site + sign out */}
            <div className="flex-shrink-0 hidden md:flex items-center gap-3">
              <Link
                to="/"
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/5 border border-white/[0.06] hover:border-white/10 transition-all duration-200"
              >
                Back to Site
              </Link>
              {currentUser && (
                <button
                  className="click-animate flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200"
                  onClick={handleSignOut}
                >
                  <LogOut size={18} />
                  <span>Sign out</span>
                </button>
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

      {/* Mobile menu */}
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
              {adminNavLinks.map((link) => (
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

              <div className="h-px bg-white/10 my-2" />

              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-3 px-4 text-[var(--text)] hover:text-[var(--accent)]"
              >
                Back to Site
              </Link>

              {currentUser && (
                <button
                  className="flex items-center gap-2 py-3 px-4 text-[var(--text)] hover:text-[var(--accent)]"
                  onClick={handleSignOut}
                >
                  <LogOut size={20} />
                  <span>Sign out</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminNavbar;
