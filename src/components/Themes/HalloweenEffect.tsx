/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';

interface EmberSpec {
  id: number;
  left: number; // percentage
  size: number; // in pixels (3px - 6px)
  duration: number; // in seconds (6s - 12s)
  delay: number; // in seconds (0s - 7s)
  opacity: number; // 0.3 - 0.7
  drift: number; // in pixels horizontal sway (-25 to 25)
  color: string; // ember orange or mystical violet
}

interface BatSpec {
  id: number;
  top: number; // percentage (10% - 40%)
  duration: number; // (14s - 22s)
  delay: number; // (1s - 9s)
  scale: number; // (0.6 - 0.9)
}

export const HalloweenEffect: React.FC = () => {
  // Deterministic set of 8 lightweight embers for smooth 60fps on low-spec mobile
  const embers = useMemo<EmberSpec[]>(() => {
    return [
      { id: 1, left: 8, size: 4, duration: 8.0, delay: 0.2, opacity: 0.6, drift: 20, color: '#FF7518' },
      { id: 2, left: 22, size: 3, duration: 10.5, delay: 2.1, opacity: 0.45, drift: -15, color: '#A855F7' },
      { id: 3, left: 35, size: 5, duration: 9.0, delay: 1.0, opacity: 0.55, drift: 22, color: '#FF7518' },
      { id: 4, left: 50, size: 3.5, duration: 11.5, delay: 4.2, opacity: 0.5, drift: -18, color: '#EA580C' },
      { id: 5, left: 65, size: 4.5, duration: 8.5, delay: 0.8, opacity: 0.65, drift: 16, color: '#C084FC' },
      { id: 6, left: 78, size: 3, duration: 12.0, delay: 3.0, opacity: 0.4, drift: -12, color: '#FF7518' },
      { id: 7, left: 88, size: 5, duration: 7.8, delay: 1.5, opacity: 0.6, drift: 25, color: '#FB923C' },
      { id: 8, left: 95, size: 3.5, duration: 10.0, delay: 5.0, opacity: 0.5, drift: -20, color: '#A855F7' },
    ];
  }, []);

  // 2 subtle silhouette bats gliding across the upper viewport
  const bats = useMemo<BatSpec[]>(() => {
    return [
      { id: 1, top: 12, duration: 16, delay: 1.5, scale: 0.75 },
      { id: 2, top: 26, duration: 21, delay: 8.0, scale: 0.6 },
    ];
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none"
    >
      {/* Floating Ember Particles */}
      {embers.map((ember) => (
        <span
          key={ember.id}
          className="halloween-ember"
          style={
            {
              left: `${ember.left}%`,
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              animationDuration: `${ember.duration}s`,
              animationDelay: `${ember.delay}s`,
              '--ember-opacity': ember.opacity,
              '--ember-drift': `${ember.drift}px`,
              backgroundColor: ember.color,
              boxShadow: `0 0 6px ${ember.color}`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Gliding Silhouette Bats */}
      {bats.map((bat) => (
        <div
          key={bat.id}
          className="halloween-bat"
          style={
            {
              top: `${bat.top}%`,
              animationDuration: `${bat.duration}s`,
              animationDelay: `${bat.delay}s`,
              transform: `scale(${bat.scale})`,
            } as React.CSSProperties
          }
        >
          <svg
            className="w-8 h-5 text-[#3A264F] opacity-75 drop-shadow-xs"
            viewBox="0 0 32 20"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Minimalist vector bat silhouette */}
            <path d="M16 8C14.5 4 9 3 5 5C1 7 0 11 0 12C2 11.5 5 11 7 12.5C9 14 10 16 11 19C12 16 13.5 13 16 13C18.5 13 20 16 21 19C22 16 23 14 25 12.5C27 11 30 11.5 32 12C32 11 31 7 27 5C23 3 17.5 4 16 8Z" />
          </svg>
        </div>
      ))}
    </div>
  );
};
