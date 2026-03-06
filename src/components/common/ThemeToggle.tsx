import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Waves, Flame } from 'lucide-react';

const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isLagoon = theme === 'lagoon';

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 cursor-pointer group ${className}`}
      style={{
        background: isLagoon
          ? 'linear-gradient(135deg, rgba(111, 207, 153, 0.15), rgba(9, 27, 42, 0.3))'
          : 'linear-gradient(135deg, rgba(244, 91, 105, 0.15), rgba(30, 18, 18, 0.3))',
        borderColor: isLagoon
          ? 'rgba(111, 207, 153, 0.3)'
          : 'rgba(244, 91, 105, 0.3)',
      }}
      aria-label={`Switch to ${isLagoon ? 'Crimson' : 'Lagoon'} theme`}
      title={`Switch to ${isLagoon ? 'Crimson' : 'Lagoon'} theme`}
    >
      {/* Track */}
      <div className="relative w-10 h-5 rounded-full overflow-hidden" style={{
        background: isLagoon
          ? 'linear-gradient(135deg, #091B2A, #0F2537)'
          : 'linear-gradient(135deg, #1e1212, #2d1a1a)',
      }}>
        {/* Sliding knob */}
        <motion.div
          className="absolute top-0.5 w-4 h-4 rounded-full flex items-center justify-center"
          animate={{ x: isLagoon ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            background: isLagoon
              ? 'linear-gradient(135deg, #6FCF99, #38BDF8)'
              : 'linear-gradient(135deg, #f45b69, #ff7eb3)',
            boxShadow: isLagoon
              ? '0 0 8px rgba(111, 207, 153, 0.5)'
              : '0 0 8px rgba(244, 91, 105, 0.5)',
          }}
        >
          <motion.div
            animate={{ rotate: isLagoon ? 0 : 0, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {isLagoon ? (
              <Waves size={10} className="text-white" />
            ) : (
              <Flame size={10} className="text-white" />
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Label */}
      <span className="text-xs font-medium transition-colors duration-300 hidden sm:inline"
        style={{ color: isLagoon ? '#6FCF99' : 'var(--accent)' }}
      >
        {isLagoon ? 'Lagoon' : 'Crimson'}
      </span>
    </button>
  );
};

export default ThemeToggle;
