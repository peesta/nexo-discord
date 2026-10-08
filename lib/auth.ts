import { db, now, json, body, rate, ApiError } from './server';

// Email + password accounts. Sessions are random tokens in an HttpOnly
// cookie; only their SHA-256 hash is stored in D1.
const COOKIE = 'nexo_session';
const SESSION_DAYS = 30;
const ITERATIONS = 100000; // Workers caps PBKDF2 at 100k iterations.

type Account = { id: string; email: string };

const hex = (bytes: ArrayBuffer | Uint8Array) =>
  [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
const sha256 = async (text: string) =>
  hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));

async function derive(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: new TextEncoder().encode(salt),
      iterations: ITERATIONS,
    },
    key,
    256,
  );
  return hex(bits);
}
async function hashPassword(password: string) {
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  return `pbkdf2$${ITERATIONS}$${salt}$${await derive(password, salt)}`;
}
async function verifyPassword(password: string, stored: string) {
  const [, , salt, hash] = stored.split('$');
  const candidate = await derive(password, salt);
  let diff = candidate.length ^ hash.length;
  for (let i = 0; i < candidate.length; i++)
    diff |= candidate.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}
// Burns the same time as a real check so unknown emails are not revealed.
const DUMMY_HASH = `pbkdf2$${ITERATIONS}$00$00`;

function credentials(input: Record<string, unknown>) {
  const email =
    typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const password = typeof input.password === 'string' ? input.password : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    throw new ApiError(400, 'Укажите корректный email.');
  if (password.length < 8 || password.length > 200)
    throw new ApiError(400, 'Пароль должен быть от 8 до 200 символов.');
  return { email, password };
}

function sessionToken(cookieHeader: string | null) {
  return cookieHeader?.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))?.[1];
}
export async function accountFromCookie(
  cookieHeader: string | null,
): Promise<Account | null> {
  const token = sessionToken(cookieHeader);
  if (!token) return null;
  return db()
    .prepare(
      'SELECT users.id, users.email FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires > ?',
    )
    .bind(await sha256(token), Date.now())
    .first<Account>();
}

// Owner id of the request: the Sites header in local dev, otherwise a session.
export async function identity(req: Request) {
  const id =
    req.headers.get('oai-authenticated-user-id') ||
    (await accountFromCookie(req.headers.get('cookie')))?.id;
  if (!id) throw new ApiError(401, 'Войдите, чтобы открыть личный кабинет.');
  return id;
}

function sessionCookie(req: Request, value: string, maxAge: number) {
  const secure = new URL(req.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}
async function startSession(req: Request, userId: string) {
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  await db()
    .prepare(
      'INSERT INTO sessions (token_hash, user_id, expires, created_at) VALUES (?, ?, ?, ?)',
    )
    .bind(
      await sha256(token),
      userId,
      Date.now() + SESSION_DAYS * 86400000,
      now(),
    )
    .run();
  const response = json({ ok: true });
  response.headers.set(
    'Set-Cookie',
    sessionCookie(req, token, SESSION_DAYS * 86400),
  );
  return response;
}

export async function authRoute(req: Request, path: string) {
  const ip = req.headers.get('cf-connecting-ip') || 'local';
  if (path === 'auth/register') {
    await rate(`register:${ip}`, 5, 3600000);
    const { email, password } = credentials(await body(req));
    const id = `user:${crypto.randomUUID()}`;
    const created = await db()
      .prepare(
        'INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO NOTHING RETURNING id',
      )
      .bind(id, email, await hashPassword(password), now())
      .first();
    if (!created)
      throw new ApiError(409, 'Этот email уже зарегистрирован. Войдите.');
    return startSession(req, id);
  }
  if (path === 'auth/login') {
    await rate(`login:${ip}`, 10, 600000);
    const { email, password } = credentials(await body(req));
    await rate(`login:${email}`, 10, 600000);
    const user = await db()
      .prepare('SELECT id, password_hash FROM users WHERE email = ?')
      .bind(email)
      .first<{ id: string; password_hash: string }>();
    const valid = await verifyPassword(
      password,
      user?.password_hash || DUMMY_HASH,
    );
    if (!user || !valid) throw new ApiError(401, 'Неверный email или пароль.');
    return startSession(req, user.id);
  }
  if (path === 'auth/logout') {
    const token = sessionToken(req.headers.get('cookie'));
    if (token)
      await db()
        .prepare('DELETE FROM sessions WHERE token_hash = ?')
        .bind(await sha256(token))
        .run();
    const response = json({ ok: true });
    response.headers.set('Set-Cookie', sessionCookie(req, '', 0));
    return response;
  }
  throw new ApiError(404, 'Запрошенный раздел не найден.');
}
