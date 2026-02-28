import React from 'react';
import { motion } from 'framer-motion';

type GlowTextProps = {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hero' | 'navbar' | 'footer';
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

const GlowText: React.FC<GlowTextProps> = ({ 
  children, 
  className = "", 
  variant = 'default',
  size = 'md'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-lg';
      case 'md': return 'text-xl';
      case 'lg': return 'text-2xl';
      case 'xl': return 'text-3xl';
      default: return 'text-xl';
    }
  };

  // Simplified glow animation
  const getGlowAnimation = () => {
    switch (variant) {
      case 'hero':
        return {
          textShadow: [
            "0 0 10px rgba(244, 91, 105, 0.5), 0 0 20px rgba(0, 212, 255, 0.3)",
            "0 0 15px rgba(244, 91, 105, 0.7), 0 0 25px rgba(0, 212, 255, 0.5)",
            "0 0 10px rgba(244, 91, 105, 0.5), 0 0 20px rgba(0, 212, 255, 0.3)"
          ]
        };
      
      case 'navbar':
        return {
          textShadow: [
            "0 0 8px rgba(244, 91, 105, 0.4)",
            "0 0 12px rgba(244, 91, 105, 0.6)",
            "0 0 8px rgba(244, 91, 105, 0.4)"
          ]
        };
      
      case 'footer':
        return {
          textShadow: [
            "0 0 6px rgba(244, 91, 105, 0.3)",
            "0 0 10px rgba(244, 91, 105, 0.5)",
            "0 0 6px rgba(244, 91, 105, 0.3)"
          ]
        };
      
      default:
        return {
          textShadow: [
            "0 0 6px rgba(244, 91, 105, 0.4)",
            "0 0 10px rgba(244, 91, 105, 0.6)",
            "0 0 6px rgba(244, 91, 105, 0.4)"
          ]
        };
    }
  };

  const getHoverAnimation = () => {
    switch (variant) {
      case 'hero':
        return {
          scale: 1.05,
          textShadow: "0 0 25px rgba(244, 91, 105, 1), 0 0 35px rgba(0, 212, 255, 0.8)"
        };
      
      case 'navbar':
        return {
          scale: 1.05,
          textShadow: "0 0 15px rgba(244, 91, 105, 0.8), 0 0 25px rgba(0, 212, 255, 0.6)"
        };
      
      default:
        return {
          scale: 1.02,
          textShadow: "0 0 12px rgba(244, 91, 105, 0.7), 0 0 20px rgba(0, 212, 255, 0.5)"
        };
    }
  };

  // Longer transition duration for less frequent updates
  const getTransitionDuration = () => {
    switch (variant) {
      case 'hero': return 5;
      case 'navbar': return 4;
      case 'footer': return 6;
      default: return 5;
    }
  };

  return (
    <motion.span
      className={`font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] ${getSizeClasses()} ${className}`}
      animate={getGlowAnimation()}
      whileHover={getHoverAnimation()}
      transition={{ 
        textShadow: { 
          duration: getTransitionDuration(), 
          repeat: Infinity, 
          ease: "easeInOut" 
        },
        scale: { 
          duration: 0.3, 
          ease: "easeInOut" 
        }
      }}
      style={{
        filter: 'brightness(1.1)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </motion.span>
  );
};

export default GlowText;