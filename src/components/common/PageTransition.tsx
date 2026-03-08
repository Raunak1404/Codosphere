import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface PageTransitionProps {
  children: React.ReactNode;
}

const crimsonVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
};

const lagoonVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const { theme } = useTheme();
  const isLagoon = theme === 'lagoon';

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={isLagoon ? lagoonVariants : crimsonVariants}
      transition={{
        duration: isLagoon ? 0.3 : 0.2,
        ease: 'easeOut',
      }}
      className="min-h-screen flex flex-col relative overflow-x-hidden"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;