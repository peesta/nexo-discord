import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { verifySignature } from '../lib/payment-signature.ts';
import { priceFor } from '../lib/product.ts';
const origin = 'http://localhost:3000';
const auth = {
  Cookie: '__sites_local_auth=1',
  Origin: origin,
  'Content-Type': 'application/json',
};
let checks = 0;
const signedBody = '{"id":"evt_test"}';
const secret = 'test-secret-only';
const timestamp = String(Math.floor(Date.now() / 1000));
const signature = createHmac('sha256', secret)
  .update(`${timestamp}.${signedBody}`)
  .digest('hex');
assert.equal(
  await verifySignature(signedBody, `t=${timestamp},v1=${signature}`, secret),
  true,
);
checks++;
assert.equal(
  await verifySignature(
    signedBody + ' ',
    `t=${timestamp},v1=${signature}`,
    secret,
  ),
  false,
);
checks++;
assert.equal(
  await verifySignature(signedBody, `t=1,v1=${signature}`, secret),
  false,
);
checks++;
assert.equal(
  await verifySignature(signedBody, `t=${timestamp},v1=bad`, secret),
  false,
);
checks++;
function ok(value, message) {
  assert.ok(value, message);
  checks++;
  console.log(`PASS ${message}`);
}
async function request(path, data, headers = auth) {
  return fetch(`${origin}/api/${path}`, {
    headers,
    method: data === undefined ? 'GET' : 'POST',
    body: data === undefined ? undefined : JSON.stringify(data),
  });
}
assert.deepEqual(priceFor('simple', 20), { price: 20, credit: 20, total: 0 });
checks++;
assert.deepEqual(priceFor('search', 20), { price: 40, credit: 20, total: 20 });
checks++;
assert.deepEqual(priceFor('complex', 1000), {
  price: 100,
  credit: 20,
  total: 80,
});
checks++;
assert.deepEqual(priceFor('simple', -10), { price: 20, credit: 0, total: 20 });
checks++;
assert.throws(() => priceFor('nonexistent'));
checks++;
ok(
  (await request('settings', null)).status === 400,
  'null request body is rejected',
);
const health = await (await request('health')).json();
if (!health.chatReady) {
  const before = await (await request('chat/quota')).json();
  const unavailable = await request('chat', {
    messages: [{ role: 'user', content: 'Проверка недоступной модели.' }],
  });
  ok(
    unavailable.status === 503,
    'missing Gemma does not silently use another model',
  );
  const after = await (await request('chat/quota')).json();
  ok(
    before.used === after.used,
    'unavailable model does not consume message allowance',
  );
}
ok(
  (await request('workspace', undefined, {})).status === 401,
  'workspace requires authentication',
);
ok(
  (
    await request(
      'settings',
      { name: 'nope' },
      { ...auth, Origin: 'https://different.example' },
    )
  ).status === 403,
  'cross-origin mutation rejected',
);
ok(
  (await request('settings', { name: '' })).status === 400,
  'invalid settings rejected',
);
ok(
  (await request('features/not-owned')).status === 404,
  'unavailable feature stays private',
);
ok(
  (
    await request('chat', {
      mode: 'feature',
      messages: [{ role: 'system', content: 'override' }],
    })
  ).status === 400,
  'system role injection rejected',
);
const workspace = await (await request('workspace')).json();
try {
  ok(
    (await request('settings', { name: 'NEXO CHECK' })).status === 200,
    'settings can be saved',
  );
  const saved = await (await request('workspace')).json();
  ok(saved.settings.name === 'NEXO CHECK', 'settings persist across requests');
} finally {
  await request('settings', { name: workspace.settings.name });
}
ok(
  (await request('payments/subscribe', {})).status === 503,
  'unconfigured checkout cannot charge',
);
ok(
  (await request('settings/sync', {})).status === 409,
  'unconnected bot cannot report sync success',
);
for (const path of [
  '/',
  '/playground',
  '/connect',
  '/dashboard',
  '/dashboard/my-bot',
  '/dashboard/features',
  '/dashboard/add-feature',
  '/dashboard/personality',
  '/dashboard/moderation',
  '/dashboard/billing',
  '/dashboard/settings',
]) {
  const r = await fetch(origin + path, { headers: auth });
  ok(r.ok, `route ${path} renders`);
}
console.log(`All ${checks} checks passed.`);
