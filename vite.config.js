import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: mode === 'offline' ? {
    // The offline artifact must also boot on the older Chromium/WebView that
    // budget Android handsets ship: transpile syntax down to ~2019 engines.
    // Runtime APIs are covered by the ES5 shim injected by
    // scripts/generate-offline-theater.mjs.
    target: ['es2019', 'chrome70', 'safari12', 'firefox68'],
    // The offline generator consumes this build. Keep lazy simulation chunks
    // embedded in one browser file so the artifact remains self-contained.
    rolldownOptions: { output: { codeSplitting: false } },
  } : undefined,
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    watch: {
      // Android toolchain dirs hold tens of thousands of files; never watch them.
      ignored: ['**/android/**', '**/android-sdk/**', '**/jdk17/**', '**/dist-offline/**', '**/vendor/**', '**/node_modules/**']
    },
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
}));
