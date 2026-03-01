import React from 'react';

type GlowTextProps = {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hero' | 'navbar' | 'footer';
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

const GlowText: React.FC<GlowTextProps> = ({
  children,
  className = '',
  size = 'md',
}) => {
  const sizeClass =
    size === 'sm' ? 'text-lg' :
    size === 'lg' ? 'text-2xl' :
    size === 'xl' ? 'text-3xl' : 'text-xl';

  return (
    <span
      className={`font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] ${sizeClass} ${className}`}
      style={{
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </span>
  );
};

export default GlowText;