import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { applyDeviceProfileClasses, watchDeviceProfileChanges } from './lib/deviceProfile.js';
import './styles.css';

// Phase 119 (R11): the offline artifact's boot watchdog (plain-ES5 script in
// the generated HTML) shows a friendly note if this bundle never evaluates —
// i.e. the device's browser is too old for the file.
if (typeof window !== 'undefined') window.__HBL_BOOTED__ = true;

// Android APK pass: flag WebView shells so CSS can adapt (hide web-only PWA affordances).
if (typeof window !== 'undefined') {
  const ua = navigator.userAgent || '';
  const inWebView = Boolean(window.Capacitor) || (/Android/i.test(ua) && /; wv\)/.test(ua));
  if (inWebView) document.documentElement.classList.add('in-webview');
}

// Device matrix pass: stamp form-factor/input classes before first paint so
// phone, tablet, desktop, and TV layouts apply without a flash, and keep them
// correct through rotation, folding, and monitor changes.
applyDeviceProfileClasses();
watchDeviceProfileChanges();

class AppErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#08111c', color: '#dce8f5', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
      <section role="alert" style={{ maxWidth: 520 }}>
        <strong style={{ display: 'block', fontSize: 20 }}>This learning bay needs a reset</strong>
        <p style={{ color: '#91a5bc', fontSize: 13, lineHeight: 1.6 }}>The interactive view hit an unexpected error. Your saved progress remains on this device.</p>
        <button type="button" onClick={() => window.location.reload()} style={{ padding: '10px 14px', color: '#06131d', background: '#4dd8df', border: 0, borderRadius: 8, font: 'inherit', fontWeight: 700, cursor: 'pointer' }}>Reload the lab</button>
      </section>
    </main>;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
if (typeof window !== 'undefined') window.__HBL_APP_MOUNTED__ = true;
if (typeof performance !== 'undefined') performance.mark('hbl-shell-mounted');

// Register the production shell worker only in a built deployment. The
// offline generator emits the built bundle as a module, so Vite's environment
// replacement and preload helpers remain valid in the standalone artifact.
if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Offline caching is an enhancement; the app remains network-capable.
    });
  }, { once: true });
}

// Android APK pass: hardware back button — navigate home first, then exit.
if (window.Capacitor?.Plugins?.App?.addListener) {
  window.Capacitor.Plugins.App.addListener('backButton', () => {
    const back = document.querySelector('.module-screen .back-button, .preview-screen .back-button');
    if (back) back.click();
    else window.Capacitor.Plugins.App.exitApp();
  });
}

// Phase 110: dev-only long-task telemetry for performance hygiene.
if (import.meta.env.DEV && 'PerformanceObserver' in window) {
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) if (entry.duration > 120) console.warn(`[hbl] long task ${Math.round(entry.duration)}ms`);
  }).observe({ entryTypes: ['longtask'] });
}
