import React from 'react';

interface SkeletonProps {
  /** Width — any CSS-compatible value */
  width?: string | number;
  /** Height — any CSS-compatible value */
  height?: string | number;
  /** Fully round (circle) */
  circle?: boolean;
  className?: string;
}

/**
 * Shimmer-loading skeleton placeholder.
 * Uses the `.skeleton` class from animations.css for the shimmer effect.
 */
const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  circle = false,
  className = '',
}) => (
  <div
    className={`skeleton ${className}`}
    style={{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      borderRadius: circle ? '50%' : undefined,
    }}
  />
);

export default Skeleton;
