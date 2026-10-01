import { useState, useEffect } from 'react';
import type { UserSettings, ThemeMode } from '../types/file';

const SETTINGS_KEY = 'file2pdf_settings';

const defaultSettings: UserSettings = {
  theme: 'light',
  defaultPageSize: 'A4',
  defaultMode: 'separate',
  defaultOrientation: 'auto',
  maxFileSizeMB: 50,
};

function loadSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch { /* ignore */ }
  return defaultSettings;
}

function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(loadSettings);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    let effectiveTheme: 'light' | 'dark';

    if (settings.theme === 'system') {
      effectiveTheme = getSystemTheme();
    } else {
      effectiveTheme = settings.theme as 'light' | 'dark';
    }

    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (settings.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const root = document.documentElement;
      if (mq.matches) root.classList.add('dark');
      else root.classList.remove('dark');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [settings.theme]);

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
  };

  return { settings, updateSettings, resetSettings };
}
