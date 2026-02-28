import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen flex flex-col relative overflow-x-hidden"
    >
      {/* Decorative ambient blobs — static, GPU-composited */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
        <div
          className="absolute top-[8%] right-[5%] w-72 h-72 rounded-full opacity-[0.04]"
          style={{ background: 'var(--accent)', filter: 'blur(120px)', willChange: 'transform' }}
        />
        <div
          className="absolute bottom-[15%] left-[8%] w-80 h-80 rounded-full opacity-[0.03]"
          style={{ background: 'var(--accent-secondary)', filter: 'blur(100px)', willChange: 'transform' }}
        />
      </div>

      {children}
    </motion.div>
  );
};

export default PageTransition;