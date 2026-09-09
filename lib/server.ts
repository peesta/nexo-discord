import { env } from 'cloudflare:workers';
import { defaultSettings, type BotSettings } from './product';
type Bindings = {
  DB: D1Database;
  LM_BASE_URL?: string;
  CHAT_MODEL?: string;
  AGENT_MODEL?: string;
  LM_API_KEY?: string;
  DISCORD_CLIENT_ID?: string;
  DISCORD_CLIENT_SECRET?: string;
  DISCORD_BOT_TOKEN?: string;
  APP_ORIGIN?: string;
  TOKEN_ENCRYPTION_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_ID?: string;
  BOT_API_URL?: string;
  BOT_API_KEY?: string;
};
export const bindings = () => env as unknown as Bindings;
export const db = () => bindings().DB;
export const now = () => new Date().toISOString();
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
export function identity(req: Request) {
  const id = req.headers.get('oai-authenticated-user-id');
  if (!id) throw new ApiError(401, 'Войдите, чтобы открыть личный кабинет.');
  return id;
}
export function checkOrigin(req: Request) {
  const origin = req.headers.get('origin');
  if (!origin || origin !== new URL(req.url).origin)
    throw new ApiError(403, 'Запрос с другого сайта отклонён.');
  if (!req.headers.get('content-type')?.includes('application/json'))
    throw new ApiError(415, 'Требуется JSON.');
}
export async function body(req: Request) {
  const text = await req.text();
  if (text.length > 40000) throw new ApiError(413, 'Слишком длинный запрос.');
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      throw new Error('Expected an object');
    return parsed;
  } catch {
    throw new ApiError(400, 'Некорректные данные.');
  }
}
export function string(value: unknown, max = 4000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max)
    throw new ApiError(
      400,
      'Проверьте текст: он не должен быть пустым или слишком длинным.',
    );
  return value.trim();
}
type WorkspaceRow = {
  owner: string;
  settings: string;
  discord_id: string | null;
  discord_name: string | null;
  discord_token: string | null;
  guild_id: string | null;
  guild_name: string | null;
  plan: string;
  credit: number;
  credit_period: string | null;
  stripe_customer: string | null;
  stripe_subscription: string | null;
  renew_date: string | null;
  created_at: string;
};
export async function workspace(owner: string) {
  await db()
    .prepare(
      'INSERT OR IGNORE INTO workspaces (owner, settings, created_at) VALUES (?, ?, ?)',
    )
    .bind(owner, JSON.stringify(defaultSettings), now())
    .run();
  const row = await db()
    .prepare('SELECT * FROM workspaces WHERE owner = ?')
    .bind(owner)
    .first<WorkspaceRow>();
  if (!row) throw new ApiError(500, 'Не удалось открыть кабинет.');
  return { ...row, settings: JSON.parse(row.settings) as BotSettings };
}
export async function audit(owner: string, action: string, entity = '') {
  await db()
    .prepare(
      'INSERT INTO audit_log (id, owner, action, entity, created_at) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(crypto.randomUUID(), owner, action, entity, now())
    .run();
}
export async function rate(key: string, limit: number, windowMs: number) {
  const bucket = Math.floor(Date.now() / windowMs);
  const row = await db()
    .prepare(
      'INSERT INTO rate_limits (key, bucket, count) VALUES (?, ?, 1) ON CONFLICT(key, bucket) DO UPDATE SET count = count + 1 RETURNING count',
    )
    .bind(key, bucket)
    .first<{ count: number }>();
  if (row && row.count > limit)
    throw new ApiError(429, 'Слишком много запросов. Попробуйте чуть позже.');
}
export const lmConfig = () => ({
  base: (bindings().LM_BASE_URL || 'http://localhost:1234/v1').replace(
    /\/$/,
    '',
  ),
  chat: bindings().CHAT_MODEL || 'gemma-4b-instructed',
  agent: bindings().AGENT_MODEL || 'qwen2.5-coder-3b-instruct',
});
export async function lm(
  messages: { role: string; content: string }[],
  agent = false,
  stream = false,
) {
  const config = lmConfig();
  const model = agent ? config.agent : config.chat;
  const auth = bindings().LM_API_KEY
    ? { Authorization: `Bearer ${bindings().LM_API_KEY}` }
    : { Authorization: 'Bearer lm-studio' };
  let response: Response;
  try {
    const list = await fetch(`${config.base}/models`, {
      headers: auth,
      signal: AbortSignal.timeout(5000),
    });
    if (!list.ok) throw new Error('models unavailable');
    const models = (await list.json()) as { data?: { id: string }[] };
    if (!models.data?.some((m) => m.id === model))
      throw new ApiError(
        503,
        `Модель ${model} не найдена в LM Studio. Загрузите её или укажите точный API Identifier в настройках сервера.`,
      );
    response = await fetch(`${config.base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify({
        model,
        messages,
        stream,
        temperature: agent ? 0.25 : 0.75,
        max_tokens: agent ? 1400 : 700,
      }),
      signal: AbortSignal.timeout(300000),
    });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      503,
      e instanceof Error && e.name === 'TimeoutError'
        ? 'LM Studio не успел ответить. Попробуйте более короткий запрос.'
        : 'Не удалось связаться с LM Studio. Проверьте, что сервер запущен на порту 1234.',
    );
  }
  if (!response.ok) {
    throw new ApiError(
      503,
      `LM Studio не смог запустить модель ${model}. Проверьте её API Identifier и загрузку.`,
    );
  }
  return response;
}
export async function completion(
  messages: { role: string; content: string }[],
  agent = true,
) {
  const response = await lm(messages, agent);
  const result = (await response.json()) as {
    choices?: { message?: { content?: string }; finish_reason?: string }[];
  };
  if (result.choices?.[0]?.finish_reason === 'length')
    throw new ApiError(
      502,
      'Ответ модели достиг лимита длины. Сузьте задачу и повторите: неполное ТЗ не сохранено.',
    );
  const content = result.choices?.[0]?.message?.content?.trim();
  if (!content)
    throw new ApiError(502, 'Модель вернула пустой ответ. Повторите запрос.');
  return content;
}
export async function encrypt(text: string) {
  const secret = bindings().TOKEN_ENCRYPTION_KEY;
  if (!secret || secret.length < 32)
    throw new ApiError(503, 'Не настроено защищённое хранение токенов.');
  const key = await crypto.subtle.importKey(
    'raw',
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret)),
    'AES-GCM',
    false,
    ['encrypt'],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const value = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(text),
    ),
  );
  return btoa(String.fromCharCode(...iv, ...value));
}
export async function decrypt(text: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(bindings().TOKEN_ENCRYPTION_KEY!),
    ),
    'AES-GCM',
    false,
    ['decrypt'],
  );
  const bytes = Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(
    await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: bytes.slice(0, 12) },
      key,
      bytes.slice(12),
    ),
  );
}
