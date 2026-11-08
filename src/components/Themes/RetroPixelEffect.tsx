/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';

interface PixelBitSpec {
  id: number;
  left: number; // percentage (5% - 95%)
  top: number; // percentage (10% - 90%)
  size: number; // in pixels (3px - 6px square)
  duration: number; // in seconds (2.5s - 5s)
  delay: number; // in seconds
  color: string; // phosphor cyan, arcade yellow, or retro green
}

export const RetroPixelEffect: React.FC = () => {
  // Deterministic set of 8 lightweight twinkling pixel bits for high performance
  const pixelBits = useMemo<PixelBitSpec[]>(() => {
    return [
      { id: 1, left: 10, top: 18, size: 4, duration: 3.2, delay: 0.3, color: '#00F5D4' },
      { id: 2, left: 24, top: 72, size: 3, duration: 4.1, delay: 1.2, color: '#FFBE0B' },
      { id: 3, left: 42, top: 28, size: 5, duration: 3.6, delay: 0.8, color: '#00F5D4' },
      { id: 4, left: 58, top: 82, size: 3, duration: 4.5, delay: 2.0, color: '#FB5607' },
      { id: 5, left: 72, top: 22, size: 4, duration: 3.0, delay: 1.5, color: '#00F5D4' },
      { id: 6, left: 86, top: 64, size: 3, duration: 4.0, delay: 0.5, color: '#FFBE0B' },
      { id: 7, left: 34, top: 52, size: 4, duration: 3.8, delay: 2.4, color: '#00F5D4' },
      { id: 8, left: 92, top: 38, size: 5, duration: 4.2, delay: 1.8, color: '#FFBE0B' },
    ];
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none"
    >
      {/* Ultra-lightweight CRT Scanline Grid Texture (Pure CSS, 0% CPU) */}
      <div className="absolute inset-0 retro-crt-scanlines opacity-40 dark:opacity-30 pointer-events-none" />

      {/* Floating 8-Bit Pixel Bits */}
      {pixelBits.map((bit) => (
        <span
          key={bit.id}
          className="retro-pixel-bit"
          style={
            {
              left: `${bit.left}%`,
              top: `${bit.top}%`,
              width: `${bit.size}px`,
              height: `${bit.size}px`,
              animationDuration: `${bit.duration}s`,
              animationDelay: `${bit.delay}s`,
              backgroundColor: bit.color,
              boxShadow: `0 0 4px ${bit.color}`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
