/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';

const ADMIN_OVERRIDE_KEY = 'notomee_desktop_admin_override_v1';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPermitted: boolean;
  hasAdminOverride: boolean;
  setAdminOverride: (override: boolean) => void;
}

function detectDevice(): { isMobile: boolean; isTablet: boolean; isDesktop: boolean } {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isMobile: true, isTablet: false, isDesktop: false };
  }

  const ua = navigator.userAgent || navigator.vendor || '';

  // 1. Mobile phone detection (iPhone, iPod, Android Mobile, etc.)
  const isIPhone = /iPhone|iPod/i.test(ua);
  const isAndroidMobile = /Android/i.test(ua) && /Mobile/i.test(ua);
  const isGenericMobile = /BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
  const isMobile = isIPhone || isAndroidMobile || (isGenericMobile && !/iPad/i.test(ua));

  // 2. Tablet detection (iPad, iPadOS desktop-mode UA, Android Tablet, Kindle Silk)
  const isIPad =
    /iPad/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroidTablet = /Android/i.test(ua) && !/Mobile/i.test(ua);
  const isKindleOrSilk = /Silk|Kindle|PlayBook/i.test(ua);
  const isTablet = isIPad || isAndroidTablet || isKindleOrSilk;

  // 3. Media query & touch analysis
  const hasTouch = Boolean(
    navigator.maxTouchPoints && navigator.maxTouchPoints > 0
  ) || 'ontouchstart' in window;
  const screenWidth = window.innerWidth;

  // If a mobile UA was detected or tablet UA, it's explicitly permitted
  if (isMobile || isTablet) {
    return { isMobile, isTablet, isDesktop: false };
  }

  // Touch device with tablet/phone viewport (<= 1024px)
  if (hasTouch && screenWidth <= 1024) {
    return { isMobile: screenWidth <= 640, isTablet: screenWidth > 640, isDesktop: false };
  }

  // Standard Desktop PC / Laptop
  return {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  };
}

export function useDeviceDetection(): DeviceInfo {
  const [device, setDevice] = useState(detectDevice);
  const [hasAdminOverride, setHasAdminOverride] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_OVERRIDE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const updateDetection = useCallback(() => {
    setDevice(detectDevice());
  }, []);

  useEffect(() => {
    updateDetection();

    window.addEventListener('resize', updateDetection);
    window.addEventListener('orientationchange', updateDetection);

    return () => {
      window.removeEventListener('resize', updateDetection);
      window.removeEventListener('orientationchange', updateDetection);
    };
  }, [updateDetection]);

  const handleSetAdminOverride = useCallback((override: boolean) => {
    setHasAdminOverride(override);
    try {
      if (override) {
        sessionStorage.setItem(ADMIN_OVERRIDE_KEY, 'true');
      } else {
        sessionStorage.removeItem(ADMIN_OVERRIDE_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  const isPermitted = device.isMobile || device.isTablet || !device.isDesktop || hasAdminOverride;

  return {
    isMobile: device.isMobile,
    isTablet: device.isTablet,
    isDesktop: device.isDesktop,
    isPermitted,
    hasAdminOverride,
    setAdminOverride: handleSetAdminOverride,
  };
}
