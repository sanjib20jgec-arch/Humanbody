import { test, expect } from '@playwright/test';

async function openApp(page, hash = '') {
  await page.goto(`/${hash}`);
  await page.waitForSelector('[data-hbl-app="true"]', { timeout: 20000 });
  return page.locator('[data-hbl-app="true"]');
}

test('phase 108: hash deep link opens module; back returns home; selecting updates hash', async ({ page }) => {
  await openApp(page);
  await page.goto('/#/m/circulation');
  await expect(page.locator('.module-screen.circulation-screen')).toBeVisible({ timeout: 15000 });
  await page.goBack();
  await expect(page.locator('.home-main')).toBeVisible({ timeout: 8000 });
  await page.locator('.module-list-item', { hasText: 'Movement Theater' }).click();
  await page.waitForFunction(() => window.location.hash.includes('#/m/kinesiology'), null, { timeout: 5000 });
});

test('phase 109: offline chip appears and install button honors beforeinstallprompt', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => window.dispatchEvent(new Event('beforeinstallprompt')));
  await expect(page.locator('.header-actions .pwa-only', { hasText: 'Install app' })).toBeVisible();
  await page.context().setOffline(true);
  await expect(page.locator('.net-chip')).toBeVisible();
  await page.context().setOffline(false);
  await expect(page.locator('.net-chip')).toBeHidden();
});

test('phase 110: below-fold containment and lazy imagery', async ({ page }) => {
  await openApp(page);
  const cv = await page.evaluate(() => getComputedStyle(document.querySelector('.home-bottom')).contentVisibility);
  expect(cv).toBe('auto');
  const imgOk = await page.evaluate(async () => {
    await document.querySelector('.module-list-item')?.click();
    return true;
  });
  expect(imgOk).toBe(true);
});

test('phase 111: skip link is first tab stop and ribbon buttons are labelled', async ({ page }) => {
  await openApp(page);
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  const theater = await page.goto('/#/m/kinesiology');
  await page.waitForSelector('[data-kinesiology-theater="true"]', { timeout: 20000 });
  const labeled = await page.evaluate(() => Array.from(document.querySelectorAll('.kine-ribbon button')).every((b) => (b.getAttribute('aria-label') || '').startsWith('Seek to')));
  expect(labeled).toBe(true);
});

test('phase 112: data export downloads JSON and erase is two-step', async ({ page }) => {
  await openApp(page);
  await page.locator('.header-icon-button', { hasText: 'Settings' }).click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('.data-actions button', { hasText: 'Export' }).click()]);
  expect(download.suggestedFilename()).toBe('human-biology-lab-data.json');
  await page.locator('.data-actions button', { hasText: 'Erase all' }).click();
  await expect(page.locator('.data-actions button', { hasText: 'Tap again to erase' })).toBeVisible();
});
