/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';

export interface MaintenanceConfig {
  isEnabled: boolean;
  reason?: string;
  activatedAt?: string;
  activatedBy?: string;
}

const MAINTENANCE_STORAGE_KEY = 'notomee_maintenance_config_v1';
const MAINTENANCE_EVENT = 'notomee_maintenance_update';

const DEFAULT_MAINTENANCE: MaintenanceConfig = {
  isEnabled: false,
  reason: '',
  activatedAt: undefined,
  activatedBy: undefined,
};

function loadMaintenanceConfig(): MaintenanceConfig {
  try {
    const raw = localStorage.getItem(MAINTENANCE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          isEnabled: Boolean(parsed.isEnabled),
          reason: typeof parsed.reason === 'string' ? parsed.reason : '',
          activatedAt: parsed.activatedAt,
          activatedBy: parsed.activatedBy,
        };
      }
    }
  } catch (e) {
    console.error('Failed to load maintenance config', e);
  }
  return DEFAULT_MAINTENANCE;
}

export function useMaintenance() {
  const [config, setConfig] = useState<MaintenanceConfig>(loadMaintenanceConfig);

  useEffect(() => {
    // Listen to local changes from other tabs or windows
    const handleStorage = (e: StorageEvent) => {
      if (e.key === MAINTENANCE_STORAGE_KEY && e.newValue) {
        try {
          setConfig(JSON.parse(e.newValue));
        } catch {
          setConfig(loadMaintenanceConfig());
        }
      }
    };

    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<MaintenanceConfig>;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
      } else {
        setConfig(loadMaintenanceConfig());
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(MAINTENANCE_EVENT, handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(MAINTENANCE_EVENT, handleCustom);
    };
  }, []);

  const setMaintenanceMode = useCallback(
    (enabled: boolean, reason?: string, adminEmail?: string) => {
      const nextConfig: MaintenanceConfig = {
        isEnabled: enabled,
        reason: reason !== undefined ? reason : config.reason || '',
        activatedAt: enabled ? new Date().toISOString() : undefined,
        activatedBy: enabled ? adminEmail || 'mike777rafael@gmail.com' : undefined,
      };

      try {
        localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(nextConfig));
      } catch (e) {
        console.error('Failed to save maintenance config', e);
      }

      setConfig(nextConfig);
      // Dispatch custom event for real-time local sync in current window
      window.dispatchEvent(
        new CustomEvent<MaintenanceConfig>(MAINTENANCE_EVENT, { detail: nextConfig })
      );
    },
    [config.reason]
  );

  return {
    isMaintenance: config.isEnabled,
    reason: config.reason,
    activatedAt: config.activatedAt,
    activatedBy: config.activatedBy,
    setMaintenanceMode,
  };
}
