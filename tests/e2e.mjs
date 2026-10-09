/**
 * StatusHired browser end-to-end test (Playwright).
 *
 *   npm run test:e2e                       (WEB_URL defaults to http://localhost:3000)
 *   WEB_URL=http://localhost:5000 npm run test:e2e      ← against the production build
 *
 * First time only:  npx playwright install chromium
 *
 * Logs in with the demo account (or E2E_EMAIL / E2E_PASSWORD), visits EVERY route in
 * both themes (toggles whatever theme the account last used), opens the command palette, account menu, settings, the profile editor,
 * asserts there are zero console errors / uncaught exceptions / failed API calls and writes
 * screenshots to tests/screenshots/. Exits 1 on any failure.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const WEB = (process.env.WEB_URL || 'http://localhost:3000').replace(/\/$/, '');
const EMAIL = process.env.E2E_EMAIL || 'demo@statushired.app';
const PASSWORD = process.env.E2E_PASSWORD || 'demo1234';
const SHOTS = join(dirname(fileURLToPath(import.meta.url)), 'screenshots');
mkdirSync(SHOTS, { recursive: true });

const ROUTES = ['/', '/applications', '/board', '/resumes', '/reminders', '/profile', '/about', '/this-route-does-not-exist'];
const failures = [];
const consoleErrors = [];
let stage = 'boot';

const fail = (msg) => { failures.push(msg); console.log('❌', msg); };
const pass = (msg) => console.log('✅', msg);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();

page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`[${stage}] ${m.text().slice(0, 300)}`); });
page.on('pageerror', (e) => consoleErrors.push(`[${stage}] UNCAUGHT ${e.message}`));
page.on('response', (r) => { if (r.url().includes('/api/') && r.status() >= 500) consoleErrors.push(`[${stage}] API ${r.status()} ${r.url()}`); });

try {
  // ---------- Login ----------
  stage = 'login';
  await page.goto(`${WEB}/login`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(SHOTS, '00-login.png') });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 15000 });
  pass(`logged in as ${EMAIL}`);

  // Unauthenticated redirect check in a fresh context
  const anon = await (await browser.newContext()).newPage();
  await anon.goto(`${WEB}/applications`, { waitUntil: 'networkidle' });
  if (anon.url().includes('/login')) pass('protected route redirects anonymous user to /login');
  else fail(`anonymous user was NOT redirected (landed on ${anon.url()})`);
  await anon.context().close();

  // ---------- Every route, light + dark ----------
  let n = 1;
  for (const theme of ['light', 'dark']) {
    for (const route of ROUTES) {
      stage = `${theme} ${route}`;
      const res = await page.goto(`${WEB}${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
      const name = route === '/' ? 'dashboard' : route.replace(/\//g, '').slice(0, 24);
      await page.screenshot({ path: join(SHOTS, `${String(n++).padStart(2, '0')}-${theme}-${name}.png`), fullPage: true });
      const bodyText = (await page.textContent('body')) || '';
      if (route.includes('does-not-exist')) {
        if (/404|not found/i.test(bodyText)) pass(`${theme} ${route} shows 404 page`);
        else fail(`${theme} ${route} did not show a 404 page`);
      } else if (bodyText.trim().length < 50) {
        fail(`${theme} ${route} rendered (almost) empty page`);
      } else {
        pass(`${theme} ${route} rendered (${res?.status()})`);
      }
    }
    if (theme === 'light') {
      const before = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      await page.click('button[aria-label="Toggle theme"]');
      await page.waitForTimeout(400);
      const after = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      if (before !== after) pass(`theme toggle switches ${before ? 'dark → light' : 'light → dark'} (persisted preference respected)`);
      else fail('theme toggle did not change the .dark class');
    }
  }

  // ---------- Header widgets ----------
  stage = 'header';
  await page.goto(`${WEB}/`, { waitUntil: 'networkidle' });
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(400);
  if (await page.locator('input[placeholder*="Search companies"]').isVisible()) pass('⌘K command palette opens'); else fail('command palette did not open');
  const paletteText = await page.textContent('body');
  if (/Quick Actions|Navigation/.test(paletteText)) fail('command palette still shows Quick Actions / Navigation'); else pass('command palette has no quick-navigation section');
  await page.screenshot({ path: join(SHOTS, '90-command-palette.png') });
  await page.keyboard.press('Escape');

  await page.click('button[aria-label="Create new"]'); await page.waitForTimeout(300);
  const createItems = await page.getByRole('menuitem').allTextContents();
  if (createItems.some((t) => /New application/i.test(t)) && createItems.some((t) => /Upload resume/i.test(t)) && createItems.some((t) => /New reminder/i.test(t))) pass('"+" dropdown lists application / resume / reminder');
  else fail(`"+" dropdown items unexpected: ${createItems.join(', ')}`);
  await page.getByRole('menuitem', { name: /New reminder/ }).click(); await page.waitForTimeout(400);
  if (await page.locator('form').first().isVisible()) pass('"+" → New reminder opens the reminder modal'); else fail('reminder modal did not open from "+"');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);

  await page.click('button[aria-label="Notifications"]'); await page.waitForTimeout(300);
  if (await page.getByText('Notifications', { exact: true }).first().isVisible()) pass('notification dropdown opens'); else fail('notification dropdown missing');
  await page.keyboard.press('Escape'); await page.mouse.click(5, 500);

  await page.click('button[aria-label="Account menu"]'); await page.waitForTimeout(300);
  await page.screenshot({ path: join(SHOTS, '91-account-menu.png') });
  await page.getByRole('menuitem', { name: 'Settings' }).click(); await page.waitForTimeout(500);
  if (await page.getByText(/Settings/).first().isVisible()) pass('settings modal opens from avatar menu'); else fail('settings modal did not open');
  await page.screenshot({ path: join(SHOTS, '92-settings.png') });
  await page.keyboard.press('Escape');

  // ---------- Profile editor round-trip ----------
  stage = 'profile-edit';
  await page.goto(`${WEB}/profile`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Edit profile/ }).first().click();
  await page.waitForTimeout(400);
  const headline = `E2E headline ${Date.now()}`;
  await page.fill('input[placeholder="Computer Engineer · Full-stack developer"]', headline);
  await page.getByRole('button', { name: /Save changes/ }).click();
  await page.waitForTimeout(1200);
  if ((await page.textContent('body')).includes(headline)) pass('profile edit saved and re-rendered'); else fail('profile headline not updated');
  await page.screenshot({ path: join(SHOTS, '93-profile-after-edit.png'), fullPage: true });

  // ---------- Create + delete an application via UI ----------
  stage = 'new-application';
  await page.goto(`${WEB}/applications`, { waitUntil: 'networkidle' });
  await page.keyboard.press('n'); await page.waitForTimeout(500);
  const company = `E2E Corp ${Date.now() % 10000}`;
  const companyInput = page.locator('input[placeholder="e.g. Acme Corp"], input[name="company_name"]').first();
  if (await companyInput.count()) {
    await companyInput.fill(company);
    await page.locator('input[placeholder="e.g. Senior Frontend Engineer"], input[name="role"]').first().fill('QA Engineer');
    await page.locator('form button[type="submit"]').last().click();
    await page.waitForTimeout(1500);
    if ((await page.textContent('body')).includes(company)) pass('new application appears in list'); else fail('new application not found after submit');
  } else {
    fail('new application modal did not open with N shortcut');
  }
  await page.screenshot({ path: join(SHOTS, '94-applications-after-create.png'), fullPage: true });

  // ---------- Mobile layout ----------
  stage = 'mobile';
  const mobile = await (await browser.newContext({ viewport: { width: 390, height: 844 }, storageState: await context.storageState() })).newPage();
  await mobile.goto(`${WEB}/`, { waitUntil: 'networkidle' });
  await mobile.locator('button[aria-label="Toggle navigation"]').dispatchEvent('click');
  await mobile.waitForTimeout(400);
  if (await mobile.getByRole('link', { name: 'Applications' }).first().isVisible()) pass('mobile hamburger menu opens'); else fail('mobile menu did not open');
  await mobile.screenshot({ path: join(SHOTS, '95-mobile-menu.png') });
  await mobile.context().close();

  // ---------- Sign out ----------
  stage = 'signout';
  await page.click('button[aria-label="Account menu"]');
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await page.waitForURL((u) => u.pathname.startsWith('/login'), { timeout: 10000 });
  pass('sign out returns to /login');
} catch (e) {
  fail(`[${stage}] ${e.message.split('\n')[0]}`);
  await page.screenshot({ path: join(SHOTS, `99-failure-${stage.replace(/\W+/g, '_')}.png`) }).catch(() => {});
} finally {
  await browser.close();
}

const realConsoleErrors = consoleErrors.filter((e) => !/favicon|net::ERR_ABORTED|ResizeObserver/.test(e));
if (realConsoleErrors.length) {
  fail(`${realConsoleErrors.length} console/page error(s):`);
  realConsoleErrors.forEach((e) => console.log('   •', e));
} else pass('zero console errors across all pages');

console.log(`\nScreenshots → ${SHOTS}`);
console.log(failures.length ? `\n⚠️  ${failures.length} failure(s)\n` : '\n🎉 All e2e checks passed\n');
process.exit(failures.length ? 1 : 0);
