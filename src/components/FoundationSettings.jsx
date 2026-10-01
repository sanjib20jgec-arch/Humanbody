import React from 'react';
import { usePreferences } from '../lib/PreferencesContext.jsx';
import { PREFERENCE_SCHEMA } from '../lib/preferences.js';

// Foundation Settings rows: language, theme, curriculum, level, text size, low graphics.
function Segmented({ name, label }) {
  const { prefs, setPreference, t } = usePreferences();
  return <div className="segmented" role="group" aria-label={label}>
    {PREFERENCE_SCHEMA[name].values.map((value) => <button
      key={value}
      type="button"
      aria-pressed={prefs[name] === value}
      lang={name === 'language' ? value : undefined}
      onClick={() => setPreference(name, value)}
    >{name === 'language' ? (value === 'bn' ? 'বাংলা' : 'English') : name === 'textScale' ? `${value}%` : t(`settings.${name}.${value}`)}</button>)}
  </div>;
}

function Row({ name }) {
  const { t } = usePreferences();
  const label = t(`settings.${name}`);
  return <div className="setting-row" data-setting={name}><div><strong>{label}</strong><span>{t(`settings.${name}.help`)}</span></div><Segmented name={name} label={label} /></div>;
}

export default function FoundationSettings() {
  const { prefs, setPreference, t } = usePreferences();
  return <>
    <Row name="language" />
    <Row name="theme" />
    <Row name="curriculum" />
    <Row name="level" />
    <Row name="textScale" />
    <div className="setting-row" data-setting="graphics"><div><strong>{t('settings.graphics')}</strong><span>{t('settings.graphics.help')}</span></div><button className={`toggle ${prefs.graphics === 'low' ? 'on' : ''}`} onClick={() => setPreference('graphics', prefs.graphics === 'low' ? 'full' : 'low')} aria-pressed={prefs.graphics === 'low'} aria-label={t('settings.graphics')}><i /></button></div>
  </>;
}
