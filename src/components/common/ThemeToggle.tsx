import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Trees, Flame } from 'lucide-react';

const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isForest = theme === 'forest';

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 cursor-pointer group ${className}`}
      style={{
        background: isForest
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 78, 59, 0.3))'
          : 'linear-gradient(135deg, rgba(244, 91, 105, 0.15), rgba(30, 18, 18, 0.3))',
        borderColor: isForest
          ? 'rgba(16, 185, 129, 0.3)'
          : 'rgba(244, 91, 105, 0.3)',
      }}
      aria-label={`Switch to ${isForest ? 'Crimson' : 'Forest'} theme`}
      title={`Switch to ${isForest ? 'Crimson' : 'Forest'} theme`}
    >
      {/* Track */}
      <div className="relative w-10 h-5 rounded-full overflow-hidden" style={{
        background: isForest
          ? 'linear-gradient(135deg, #064e3b, #065f46)'
          : 'linear-gradient(135deg, #1e1212, #2d1a1a)',
      }}>
        {/* Sliding knob */}
        <motion.div
          className="absolute top-0.5 w-4 h-4 rounded-full flex items-center justify-center"
          animate={{ x: isForest ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            background: isForest
              ? 'linear-gradient(135deg, #10b981, #2dd4bf)'
              : 'linear-gradient(135deg, #f45b69, #ff7eb3)',
            boxShadow: isForest
              ? '0 0 8px rgba(16, 185, 129, 0.5)'
              : '0 0 8px rgba(244, 91, 105, 0.5)',
          }}
        >
          <motion.div
            animate={{ rotate: isForest ? 0 : 0, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {isForest ? (
              <Trees size={10} className="text-white" />
            ) : (
              <Flame size={10} className="text-white" />
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Label */}
      <span className="text-xs font-medium transition-colors duration-300 hidden sm:inline"
        style={{ color: isForest ? '#10b981' : 'var(--accent)' }}
      >
        {isForest ? 'Forest' : 'Crimson'}
      </span>
    </button>
  );
};

export default ThemeToggle;
