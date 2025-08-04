import React from 'react';
import { motion } from 'framer-motion';

type LogoIconProps = {
  size?: number;
  className?: string;
  variant?: 'default' | 'hero' | 'navbar' | 'minimal';
};

const LogoIcon: React.FC<LogoIconProps> = ({ 
  size = 40, 
  className = "", 
  variant = 'default' 
}) => {
  // Different animation variants for different contexts
  const getAnimationProps = () => {
    switch (variant) {
      case 'hero':
        return {
          whileHover: { 
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1.05, 1.1, 1],
            transition: { duration: 0.8, ease: "easeInOut" }
          }
        };
      
      case 'navbar':
        return {
          whileHover: { 
            rotate: 360,
            scale: 1.15,
            transition: { duration: 0.6, ease: "easeInOut" }
          }
        };
      
      case 'minimal':
        return {
          whileHover: { 
            scale: 1.1,
            rotate: 10,
            transition: { duration: 0.3 }
          }
        };
      
      default:
        return {
          whileHover: { 
            rotate: 360,
            scale: 1.15,
            transition: { duration: 0.8, ease: "easeInOut" }
          }
        };
    }
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} cursor-pointer`}
      style={{
        display: 'block',
        overflow: 'visible',
      }}
      {...getAnimationProps()}
    >
      <defs>
        <linearGradient id={`gradient-${size}-${variant}`} x1="10" y1="10" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f45b69" />
          <stop offset="1" stopColor="#00d4ff" />
        </linearGradient>
        
        <filter id={`glow-${size}-${variant}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Main circle */}
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke={`url(#gradient-${size}-${variant})`}
        strokeWidth="2"
        fill="none"
        filter={`url(#glow-${size}-${variant})`}
        style={{ pointerEvents: 'visibleStroke' }}
      />
      
      {/* First arrow */}
      <path
        d="M13 15L20 22L27 15"
        stroke={`url(#gradient-${size}-${variant})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={`url(#glow-${size}-${variant})`}
        style={{ pointerEvents: 'visibleStroke' }}
      />
      
      {/* Second arrow */}
      <path
        d="M13 25L20 18L27 25"
        stroke={`url(#gradient-${size}-${variant})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={`url(#glow-${size}-${variant})`}
        style={{ pointerEvents: 'visibleStroke' }}
      />
      
      {/* Invisible circular hover area */}
      <circle
        cx="20"
        cy="20"
        r="19"
        fill="transparent"
        stroke="transparent"
        strokeWidth="2"
        style={{ pointerEvents: 'all' }}
      />
    </motion.svg>
  );
};

export default LogoIcon;