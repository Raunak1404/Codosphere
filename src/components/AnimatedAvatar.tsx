import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type AvatarType = 'boy1' | 'boy2' | 'girl1' | 'girl2';

interface AnimatedAvatarProps {
  type: AvatarType;
  size?: number;
  interval?: number;
  selected?: boolean;
  onClick?: () => void;
}

// Define avatar configurations
const avatarConfigs = {
  boy1: {
    primaryColor: "#3b82f6", // blue
    secondaryColor: "#1e40af",
    skinColor: "#f8d9b4",
    hairColor: "#222222"
  },
  boy2: {
    primaryColor: "#10b981", // green
    secondaryColor: "#047857",
    skinColor: "#e5c298",
    hairColor: "#513b2a"
  },
  girl1: {
    primaryColor: "#ec4899", // pink
    secondaryColor: "#be185d",
    skinColor: "#f8d9b4",
    hairColor: "#513b2a"
  },
  girl2: {
    primaryColor: "#8b5cf6", // purple
    secondaryColor: "#6d28d9",
    skinColor: "#e5c298",
    hairColor: "#222222"
  }
};

const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ 
  type, 
  size = 120, 
  interval = 10000, 
  selected = false,
  onClick 
}) => {
  const [isWaving, setIsWaving] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const config = avatarConfigs[type];
  
  // Reduced periodic animations
  useEffect(() => {
    // Wave animation at specified interval - less frequent
    const waveInterval = setInterval(() => {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 2000);
    }, interval * 1.5); // Increased interval
    
    // Blinking animation at random intervals - less frequent
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 300);
    }, Math.random() * 5000 + 3000); // Longer intervals between blinks
    
    // Initial wave after a short delay
    const initialTimer = setTimeout(() => {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 2000);
    }, 2000);
    
    return () => {
      clearInterval(waveInterval);
      clearInterval(blinkInterval);
      clearTimeout(initialTimer);
    };
  }, [interval]);

  // Arm wave animation variants - simplified
  const armVariants = {
    rest: { rotate: 0, x: 0 },
    wave: {
      rotate: [0, 20, -10, 20, 0],
      x: [0, 2, -1, 2, 0],
      transition: {
        duration: 2,
        times: [0, 0.3, 0.6, 0.8, 1],
        ease: "easeInOut"
      }
    }
  };
  
  // Face animation variants - simplified
  const faceVariants = {
    rest: { y: 0 },
    happy: {
      y: [0, -2, 0],
      transition: { duration: 0.5 }
    }
  };
  
  // Eye animation variants
  const eyeVariants = {
    open: { scaleY: 1 },
    blink: { scaleY: 0.1, transition: { duration: 0.1 } }
  };

  // Simplified entry animation
  const entryAnimation = {
    initial: { opacity: 0, scale: 0.5 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Render appropriate avatar based on type
  return (
    <motion.div 
      className={`relative rounded-full overflow-hidden cursor-pointer ${selected ? 'ring-4 ring-[var(--accent)]' : ''}`}
      style={{ 
        width: size, 
        height: size,
        background: `radial-gradient(circle at center, ${config.primaryColor}, ${config.secondaryColor})`,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      {...entryAnimation}
    >
      {/* Character Body */}
      <div className="absolute bottom-0 w-full" style={{ height: size * 0.6 }}>
        {/* Torso/Shirt */}
        <div
          style={{
            width: size * 0.5,
            height: size * 0.3,
            background: config.primaryColor,
            borderRadius: `${size * 0.1}px ${size * 0.1}px 0 0`,
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />
      </div>
      
      {/* Character Head */}
      <motion.div
        style={{
          width: size * 0.4,
          height: size * 0.4,
          background: config.skinColor,
          borderRadius: '50%',
          position: 'absolute',
          top: size * 0.15,
          left: '50%',
          transform: 'translateX(-50%)'
        }}
        variants={faceVariants}
        animate={isWaving ? "happy" : "rest"}
      >
        {/* Eyes */}
        <motion.div
          style={{
            width: size * 0.07,
            height: size * 0.07,
            background: '#222',
            borderRadius: '50%',
            position: 'absolute',
            top: size * 0.16,
            left: size * 0.13,
            transformOrigin: 'center'
          }}
          variants={eyeVariants}
          animate={isBlinking ? "blink" : "open"}
        />
        <motion.div
          style={{
            width: size * 0.07,
            height: size * 0.07,
            background: '#222',
            borderRadius: '50%',
            position: 'absolute',
            top: size * 0.16,
            right: size * 0.13,
            transformOrigin: 'center'
          }}
          variants={eyeVariants}
          animate={isBlinking ? "blink" : "open"}
        />
        
        {/* Mouth */}
        <motion.div
          style={{
            width: size * 0.16,
            height: size * 0.06,
            background: type.includes('girl') ? '#f472b6' : '#222',
            borderRadius: '5px 5px 10px 10px',
            position: 'absolute',
            bottom: size * 0.08,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
          animate={isWaving ? {
            height: size * 0.08,
            borderRadius: '5px 5px 12px 12px'
          } : {}}
        />

        {/* Hair style based on avatar type */}
        {type === 'boy1' && (
          <div
            style={{
              width: size * 0.42,
              height: size * 0.15,
              background: config.hairColor,
              position: 'absolute',
              borderRadius: `${size * 0.1}px ${size * 0.1}px 0 0`,
              top: -size * 0.02,
              left: -size * 0.01
            }}
          />
        )}
        {type === 'boy2' && (
          <div
            style={{
              width: size * 0.42,
              height: size * 0.2,
              background: config.hairColor,
              position: 'absolute',
              borderRadius: '50% 50% 0 0',
              top: -size * 0.05,
              left: -size * 0.01
            }}
          />
        )}
        {type === 'girl1' && (
          <>
            <div
              style={{
                width: size * 0.48,
                height: size * 0.3,
                background: config.hairColor,
                position: 'absolute',
                borderRadius: '50% 50% 30% 30%',
                top: -size * 0.1,
                left: -size * 0.04
              }}
            />
            <div
              style={{
                width: size * 0.15,
                height: size * 0.25,
                background: config.hairColor,
                position: 'absolute',
                borderRadius: '20px',
                top: size * 0.15,
                left: -size * 0.03
              }}
            />
            <div
              style={{
                width: size * 0.15,
                height: size * 0.25,
                background: config.hairColor,
                position: 'absolute',
                borderRadius: '20px',
                top: size * 0.15,
                right: -size * 0.03
              }}
            />
          </>
        )}
        {type === 'girl2' && (
          <>
            <div
              style={{
                width: size * 0.48,
                height: size * 0.25,
                background: config.hairColor,
                position: 'absolute',
                borderRadius: '50% 50% 0 0',
                top: -size * 0.08,
                left: -size * 0.04
              }}
            />
            <div
              style={{
                width: size * 0.12,
                height: size * 0.4,
                background: config.hairColor,
                position: 'absolute',
                borderRadius: '10px 10px 0 20px',
                top: size * 0.12,
                left: -size * 0.06,
                transform: 'rotate(5deg)'
              }}
            />
            <div
              style={{
                width: size * 0.12,
                height: size * 0.4,
                background: config.hairColor,
                position: 'absolute',
                borderRadius: '10px 10px 20px 0',
                top: size * 0.12,
                right: -size * 0.06,
                transform: 'rotate(-5deg)'
              }}
            />
          </>
        )}
      </motion.div>
      
      {/* Left arm (the waving one) */}
      <motion.div
        style={{
          width: size * 0.1,
          height: size * 0.3,
          background: config.primaryColor,
          borderRadius: '10px',
          position: 'absolute',
          bottom: size * 0.1,
          left: size * 0.15,
          transformOrigin: 'bottom center',
          zIndex: 10
        }}
        variants={armVariants}
        animate={isWaving ? "wave" : "rest"}
      >
        {/* Hand */}
        <div
          style={{
            width: size * 0.12,
            height: size * 0.12,
            background: config.skinColor,
            borderRadius: '50%',
            position: 'absolute',
            top: -size * 0.05,
            left: -size * 0.01
          }}
        />
      </motion.div>
      
      {/* Right arm (static) */}
      <div
        style={{
          width: size * 0.1,
          height: size * 0.2,
          background: config.primaryColor,
          borderRadius: '10px',
          position: 'absolute',
          bottom: size * 0.1,
          right: size * 0.2,
          transformOrigin: 'bottom center',
          transform: 'rotate(-10deg)',
          zIndex: -1
        }}
      >
        {/* Hand */}
        <div
          style={{
            width: size * 0.12,
            height: size * 0.12,
            background: config.skinColor,
            borderRadius: '50%',
            position: 'absolute',
            top: -size * 0.06,
            right: -size * 0.02
          }}
        />
      </div>
    </motion.div>
  );
};

export default AnimatedAvatar;