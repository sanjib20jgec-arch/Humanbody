import React from 'react';

const paths = {
  volume: <><path d="M4 10v4h3l4 3V7L7 10H4Z"/><path d="M15 9.5a4 4 0 0 1 0 5M17.5 7a7.5 7.5 0 0 1 0 10"/></>,
  mute: <><path d="M4 10v4h3l4 3V7L7 10H4Z"/><path d="m16 10 4 4m0-4-4 4"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.7-1.7.1-.1A1.7 1.7 0 0 0 7.6 15a1.7 1.7 0 0 0-1.6-1H5.9v-2.4H6a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L8.9 7l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.1h2.4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19 8.7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v2.4h-.1a1.7 1.7 0 0 0-1.6.9Z"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.4 2.4 0 1 1 3.8 1.9c-.8.6-1.5 1-1.5 2.1M12 16.5h.01"/></>,
  play: <path d="m9 6 9 6-9 6V6Z" fill="currentColor" stroke="none"/>,
  pause: <><path d="M8 6v12M16 6v12"/></>,
  reset: <><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/></>,
  step: <><path d="m6 5 7 7-7 7"/><path d="M18 5v14"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  chevron: <path d="m9 6 6 6-6 6"/>,
  sparkle: <><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z"/><path d="m19 15 .5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5.5-2Z"/></>,
  chat: <><path d="M19 11.5a7 7 0 0 1-7 7 7.7 7.7 0 0 1-3.1-.7L5 19l1.2-3.3A7 7 0 1 1 19 11.5Z"/><path d="M9 11.5h.01M12 11.5h.01M15 11.5h.01"/></>,
  zoomIn: <><circle cx="10.8" cy="10.8" r="6.4"/><path d="m16 16 4 4M10.8 8v5.6M8 10.8h5.6"/></>,
  zoomOut: <><circle cx="10.8" cy="10.8" r="6.4"/><path d="m16 16 4 4M8 10.8h5.6"/></>,
  fullscreen: <><path d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4"/></>,
  check: <path d="m5 12 4.3 4.3L19 6.7"/>,
  lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
  lab: <><path d="M9 3h6M10 3v6L5 18a2 2 0 0 0 1.7 3h10.6A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 16h9"/></>,
  bulb: <><path d="M9 18h6M10 21h4"/><path d="M8.5 15.5A6 6 0 1 1 15.5 15c-.8.7-1.4 1.5-1.5 3h-4c-.1-1.5-.7-2.2-1.5-2.5Z"/></>,
  sliders: <><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="11" cy="18" r="2" fill="currentColor" stroke="none"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  back: <><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></>,
  external: <><path d="M14 5h5v5M19 5l-8 8"/><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></>
};

export function Icon({ name, size = 18, strokeWidth = 1.8, className = '' }) {
  return <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
