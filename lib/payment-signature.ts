export async function verifySignature(
  payload: string,
  header: string,
  secret: string,
) {
  const parts = header.split(',').map((p) => p.split('='));
  const timestamp = parts.find((p) => p[0] === 't')?.[1];
  if (
    !timestamp ||
    !/^\d+$/.test(timestamp) ||
    Math.abs(Date.now() / 1000 - Number(timestamp)) > 300
  )
    return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  for (const [kind, value] of parts) {
    if (kind !== 'v1' || !value || !/^[a-f0-9]{64}$/.test(value)) continue;
    const bytes = Uint8Array.from(value.match(/../g)!, (v) => parseInt(v, 16));
    if (
      await crypto.subtle.verify(
        'HMAC',
        key,
        bytes,
        new TextEncoder().encode(`${timestamp}.${payload}`),
      )
    )
      return true;
  }
  return false;
}
