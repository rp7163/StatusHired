/**
 * StatusHired API smoke/integration test.
 *
 *   npm run test:api                 (API_URL defaults to http://localhost:5000)
 *   API_URL=https://my-host npm run test:api
 *
 * Exercises EVERY REST endpoint end-to-end with a throw-away account:
 * sign-up (OTP) → login → settings → applications → stage history → resumes
 * (upload + signed URL + file download) → reminders → profile + avatar → delete account.
 * Exits with code 1 if any assertion fails. No dependencies besides Node 18+ (global fetch).
 */

const API = (process.env.API_URL || 'http://localhost:5000').replace(/\/$/, '');
const results = [];
let token = null;

const stamp = Date.now();
const email = `apitest+${stamp}@example.com`;
const password = 'Passw0rd!123';

function log(ok, name, extra = '') {
  results.push({ ok, name });
  console.log(`${ok ? '✅' : '❌'} ${name}${extra ? ' — ' + extra : ''}`);
}

async function call(method, path, { body, form, auth = true, raw = false, expect } = {}) {
  const headers = {};
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  let payload = undefined;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(API + path, { method, headers, body: payload });
  const ct = res.headers.get('content-type') || '';
  const data = raw ? null : ct.includes('application/json') ? await res.json().catch(() => null) : await res.text().catch(() => null);
  const expected = Array.isArray(expect) ? expect : [expect ?? 200];
  const ok = expected.includes(res.status);
  log(ok, `${method} ${path}`, ok ? `${res.status}` : `expected ${expected.join('/')}, got ${res.status} ${typeof data === 'string' ? data.slice(0, 120) : JSON.stringify(data)?.slice(0, 200)}`);
  return { status: res.status, data, res };
}

function assert(cond, name) {
  log(Boolean(cond), name);
}

// Tiny valid 1x1 PNG + PDF so uploads are exercised without fixtures.
const PNG_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);
const PDF_MIN = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF');

(async () => {
  console.log(`\n▶ Testing API at ${API}\n`);

  // ---------- Health ----------
  await call('GET', '/api/health', { auth: false });

  // ---------- Auth: sign-up with OTP ----------
  const req = await call('POST', '/api/auth/signup/request', { auth: false, body: { email, password, full_name: 'API Tester' } });
  const otp = req.data?.dev_code || req.data?.code || req.data?.otp;
  await call('POST', '/api/auth/signup/resend', { auth: false, body: { email }, expect: [200, 429] });
  if (otp) {
    const ver = await call('POST', '/api/auth/signup/verify', { auth: false, body: { email, code: String(otp) } });
    token = ver.data?.token || null;
  } else {
    log(false, 'OTP code available in dev response (dev_code)', 'set NODE_ENV!=production or check otpStore');
  }

  // Fallback: demo account (SEED_DEMO=true) so the rest of the suite still runs
  if (!token) {
    const login = await call('POST', '/api/auth/login', { auth: false, body: { email: 'demo@statushired.app', password: 'demo1234' } });
    token = login.data?.token || null;
  } else {
    const login = await call('POST', '/api/auth/login', { auth: false, body: { email, password } });
    token = login.data?.token || token;
  }
  await call('POST', '/api/auth/login', { auth: false, body: { email, password: 'wrong' }, expect: [400, 401] });
  assert(token, 'received JWT token');
  if (!token) return finish();

  // ---------- Me / profile ----------
  const me = await call('GET', '/api/auth/me');
  const userId = me.data?.user?.id;
  assert(userId, 'GET /api/auth/me returns user.id');
  const patched = await call('PATCH', '/api/auth/me', {
    body: {
      full_name: 'API Tester',
      username: 'api_tester',
      headline: 'Automated test account',
      bio: 'Created by tests/api.test.mjs',
      location: 'Vadodara, Gujarat',
      github_url: 'github.com/rp7163',
      links: [{ label: 'Docs', url: 'https://example.com/docs' }],
      open_to_work: true,
    },
  });
  assert(patched.data?.user?.github_url === 'https://github.com/rp7163', 'URL fields are normalised with https://');
  assert(patched.data?.user?.links?.length === 1, 'extra links persisted');
  await call('GET', '/api/auth/me/unauthorized-probe', { auth: false, expect: [401, 404] });
  await call('GET', '/api/auth/me', { auth: false, expect: 401 });

  // ---------- Avatar ----------
  await call('GET', `/api/users/${userId}/avatar`, { auth: false, raw: true, expect: 404 });
  const fdAv = new FormData();
  fdAv.append('avatar', new Blob([PNG_1x1], { type: 'image/png' }), 'avatar.png');
  const up = await call('POST', '/api/auth/me/avatar', { form: fdAv });
  assert(up.data?.user?.avatar_url, 'avatar_url set after upload');
  await call('GET', `/api/users/${userId}/avatar`, { auth: false, raw: true });
  await call('DELETE', '/api/auth/me/avatar');
  await call('GET', `/api/users/${userId}/avatar`, { auth: false, raw: true, expect: 404 });

  // ---------- Settings ----------
  await call('GET', '/api/settings');
  await call('PUT', '/api/settings', { body: { theme: 'dark', notifications_enabled: true } });

  // ---------- Applications ----------
  const created = await call('POST', '/api/applications', {
    body: { company_name: 'Test Corp', role: 'SDE', stage: 'saved', location: 'Remote', salary: '12 LPA', notes: 'created by api test' },
    expect: [200, 201],
  });
  const appId = created.data?.id || created.data?.application?.id;
  assert(appId, 'application created with id');
  const second = await call('POST', '/api/applications', { body: { company_name: 'Second Inc', role: 'Frontend', stage: 'applied' }, expect: [200, 201] });
  const appId2 = second.data?.id || second.data?.application?.id;
  await call('GET', '/api/applications');
  await call('PATCH', `/api/applications/${appId}`, { body: { notes: 'updated' } });
  await call('PATCH', `/api/applications/${appId}/stage`, { body: { stage: 'interview' } });
  await call('PUT', '/api/applications/reorder', { body: { items: [{ id: appId2, position: 0, stage: 'applied' }, { id: appId, position: 1, stage: 'interview' }] }, expect: [200, 204] });
  await call('GET', `/api/stage-history?application_id=${appId}`);

  // ---------- Reminders ----------
  const rem = await call('POST', '/api/reminders', {
    body: { title: 'Follow up', remind_at: new Date(Date.now() + 86400000).toISOString(), application_id: appId },
    expect: [200, 201],
  });
  const remId = rem.data?.id || rem.data?.reminder?.id;
  assert(remId, 'reminder created with id');
  await call('GET', '/api/reminders');
  await call('PATCH', `/api/reminders/${remId}`, { body: { is_done: true } });
  await call('PATCH', '/api/reminders/bulk', { body: { ids: [remId], is_done: false }, expect: [200, 204] });
  await call('DELETE', `/api/reminders/${remId}`, { expect: [200, 204] });

  // ---------- Resumes ----------
  const fd = new FormData();
  fd.append('file', new Blob([PDF_MIN], { type: 'application/pdf' }), 'resume.pdf');
  fd.append('name', 'Test Resume');
  const res = await call('POST', '/api/resumes', { form: fd, expect: [200, 201] });
  const resumeId = res.data?.id || res.data?.resume?.id;
  assert(resumeId, 'resume uploaded with id');
  await call('GET', '/api/resumes');
  await call('PATCH', `/api/resumes/${resumeId}`, { body: { name: 'Renamed Resume' } });
  const signed = await call('GET', `/api/resumes/${resumeId}/url`);
  const signedUrl = signed.data?.url;
  assert(signedUrl && signedUrl.includes('token='), 'signed URL contains token');
  if (signedUrl) {
    const r = await fetch(API + signedUrl);
    assert(r.status === 200, `GET signed resume URL downloads file (${r.status})`);
  }
  await call('GET', `/api/resumes/${resumeId}/file`, { auth: false, raw: true, expect: [401, 403] });
  await call('DELETE', `/api/resumes/${resumeId}`, { expect: [200, 204] });

  // ---------- Cleanup ----------
  await call('DELETE', `/api/applications/${appId2}`, { expect: [200, 204] });
  await call('DELETE', `/api/applications/${appId}`, { expect: [200, 204] });
  await call('GET', `/api/applications/${appId}`, { expect: [404, 405] });

  if (email && me.data?.user?.email === email) {
    await call('DELETE', '/api/auth/me', { expect: [200, 204] });
    await call('GET', '/api/auth/me', { expect: 401 });
  } else {
    console.log('ℹ️  Skipping account deletion (ran against demo account)');
  }

  finish();
})().catch((e) => {
  console.error('\n💥 Test runner crashed:', e);
  process.exit(1);
});

function finish() {
  const passed = results.filter((r) => r.ok).length;
  const failed = results.length - passed;
  console.log(`\n${failed === 0 ? '🎉' : '⚠️ '} ${passed}/${results.length} checks passed${failed ? `, ${failed} FAILED` : ''}\n`);
  process.exit(failed ? 1 : 0);
}
