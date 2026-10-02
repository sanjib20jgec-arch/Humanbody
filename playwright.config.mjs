import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  // SwiftShader WebGL leaks GPU resources across concurrent browser contexts;
  // serializing workers keeps the software-renderer test runs stable.
  workers: 1,
  timeout: 45_000,
  // Phase 118 (R9): this CI box is 2 cores / 2 GB with SwiftShader GL; the old
  // 8 s expect budget flaked under suite-level load (unrelated modules failed).
  expect: { timeout: 15_000 },
  // GitHub annotations expose failing contracts in the PR checks UI as well as CI logs.
  reporter: process.env.CI ? [['github'], ['line'], ['html', { open: 'never' }]] : 'line',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    launchOptions: {
      args: ['--use-gl=angle', '--use-angle=swiftshader']
    }
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'chromium-phone', use: { ...devices['Pixel 5'] } }
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 30_000
  }
});
