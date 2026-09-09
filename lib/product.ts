export const DEFAULT_PROMPT =
  'Ты NEXO, дружелюбный участник Discord-сообщества. Отвечай на русском, коротко и по делу. Помни контекст, иногда уместно шути. Не выдавай себя за человека. Не утверждай, что проверил логи, интернет или выполнил действие, если у тебя нет соответствующего инструмента.';
export const PRICING = {
  subscription: 20,
  monthlyCredit: 20,
  revisions: 5,
  tiers: { simple: 20, integration: 40, search: 40, complex: 100 },
} as const;
export type Tier = keyof typeof PRICING.tiers;
export function priceFor(tier: Tier, credit = 0) {
  const price = PRICING.tiers[tier];
  if (!Number.isFinite(price)) throw new Error('Неизвестная категория');
  const applied = Math.min(price, Math.max(0, credit), PRICING.monthlyCredit);
  return { price, credit: applied, total: price - applied };
}
export const STATUS: Record<string, string> = {
  draft: 'Требования собираются',
  awaiting_payment: 'Ожидает оплаты',
  queued: 'Задача сформирована',
  planning: 'Подготовка ТЗ',
  specification_ready: 'ТЗ готово',
  development: 'В разработке',
  testing: 'Тестирование',
  review: 'Готово к проверке',
  revision_requested: 'Запрошены изменения',
  revising: 'Исправляется',
  complete: 'Завершено',
  escalated: 'Передано специалисту',
  failed: 'Нужна повторная попытка',
};
export const defaultSettings = {
  name: 'NEXO',
  prompt: DEFAULT_PROMPT,
  promptHistory: [] as { text: string; date: string }[],
  moderation: false,
  categories: ['spam', 'scam', 'suspicious_links'],
  sensitivity: 'balanced',
  alertChannel: '',
  customRules: '',
  allowedChannels: '',
  adminRoles: '',
  notifications: { email: true, featureUpdates: true, credits: true },
};
export type BotSettings = typeof defaultSettings;
export type Proposal = {
  name: string;
  description: string;
  scope: string[];
  tier: Tier;
  days: string;
  price: number;
  credit: number;
  total: number;
};
export type Feature = {
  id: string;
  name: string;
  description: string;
  status: string;
  price: number;
  credit: number;
  specification: string;
  proposal: Proposal;
  revisions: number;
  createdAt: string;
  updatedAt: string;
  error: string | null;
};
export type ChatMessage = { role: 'user' | 'assistant'; content: string };
