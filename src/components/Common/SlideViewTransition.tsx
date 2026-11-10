import React from 'react';
import { ActiveTab } from '../Navigation';

interface SlideViewTransitionProps {
  currentTab: ActiveTab;
  direction: 'forward' | 'backward';
  children: React.ReactNode;
}

export const SlideViewTransition: React.FC<SlideViewTransitionProps> = ({
  currentTab,
  direction,
  children,
}) => {
  return (
    <div
      key={currentTab}
      className={`w-full ${
        direction === 'forward' ? 'animate-slide-left' : 'animate-slide-right'
      }`}
    >
      {children}
    </div>
  );
};
