import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { applyPreferencesToDocument, readAllPreferences, writePreference } from './preferences.js';
import { translate } from './i18n.js';

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(readAllPreferences);

  useEffect(() => { applyPreferencesToDocument(prefs); }, [prefs]);

  // Auto theme must react live when the OS switches light/dark.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return undefined;
    const onChange = () => applyPreferencesToDocument(prefs);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [prefs]);

  const setPreference = useCallback((name, value) => {
    const clean = writePreference(name, value);
    setPrefs((current) => ({ ...current, [name]: clean }));
  }, []);

  const value = useMemo(() => ({
    prefs,
    setPreference,
    t: (key, fallback) => translate(prefs.language, key, fallback)
  }), [prefs, setPreference]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider');
  return ctx;
}
