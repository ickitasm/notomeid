/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';

interface SnowflakeSpec {
  id: number;
  left: number; // percentage
  size: number; // in pixels (3px - 6px)
  duration: number; // in seconds (6s - 14s)
  delay: number; // in seconds (0s - 8s)
  opacity: number; // 0.25 - 0.65
  drift: number; // in pixels horizontal sway
}

export const ChristmasSnowEffect: React.FC = () => {
  // Deterministic set of 15 lightweight particles for zero lag & 60fps on mobile
  const flakes = useMemo<SnowflakeSpec[]>(() => {
    return [
      { id: 1, left: 5, size: 4, duration: 8.5, delay: 0.2, opacity: 0.45, drift: 20 },
      { id: 2, left: 12, size: 3, duration: 11.0, delay: 2.5, opacity: 0.35, drift: -15 },
      { id: 3, left: 20, size: 5, duration: 9.0, delay: 1.0, opacity: 0.55, drift: 25 },
      { id: 4, left: 28, size: 3.5, duration: 12.5, delay: 4.0, opacity: 0.4, drift: -20 },
      { id: 5, left: 36, size: 4.5, duration: 8.0, delay: 0.8, opacity: 0.5, drift: 18 },
      { id: 6, left: 45, size: 3, duration: 13.0, delay: 3.2, opacity: 0.3, drift: -10 },
      { id: 7, left: 52, size: 5.5, duration: 7.5, delay: 1.5, opacity: 0.6, drift: 30 },
      { id: 8, left: 60, size: 3.5, duration: 10.5, delay: 4.8, opacity: 0.38, drift: -22 },
      { id: 9, left: 68, size: 4, duration: 9.2, delay: 0.5, opacity: 0.48, drift: 16 },
      { id: 10, left: 75, size: 3, duration: 12.0, delay: 2.8, opacity: 0.32, drift: -18 },
      { id: 11, left: 82, size: 5, duration: 8.8, delay: 3.8, opacity: 0.52, drift: 24 },
      { id: 12, left: 89, size: 3.5, duration: 11.5, delay: 1.2, opacity: 0.4, drift: -14 },
      { id: 13, left: 95, size: 4.5, duration: 9.8, delay: 5.0, opacity: 0.45, drift: 20 },
      { id: 14, left: 32, size: 3, duration: 14.0, delay: 6.2, opacity: 0.3, drift: 12 },
      { id: 15, left: 64, size: 4, duration: 10.0, delay: 6.8, opacity: 0.42, drift: -16 },
    ];
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none"
    >
      {flakes.map((flake) => (
        <span
          key={flake.id}
          className="snow-particle shadow-2xs"
          style={
            {
              left: `${flake.left}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              animationDuration: `${flake.duration}s`,
              animationDelay: `${flake.delay}s`,
              '--snow-opacity': flake.opacity,
              '--snow-drift': `${flake.drift}px`,
              boxShadow: '0 0 4px rgba(255, 255, 255, 0.6)',
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
