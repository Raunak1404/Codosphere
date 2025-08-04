import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col relative overflow-x-hidden"
    >
      {/* Simplified background elements - static instead of animated */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[10%] right-[5%] w-64 h-64 bg-[var(--accent)] rounded-full filter blur-[120px] opacity-5"></div>
        <div className="absolute bottom-[20%] left-[10%] w-80 h-80 bg-[var(--accent-secondary)] rounded-full filter blur-[100px] opacity-5"></div>
      </div>

      {children}
    </motion.div>
  );
};

export default PageTransition;