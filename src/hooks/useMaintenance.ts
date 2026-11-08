/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
    console.error('Failed to load maintenance config from localStorage', e);
  }
  return DEFAULT_MAINTENANCE;
}

export function useMaintenance() {
  const [config, setConfig] = useState<MaintenanceConfig>(loadMaintenanceConfig);
  const isFetchingRef = useRef(false);

  // Helper to fetch latest maintenance status from Supabase app_settings table
  const fetchCloudMaintenance = useCallback(async (): Promise<MaintenanceConfig | null> => {
    if (!supabase || !isSupabaseConfigured) return null;
    if (isFetchingRef.current) return null;
    isFetchingRef.current = true;

    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'maintenance')
        .maybeSingle();

      if (error) {
        // Table may not have been created yet or connection offline
        console.warn('Supabase app_settings table check:', error.message);
        return null;
      }

      if (data && data.value && typeof data.value === 'object') {
        const val = data.value as Partial<MaintenanceConfig>;
        return {
          isEnabled: Boolean(val.isEnabled),
          reason: typeof val.reason === 'string' ? val.reason : '',
          activatedAt: val.activatedAt,
          activatedBy: val.activatedBy,
        };
      }
    } catch (err) {
      console.error('Error fetching maintenance from Supabase:', err);
    } finally {
      isFetchingRef.current = false;
    }
    return null;
  }, []);

  // Update and cache config locally
  const applyConfig = useCallback((newConfig: MaintenanceConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(newConfig));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // 1. Initial fetch from cloud
    fetchCloudMaintenance().then((cloudConfig) => {
      if (cloudConfig) {
        applyConfig(cloudConfig);
      }
    });

    // 2. Listen to local storage changes across tabs on same device
    const handleStorage = (e: StorageEvent) => {
      if (e.key === MAINTENANCE_STORAGE_KEY && e.newValue) {
        try {
          setConfig(JSON.parse(e.newValue));
        } catch {
          setConfig(loadMaintenanceConfig());
        }
      }
    };

    // 3. Listen to custom in-window event
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

    // 4. Refetch from cloud when tab gains focus or user returns to screen
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCloudMaintenance().then((cloudConfig) => {
          if (cloudConfig) {
            applyConfig(cloudConfig);
          }
        });
      }
    };

    window.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 5. Periodic polling fallback every 20 seconds
    const interval = setInterval(() => {
      fetchCloudMaintenance().then((cloudConfig) => {
        if (cloudConfig) {
          applyConfig(cloudConfig);
        }
      });
    }, 20000);

    // 6. Realtime subscription to app_settings
    let channel: RealtimeChannel | null = null;
    if (supabase && isSupabaseConfigured) {
      channel = supabase
        .channel('app_settings_maintenance')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'app_settings',
            filter: 'key=eq.maintenance',
          },
          (payload) => {
            const row = payload.new as { value?: Partial<MaintenanceConfig> } | undefined;
            if (row && row.value) {
              const updated: MaintenanceConfig = {
                isEnabled: Boolean(row.value.isEnabled),
                reason: typeof row.value.reason === 'string' ? row.value.reason : '',
                activatedAt: row.value.activatedAt,
                activatedBy: row.value.activatedBy,
              };
              applyConfig(updated);
            }
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(MAINTENANCE_EVENT, handleCustom);
      window.removeEventListener('focus', handleVisibilityChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchCloudMaintenance, applyConfig]);

  const setMaintenanceMode = useCallback(
    async (enabled: boolean, reason?: string, adminEmail?: string) => {
      const nextConfig: MaintenanceConfig = {
        isEnabled: enabled,
        reason: reason !== undefined ? reason : config.reason || '',
        activatedAt: enabled ? new Date().toISOString() : undefined,
        activatedBy: enabled ? adminEmail || 'mike777rafael@gmail.com' : undefined,
      };

      // 1. Immediately update locally so UI responds with zero delay
      applyConfig(nextConfig);

      // 2. Dispatch custom event for real-time local sync in current window
      window.dispatchEvent(
        new CustomEvent<MaintenanceConfig>(MAINTENANCE_EVENT, { detail: nextConfig })
      );

      // 3. Persist to Supabase cloud table app_settings so all other devices receive it
      if (supabase && isSupabaseConfigured) {
        try {
          const { error } = await supabase.from('app_settings').upsert(
            {
              key: 'maintenance',
              value: nextConfig,
              updated_at: new Date().toISOString(),
              updated_by: adminEmail || 'mike777rafael@gmail.com',
            },
            { onConflict: 'key' }
          );

          if (error) {
            console.warn('Could not sync maintenance mode to Supabase app_settings:', error.message);
          }
        } catch (err) {
          console.error('Error saving maintenance mode to Supabase:', err);
        }
      }
    },
    [config.reason, applyConfig]
  );

  return {
    isMaintenance: config.isEnabled,
    reason: config.reason,
    activatedAt: config.activatedAt,
    activatedBy: config.activatedBy,
    setMaintenanceMode,
    refreshMaintenance: fetchCloudMaintenance,
  };
}
