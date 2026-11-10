import { useState, useRef, useEffect, useCallback } from 'react';
import { ActiveTab } from '../components/Navigation';

export const TAB_ORDER: ActiveTab[] = ['media', 'nutrition', 'pets', 'calendar', 'notes', 'dreams'];

interface UseSwipeableTabsOptions {
  activeTab: ActiveTab;
  onTabChange: (newTab: ActiveTab, direction: 'forward' | 'backward') => void;
  disabled?: boolean;
}

export function useSwipeableTabs({
  activeTab,
  onTabChange,
  disabled = false,
}: UseSwipeableTabsOptions) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const isSwipingHorizontally = useRef<boolean | null>(null);

  // Direction for animation ('forward' = sliding from right, 'backward' = sliding from left)
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');
  const prevTabRef = useRef<ActiveTab>(activeTab);

  // When activeTab changes from external actions (like clicking tabs in Navigation)
  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      const prevIndex = TAB_ORDER.indexOf(prevTabRef.current);
      const newIndex = TAB_ORDER.indexOf(activeTab);
      if (prevIndex !== -1 && newIndex !== -1) {
        setSlideDirection(newIndex > prevIndex ? 'forward' : 'backward');
      }
      prevTabRef.current = activeTab;
    }
  }, [activeTab]);

  const switchTab = useCallback(
    (targetTab: ActiveTab, direction: 'forward' | 'backward') => {
      setSlideDirection(direction);
      onTabChange(targetTab, direction);
      window.scrollTo({ top: 0, behavior: 'instant' });
    },
    [onTabChange]
  );

  const goToNextTab = useCallback(() => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    if (currentIndex < TAB_ORDER.length - 1) {
      const nextTab = TAB_ORDER[currentIndex + 1];
      switchTab(nextTab, 'forward');
    }
  }, [activeTab, switchTab]);

  const goToPrevTab = useCallback(() => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    if (currentIndex > 0) {
      const prevTab = TAB_ORDER[currentIndex - 1];
      switchTab(prevTab, 'backward');
    }
  }, [activeTab, switchTab]);

  const onTouchStart = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (disabled) return;

      // Don't intercept swipe if user is interacting with an input, range slider, or modal
      const target = e.target as HTMLElement | null;
      if (target) {
        if (
          target.closest('input[type="range"]') ||
          target.closest('textarea') ||
          target.closest('input[type="text"]') ||
          target.closest('[role="dialog"]') ||
          target.closest('.no-swipe')
        ) {
          touchStartX.current = null;
          touchStartY.current = null;
          return;
        }
      }

      if (e.touches.length === 1) {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        touchStartTime.current = Date.now();
        isSwipingHorizontally.current = null;
      }
    },
    [disabled]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (disabled || touchStartX.current === null || touchStartY.current === null) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - touchStartX.current;
      const deltaY = currentY - touchStartY.current;

      // Determine initial intent if not decided yet
      if (isSwipingHorizontally.current === null) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        // Only classify if movement has passed at least 8px
        if (absX > 8 || absY > 8) {
          // Horizontal intent if horizontal delta is clearly larger than vertical
          isSwipingHorizontally.current = absX > absY * 1.35;
        }
      }
    },
    [disabled]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (
        disabled ||
        touchStartX.current === null ||
        touchStartY.current === null ||
        !isSwipingHorizontally.current
      ) {
        touchStartX.current = null;
        touchStartY.current = null;
        isSwipingHorizontally.current = null;
        return;
      }

      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX.current;
      const duration = Date.now() - touchStartTime.current;

      const minDistance = 45; // Minimum horizontal pixel drag
      const isQuickFlick = duration < 350 && Math.abs(deltaX) > 30;

      if (Math.abs(deltaX) >= minDistance || isQuickFlick) {
        if (deltaX < 0) {
          // Swiped left -> navigate to next tab
          goToNextTab();
        } else {
          // Swiped right -> navigate to previous tab
          goToPrevTab();
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
      isSwipingHorizontally.current = null;
    },
    [disabled, goToNextTab, goToPrevTab]
  );

  return {
    slideDirection,
    setSlideDirection,
    switchTab,
    goToNextTab,
    goToPrevTab,
    touchHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    currentIndex: TAB_ORDER.indexOf(activeTab),
    totalTabs: TAB_ORDER.length,
    canGoNext: TAB_ORDER.indexOf(activeTab) < TAB_ORDER.length - 1,
    canGoPrev: TAB_ORDER.indexOf(activeTab) > 0,
  };
}
