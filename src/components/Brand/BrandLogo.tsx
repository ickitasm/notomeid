/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  animatePulse?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'sm',
  showSubtitle = false,
  className = '',
  animatePulse = false,
}) => {
  // Dimensions and styling based on size variant
  const emblemSizes = {
    sm: 'w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-base sm:text-lg',
    md: 'w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-lg sm:text-xl',
    lg: 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl text-2xl sm:text-3xl shadow-md',
  };

  const titleSizes = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl',
  };

  return (
    <div
      draggable="false"
      onContextMenu={(e) => e.preventDefault()}
      className={`inline-flex items-center gap-2.5 sm:gap-3 select-none pointer-events-auto cursor-pointer ${
        animatePulse ? 'animate-pulse' : ''
      } ${className}`}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitUserDrag: 'none',
      } as React.CSSProperties}
    >
      {/* Terracotta Emblem Box with Serif 'N' */}
      <div
        draggable="false"
        className={`${emblemSizes[size]} bg-[#C85A32] flex items-center justify-center text-white font-serif font-bold shadow-xs shrink-0 select-none pointer-events-none transition-transform active:scale-95`}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitUserDrag: 'none',
        } as React.CSSProperties}
      >
        <span
          className="leading-none select-none pointer-events-none transform -translate-y-px"
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          N
        </span>
      </div>

      {/* Editorial Wordmark Notomee */}
      <div
        className="flex flex-col select-none pointer-events-none"
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        <span
          className={`font-serif ${titleSizes[size]} font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2] group-hover:text-[#C85A32] transition-colors leading-none select-none pointer-events-none`}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            letterSpacing: '-0.02em',
          }}
        >
          Notomee
        </span>
        {showSubtitle && (
          <span
            className="text-[9px] sm:text-[10px] tracking-[0.22em] font-medium uppercase text-[#7B6F63] dark:text-[#9F9184] mt-1 select-none pointer-events-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            Personal Sanctuary
          </span>
        )}
      </div>
    </div>
  );
};
