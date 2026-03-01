import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';

// Eager-loaded pages (common entry points)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

// Lazy-loaded pages
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CodePage = lazy(() => import('./pages/CodePage'));
const CodeEditorPage = lazy(() => import('./pages/CodeEditorPage'));
const QuestionOfTheDayPage = lazy(() => import('./pages/QuestionOfTheDayPage'));
const RankedMatchPage = lazy(() => import('./pages/RankedMatchPage'));
const StudyPage = lazy(() => import('./pages/StudyPage'));
const TopicPage = lazy(() => import('./pages/TopicPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminPlayerManagement = lazy(() => import('./pages/AdminPlayerManagement'));

// Components
import AdminRoute from './components/admin/AdminRoute';

// Lazy-load heavy visual components (not needed for first paint)
const ParticleBackground = lazy(() => import('./components/common/ParticleBackground'));

// Branded page loader — logo pulse + shimmer text
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--primary)]">
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Pulsing logo ring */}
      <motion.div
        className="w-14 h-14 mx-auto mb-4 rounded-full border-2 border-transparent"
        style={{
          borderImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary)) 1',
          borderRadius: '50%',
          border: '2px solid transparent',
          backgroundImage: 'linear-gradient(var(--primary), var(--primary)), linear-gradient(135deg, var(--accent), var(--accent-secondary))',
          backgroundOrigin: 'border-box',
          backgroundClip: 'content-box, border-box',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
      {/* Shimmer text */}
      <div className="relative overflow-hidden">
        <p className="font-display font-semibold text-sm bg-gradient-to-r from-[var(--accent)] via-[var(--accent-secondary)] to-[var(--accent)] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
          Loading...
        </p>
      </div>
    </motion.div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  const location = useLocation();

  return (
    <>
      {/* Ambient particles — lazy-loaded, GPU-accelerated */}
      <Suspense fallback={null}>
        <ParticleBackground />
      </Suspense>

      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/study/:topic" element={<TopicPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Protected routes — require login */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/code" element={
            <ProtectedRoute>
              <CodePage />
            </ProtectedRoute>
          } />
          <Route path="/code/:id" element={
            <ProtectedRoute>
              <CodeEditorPage />
            </ProtectedRoute>
          } />
          <Route path="/question-of-the-day" element={
            <ProtectedRoute>
              <QuestionOfTheDayPage />
            </ProtectedRoute>
          } />
          <Route path="/ranked-match" element={
            <ProtectedRoute>
              <RankedMatchPage />
            </ProtectedRoute>
          } />
          <Route path="/stats" element={
            <ProtectedRoute>
              <StatsPage />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/players" element={
            <AdminRoute>
              <AdminPlayerManagement />
            </AdminRoute>
          } />
        </Routes>
      </Suspense>
    </AnimatePresence>
    </>
  );
}

export default App;