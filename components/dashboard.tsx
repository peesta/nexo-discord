'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Zap,
  LayoutDashboard,
  Bot,
  MessageCircle,
  Plus,
  Sparkles,
  Layers,
  Shield,
  SlidersHorizontal,
  CreditCard,
  Settings,
  Bell,
  Check,
  RefreshCw,
  ChevronRight,
  Search,
  Download,
  Clock,
  FileText,
  AlertCircle,
  ExternalLink,
  Unplug,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Empty as EmptyPrimitive } from '@/components/ui/empty';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Chat, api } from './chat';
import { WorkspaceTools } from './webmcp';
import { Brand } from '@/app/page';
import {
  DEFAULT_PROMPT,
  STATUS,
  defaultSettings,
  type Feature,
  type Proposal,
  type ChatMessage,
  type BotSettings,
} from '@/lib/product';
const navItems = [
  ['overview', 'Обзор', LayoutDashboard],
  ['my-bot', 'Мой бот', Bot],
  ['playground', 'Песочница', MessageCircle],
  ['add-feature', 'Добавить функцию', Plus],
  ['features', 'Мои функции', Layers],
  ['moderation', 'Модерация', Shield],
  ['personality', 'Характер', Sparkles],
  ['billing', 'Подписка и оплата', CreditCard],
  ['settings', 'Настройки', Settings],
] as const;
type Workspace = {
  settings: BotSettings;
  discord: { id: string; username: string } | null;
  guild: { id: string; name: string } | null;
  plan: string;
  credit: number;
  renewDate: string | null;
  features: Feature[];
  notifications: {
    id: string;
    title: string;
    link: string;
    read: number;
    created_at: string;
  }[];
  integrations: { discord: boolean; billing: boolean; bot: boolean };
  local: boolean;
};
function date(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';
}
function Badge({ status }: { status: string }) {
  return (
    <span className={`status-badge status-${status}`}>
      <span />
      {STATUS[status] || status}
    </span>
  );
}
function Notice({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={error ? 'inline-error' : 'info-notice'}
      role={error ? 'alert' : 'status'}
    >
      <AlertCircle size={17} />
      <span>{children}</span>
    </div>
  );
}
function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <EmptyPrimitive className="empty-state">
      <Layers size={34} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </EmptyPrimitive>
  );
}
export function Dashboard({ view }: { view: string[] }) {
  const section = view[0] || 'overview';
  const [data, setData] = useState<Workspace | null>(null),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [notifications, setNotifications] = useState(false);
  const refresh = useCallback(async () => {
    try {
      setData(await api('workspace'));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  async function save(values: Partial<BotSettings>) {
    const result = await api('settings', values);
    await refresh();
    setNotice('Настройки сохранены');
    return result;
  }
  function feedback(text: string) {
    setNotice(text);
  }
  const title = navItems.find((n) => n[0] === section)?.[1] || 'Функция';
  return (
    <SidebarProvider className="dashboard-shell">
      <WorkspaceTools refresh={refresh} />
      <Sidebar className="dashboard-sidebar">
        <SidebarHeader className="sidebar-brand">
          <Brand />
        </SidebarHeader>
        <SidebarContent>
          <div className="server-picker">
            <span className="avatar bot">
              <Bot size={20} />
            </span>
            <div>
              <b>{data?.guild?.name || 'Ваше сообщество'}</b>
              <small>
                {data?.guild ? 'Discord-сервер' : 'Сервер не подключён'}
              </small>
            </div>
            <a href="/connect" aria-label="Выбрать сервер">
              <ChevronRight size={17} />
            </a>
          </div>
          <div className="sidebar-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>
          <SidebarMenu className="sidebar-links">
            {navItems.map(([id, label, Icon]) => (
              <SidebarMenuItem key={id}>
                <SidebarMenuButton
                  isActive={section === id}
                  render={
                    <a
                      href={
                        id === 'overview' ? '/dashboard' : `/dashboard/${id}`
                      }
                    />
                  }
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  {id === 'add-feature' && <span className="new-dot" />}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="sidebar-credit">
            <Sparkles size={19} />
            <h3>Идеям нужно место.</h3>
            <p>
              $20 на новую функцию
              <br />
              каждый месяц с Pro.
            </p>
            <a href="/dashboard/billing">
              Узнать о Pro <ArrowUpRight size={15} />
            </a>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="sidebar-user">
            <span className="avatar purple small">
              {(data?.discord?.username || 'Вы').slice(0, 1)}
            </span>
            <div>
              <b>{data?.discord?.username || 'Локальный кабинет'}</b>
              <small>{data?.plan === 'pro' ? 'NEXO Pro' : 'Тариф Basic'}</small>
            </div>
            <span className="tiny-badge">
              {data?.plan === 'pro' ? 'PRO' : 'BASIC'}
            </span>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="dashboard-main">
        <header className="dashboard-top">
          <div>
            <SidebarTrigger />
            <span>NEXO</span>
            <ChevronRight size={14} />
            <b>{title}</b>
          </div>
          <div>
            <a href="/" className="back-site">
              На сайт <ArrowUpRight size={14} />
            </a>
            <button
              aria-label="Уведомления"
              className="icon-button notification-button"
              onClick={() => setNotifications(true)}
            >
              <Bell size={19} />
              {!!data?.notifications.some((n) => !n.read) && <i />}
            </button>
          </div>
        </header>
        <main className="dashboard-content">
          {error && (
            <Notice error>
              {error}{' '}
              <button onClick={refresh} className="text-link">
                Повторить
              </button>
            </Notice>
          )}
          {notice && (
            <div className="save-notice" role="status">
              <Check size={17} />
              {notice}
              <button
                className="icon-button"
                aria-label="Закрыть уведомление"
                onClick={() => setNotice('')}
              >
                ×
              </button>
            </div>
          )}
          {!data && !error ? (
            <div className="loading-state">
              <RefreshCw className="spin" /> Открываем кабинет…
            </div>
          ) : data ? (
            <>
              {section === 'overview' ? (
                <Overview data={data} />
              ) : section === 'my-bot' ? (
                <MyBot data={data} refresh={refresh} feedback={feedback} />
              ) : section === 'playground' ? (
                <>
                  <PageTitle
                    eyebrow="ПРОВЕРЬТЕ В ДЕЛЕ"
                    title="Поговорите с NEXO"
                    text="Ваш сохранённый характер, настоящий разговор."
                  />
                  <Chat mode="personality" prompt={data.settings.prompt} />
                </>
              ) : section === 'add-feature' ? (
                <AddFeature />
              ) : section === 'features' ? (
                view[1] ? (
                  <FeatureDetail id={view[1]} refresh={refresh} />
                ) : (
                  <FeatureList data={data} />
                )
              ) : section === 'personality' ? (
                <Personality data={data} save={save} />
              ) : section === 'moderation' ? (
                <Moderation data={data} save={save} />
              ) : section === 'billing' ? (
                <Billing data={data} />
              ) : section === 'settings' ? (
                <SettingsPage data={data} save={save} />
              ) : (
                <Empty
                  title="Раздел не найден"
                  description="Выберите нужный раздел в меню."
                />
              )}
            </>
          ) : null}
        </main>
      </div>
      <Dialog open={notifications} onOpenChange={setNotifications}>
        <DialogContent className="nexo-dialog">
          <DialogTitle>Уведомления</DialogTitle>
          <DialogDescription>
            Результаты работы и важные обновления.
          </DialogDescription>
          <div className="notification-list">
            {data?.notifications.length ? (
              data.notifications.map((n) => (
                <a key={n.id} href={n.link}>
                  <span className={n.read ? 'offline-dot' : 'live-dot'} />
                  <div>
                    {n.title}
                    <small>{date(n.created_at)}</small>
                  </div>
                  <ArrowUpRight size={15} />
                </a>
              ))
            ) : (
              <p>
                Пока ничего нового. Здесь появятся уведомления о ваших задачах.
              </p>
            )}
          </div>
          <button
            className="button secondary"
            onClick={async () => {
              try {
                await api('notifications/read', {});
                await refresh();
                setNotifications(false);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Отметить прочитанными
          </button>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
function PageTitle({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action}
    </div>
  );
}
function Overview({ data }: { data: Workspace }) {
  return (
    <>
      <PageTitle
        eyebrow="ВАШЕ ПРОСТРАНСТВО"
        title="Всё начинается с разговора."
        text="Характер, способности и жизнь вашего бота — в одном месте."
        action={
          <a href="/dashboard/add-feature" className="button primary">
            <Plus size={18} />
            Новая функция
          </a>
        }
      />
      <div className="overview-hero">
        <div className="large-bot">
          <Zap size={49} />
        </div>
        <div>
          <span className="eyebrow">ВАШ AI-УЧАСТНИК</span>
          <h2>{data.settings.name}</h2>
          <p>{data.guild?.name || 'Готов знакомиться с вашим сервером'}</p>
        </div>
        <div className="bot-connection">
          <span className="status-badge">
            <span />
            {data.guild
              ? 'Ожидает подключения API бота'
              : 'Discord не подключён'}
          </span>
          <a
            className="button secondary"
            href={data.guild ? '/dashboard/my-bot' : '/connect'}
          >
            {data.guild ? 'Открыть бота' : 'Подключить Discord'}
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      <div className="stat-grid">
        {[
          [MessageCircle, 'Сообщений за месяц', '—', 'После подключения бота'],
          [Zap, 'AI-диалогов', '—', 'После подключения бота'],
          [Shield, 'Событий модерации', '—', 'После подключения бота'],
          [
            Layers,
            'Ваших функций',
            String(data.features.length),
            'Идей, которые становятся задачами',
          ],
        ].map(([Icon, label, value, hint], i) => {
          const I = Icon as typeof Zap;
          return (
            <div className="stat-card" key={i}>
              <div>
                <span>{label as string}</span>
                <I size={17} />
              </div>
              <strong>{value as string}</strong>
              <small>{hint as string}</small>
            </div>
          );
        })}
      </div>
      <div className="overview-grid">
        <section className="panel">
          <div className="panel-heading">
            <h3>Последние функции</h3>
            <a href="/dashboard/features">
              Все функции <ArrowUpRight size={15} />
            </a>
          </div>
          {data.features.length ? (
            <div className="compact-features">
              {data.features.slice(0, 4).map((f) => (
                <a key={f.id} href={`/dashboard/features/${f.id}`}>
                  <span className="feature-icon">
                    <Sparkles size={18} />
                  </span>
                  <div>
                    <b>{f.name}</b>
                    <small>{date(f.createdAt)}</small>
                  </div>
                  <Badge status={f.status} />
                  <ChevronRight size={16} />
                </a>
              ))}
            </div>
          ) : (
            <Empty
              title="Следующая способность — ваша идея"
              description="Опишите, чего не хватает сообществу. AI поможет разобраться в деталях."
              action={
                <a href="/dashboard/add-feature" className="text-link">
                  Придумать функцию <ArrowRight size={16} />
                </a>
              }
            />
          )}
        </section>
        <section className="panel credit-panel">
          <div className="panel-heading">
            <h3>Кредит на разработку</h3>
            <Sparkles size={19} />
          </div>
          <div className="credit-number">
            ${data.credit}
            <span>доступно</span>
          </div>
          <p>
            {data.plan === 'pro'
              ? 'Кредит действует на одну новую функцию в текущем месяце.'
              : 'Pro даёт $20 на одну новую функцию каждый месяц.'}
          </p>
          <div className="credit-divider" />
          <div className="credit-line">
            <span>Ваш тариф</span>
            <b>{data.plan === 'pro' ? 'NEXO Pro' : 'Basic'}</b>
          </div>
          <div className="credit-line">
            <span>Следующее обновление</span>
            <b>{date(data.renewDate)}</b>
          </div>
          <a href="/dashboard/billing" className="button secondary">
            {data.plan === 'pro' ? 'Управлять подпиской' : 'Открыть NEXO Pro'}
            <ArrowUpRight size={16} />
          </a>
        </section>
      </div>
      <div className="quick-links">
        <a href="/dashboard/personality">
          <Sparkles />
          <div>
            <h3>Пусть будет собой</h3>
            <p>Настройте характер и проверьте его в чате</p>
          </div>
          <ArrowUpRight />
        </a>
        <a href="/dashboard/moderation">
          <Shield />
          <div>
            <h3>Забота о сообществе</h3>
            <p>Настройте правила и уведомления модерации</p>
          </div>
          <ArrowUpRight />
        </a>
      </div>
    </>
  );
}
function MyBot({
  data,
  refresh,
  feedback,
}: {
  data: Workspace;
  refresh: () => Promise<void>;
  feedback: (s: string) => void;
}) {
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [disconnect, setDisconnect] = useState(false);
  async function sync() {
    setBusy(true);
    try {
      await api('settings/sync', {});
      feedback('Бот подтвердил применение настроек');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="УЧАСТНИК КОМАНДЫ"
        title="Мой бот"
        text="Его профиль и подключённые способности."
      />
      {error && <Notice error>{error}</Notice>}
      <div className="panel bot-profile">
        <span className="large-bot">
          <Zap size={48} />
        </span>
        <h2>{data.settings.name}</h2>
        <p>{data.guild?.name || 'Discord-сервер пока не выбран'}</p>
        <span className="status-badge">
          <span />
          {data.integrations.bot
            ? 'API настроен · статус не получен'
            : 'Нет связи с ботом'}
        </span>
        <div className="button-row">
          <a className="button secondary" href="/dashboard/settings">
            <Settings size={16} />
            Настройки
          </a>
          {data.guild ? (
            <a
              className="button secondary"
              href={`https://discord.com/channels/${data.guild.id}`}
              target="_blank"
              rel="noreferrer"
            >
              Открыть Discord <ExternalLink size={16} />
            </a>
          ) : (
            <a className="button primary" href="/connect">
              Выбрать сервер <ArrowUpRight size={16} />
            </a>
          )}
          <button disabled={busy} className="button secondary" onClick={sync}>
            <RefreshCw size={16} className={busy ? 'spin' : ''} />
            Синхронизировать
          </button>
        </div>
      </div>
      <section className="panel mt-panel">
        <h3>Подключённые функции</h3>
        <Empty
          title="Список появится после подключения"
          description="Сайт получит активные функции и статистику из API вашего бота."
        />
      </section>
      {data.discord && (
        <button className="danger-link" onClick={() => setDisconnect(true)}>
          <Unplug size={16} />
          Отключить Discord от кабинета
        </button>
      )}
      <AlertDialog open={disconnect} onOpenChange={setDisconnect}>
        <AlertDialogContent className="nexo-dialog">
          <AlertDialogTitle>Отключить Discord?</AlertDialogTitle>
          <AlertDialogDescription>
            Настройки и ТЗ сохранятся. Бот останется участником Discord-сервера;
            удалить его можно в Discord.
          </AlertDialogDescription>
          <div className="button-row">
            <button
              className="button secondary"
              onClick={() => setDisconnect(false)}
            >
              Отмена
            </button>
            <button
              className="button danger"
              onClick={async () => {
                try {
                  const r = await api('discord/disconnect', {});
                  await refresh();
                  setDisconnect(false);
                  feedback(r.message);
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Отключить
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
function AddFeature() {
  const [messages, setMessages] = useState<ChatMessage[]>([]),
    [result, setResult] = useState<{
      proposal: Proposal;
      feature: Feature;
    } | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function estimate() {
    setBusy(true);
    setError('');
    try {
      setResult(await api('features/estimate', { messages }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="БЕЗ ПОТОЛКА ВОЗМОЖНОСТЕЙ"
        title="Чему научим вашего бота?"
        text="Начните с идеи. Мы разберёмся в деталях вместе."
      />
      <div className="add-feature-layout">
        <div>
          <Chat mode="feature" onMessages={setMessages} />
          {error && <Notice error>{error}</Notice>}
        </div>
        <aside className="panel proposal-panel">
          <div className="panel-heading">
            <h3>{result ? 'Предложение' : 'От идеи к способности'}</h3>
            <Sparkles size={18} />
          </div>
          {result ? (
            <>
              <span className="tiny-badge">ПРЕДВАРИТЕЛЬНАЯ ОЦЕНКА</span>
              <h2>{result.proposal.name}</h2>
              <p>{result.proposal.description}</p>
              <ul className="scope-list">
                {result.proposal.scope.map((s) => (
                  <li key={s}>
                    <Check size={15} />
                    {s}
                  </li>
                ))}
              </ul>
              <div className="estimate-line">
                <span>Разработка</span>
                <b>{result.proposal.days}</b>
              </div>
              <div className="estimate-line">
                <span>Стоимость</span>
                <b>${result.proposal.price}</b>
              </div>
              <div className="estimate-line">
                <span>Кредит подписки</span>
                <b className="lime-text">−${result.proposal.credit}</b>
              </div>
              <div className="estimate-total">
                <span>Итого</span>
                <b>${result.proposal.total}</b>
              </div>
              <a
                className="button primary"
                href={`/dashboard/features/${result.feature.id}`}
              >
                Открыть заявку <ArrowRight size={17} />
              </a>
              <p className="small-note">
                Оценка сохранена. Сейчас доступна бесплатная подготовка ТЗ;
                оплата и реализация ожидают подключения агента.
              </p>
            </>
          ) : (
            <>
              <div className="proposal-empty-icon">
                <FileText size={30} />
              </div>
              <h3>Хорошая функция начинается с ясной задачи.</h3>
              <p>
                Расскажите, что должен делать бот, где и для кого. После
                уточнений запросите оценку.
              </p>
              <ol className="simple-steps">
                <li>
                  <span>01</span>Опишите идею
                </li>
                <li>
                  <span>02</span>Уточните детали
                </li>
                <li>
                  <span>03</span>Получите оценку
                </li>
              </ol>
            </>
          )}
          <button
            disabled={
              busy || messages.filter((m) => m.role === 'user').length === 0
            }
            className={`button ${result ? 'secondary' : 'primary'}`}
            onClick={estimate}
          >
            {busy ? (
              <>
                <RefreshCw className="spin" size={16} />
                AI готовит оценку…
              </>
            ) : result ? (
              'Пересчитать оценку'
            ) : (
              'Оценить функцию'
            )}
            {!busy && <ArrowRight size={17} />}
          </button>
        </aside>
      </div>
    </>
  );
}
function FeatureList({ data }: { data: Workspace }) {
  const [filter, setFilter] = useState('all'),
    [query, setQuery] = useState('');
  const list = data.features.filter(
    (f) =>
      (filter === 'all' ||
        (filter === 'draft'
          ? ['draft', 'failed'].includes(f.status)
          : filter === 'ready'
            ? f.status === 'specification_ready'
            : [
                'queued',
                'planning',
                'revising',
                'development',
                'testing',
              ].includes(f.status))) &&
      `${f.name} ${f.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        eyebrow="ВАШ БОТ РАСТЁТ"
        title="Мои функции"
        text="От первой идеи до результата — вся история здесь."
        action={
          <a className="button primary" href="/dashboard/add-feature">
            <Plus size={18} />
            Новая функция
          </a>
        }
      />
      <div className="feature-toolbar">
        <Tabs value={filter} onValueChange={(v) => setFilter(String(v))}>
          <TabsList>
            <TabsTrigger value="all">Все · {data.features.length}</TabsTrigger>
            <TabsTrigger value="draft">Идеи</TabsTrigger>
            <TabsTrigger value="work">В работе</TabsTrigger>
            <TabsTrigger value="ready">ТЗ готовы</TabsTrigger>
          </TabsList>
        </Tabs>
        <label className="search-field">
          <Search size={16} />
          <input
            aria-label="Поиск функций"
            placeholder="Найти функцию"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      {list.length ? (
        <div className="feature-list-grid">
          {list.map((f) => (
            <a
              key={f.id}
              className="panel feature-list-card"
              href={`/dashboard/features/${f.id}`}
            >
              <div>
                <span className="feature-icon">
                  <Sparkles size={21} />
                </span>
                <ArrowUpRight size={18} />
              </div>
              <h3>{f.name}</h3>
              <p>{f.description}</p>
              <Badge status={f.status} />
              <footer>
                <span>{date(f.createdAt)}</span>
                <b>${f.price}</b>
              </footer>
            </a>
          ))}
        </div>
      ) : (
        <section className="panel">
          <Empty
            title={
              query
                ? 'Ничего не нашлось'
                : data.features.length
                  ? 'Здесь пока нет задач'
                  : 'Первая функция ждёт вашу идею'
            }
            description={
              query
                ? 'Попробуйте другое название.'
                : 'Опишите желаемую возможность в чате, получите оценку и сохраните заявку.'
            }
            action={
              <a href="/dashboard/add-feature" className="button primary">
                <Plus size={17} />
                Добавить функцию
              </a>
            }
          />
        </section>
      )}
    </>
  );
}
function FeatureDetail({
  id,
  refresh,
}: {
  id: string;
  refresh: () => Promise<void>;
}) {
  const [data, setData] = useState<{ feature: Feature; history: any[] } | null>(
      null,
    ),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [revision, setRevision] = useState(false),
    [comment, setComment] = useState('');
  const reload = useCallback(async () => {
    try {
      setData(await api(`features/${id}`));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id]);
  useEffect(() => {
    reload();
  }, [reload]);
  useEffect(() => {
    if (!data || !['planning', 'revising'].includes(data.feature.status))
      return;
    const timer = setInterval(reload, 4000);
    return () => clearInterval(timer);
  }, [data?.feature.status, reload]);
  async function run(revise = false) {
    setBusy(true);
    setError('');
    setRevision(false);
    setData((d) =>
      d
        ? {
            ...d,
            feature: { ...d.feature, status: revise ? 'revising' : 'planning' },
          }
        : d,
    );
    try {
      await api(
        `features/${id}/${revise ? 'revise' : 'generate'}`,
        revise ? { message: comment } : {},
      );
      setComment('');
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      await reload();
      setBusy(false);
    }
  }
  if (!data)
    return (
      <>
        {error ? (
          <Notice error>{error}</Notice>
        ) : (
          <div className="loading-state">Открываем заявку…</div>
        )}
      </>
    );
  const f = data.feature;
  function download() {
    const blob = new Blob([`# ${f.name}\n\n${f.specification}`], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexo-spec-${f.id.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <a className="back-link" href="/dashboard/features">
        ← Все функции
      </a>
      <PageTitle
        eyebrow={`ЗАЯВКА / ${f.id.slice(0, 8).toUpperCase()}`}
        title={f.name}
        text={f.description}
        action={<Badge status={f.status} />}
      />
      {error && <Notice error>{error}</Notice>}
      <div className="detail-grid">
        <section className="panel specification-panel">
          <div className="panel-heading">
            <h3>Техническое задание</h3>
            {f.specification && (
              <button
                className="icon-button"
                onClick={download}
                aria-label="Скачать ТЗ"
              >
                <Download size={18} />
              </button>
            )}
          </div>
          {f.specification ? (
            <div className="specification-text">{f.specification}</div>
          ) : (
            <Empty
              title={
                busy
                  ? 'Qwen готовит техническое задание…'
                  : 'Давайте превратим идею в план'
              }
              description={
                busy
                  ? 'Локальной модели может понадобиться несколько минут.'
                  : 'Модель опишет архитектуру, сценарии, ограничения и критерии готовности. Код пока не выполняется.'
              }
              action={
                !busy && ['draft', 'failed'].includes(f.status) ? (
                  <button className="button primary" onClick={() => run()}>
                    <Sparkles size={17} />
                    Подготовить ТЗ бесплатно
                  </button>
                ) : undefined
              }
            />
          )}
        </section>
        <aside>
          <section className="panel detail-summary">
            <h3>Детали задачи</h3>
            <div className="estimate-line">
              <span>Оценка</span>
              <b>${f.price}</b>
            </div>
            <div className="estimate-line">
              <span>Срок реализации</span>
              <b>{f.proposal.days}</b>
            </div>
            <div className="estimate-line">
              <span>Создано</span>
              <b>{date(f.createdAt)}</b>
            </div>
            <div className="revision-counter">
              <RefreshCw size={17} />
              <span>
                Бесплатные правки ТЗ<b>{5 - f.revisions} из 5 осталось</b>
              </span>
            </div>
            <ul className="scope-list">
              {f.proposal.scope.map((s) => (
                <li key={s}>
                  <Check size={15} />
                  {s}
                </li>
              ))}
            </ul>
            {f.status === 'specification_ready' && (
              <button
                className="button secondary"
                onClick={() => setRevision(true)}
                disabled={busy}
              >
                {f.revisions >= 5 ? 'Нужен специалист' : 'Нужны изменения'}
              </button>
            )}
            {['planning', 'revising'].includes(f.status) && (
              <p className="progress-note">
                <RefreshCw size={16} className="spin" />
                Модель работает над ТЗ…
              </p>
            )}
          </section>
          <Notice>
            Сейчас агент готовит ТЗ. Реализация, тестирование и развёртывание
            подключаются отдельно — функция ещё не установлена в Discord.
          </Notice>
        </aside>
      </div>
      {data.history.length > 0 && (
        <section className="panel mt-panel">
          <h3>История правок</h3>
          {data.history.map((h) => (
            <details className="revision-history" key={h.number}>
              <summary>
                Итерация {h.number} · {date(h.created_at)}
                <ChevronRight size={16} />
              </summary>
              <p>{h.message}</p>
              <pre>{h.result}</pre>
            </details>
          ))}
        </section>
      )}
      <Dialog open={revision} onOpenChange={setRevision}>
        <DialogContent className="nexo-dialog">
          <DialogTitle>
            {f.revisions >= 5
              ? 'Запросить проверку специалиста'
              : 'Что нужно изменить?'}
          </DialogTitle>
          <DialogDescription>
            {f.revisions >= 5
              ? 'Бесплатные итерации использованы. Заявка получит статус «Передано специалисту». Канал связи со специалистом пока не подключён.'
              : `Опишите правку в рамках согласованной задачи. Осталось ${5 - f.revisions} из 5 итераций.`}
          </DialogDescription>
          <textarea
            className="field"
            aria-label="Описание правки"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            maxLength={3000}
            placeholder="Например: добавь список разрешённых источников…"
          />
          <button
            className="button primary"
            disabled={!comment.trim() || busy}
            onClick={() => run(true)}
          >
            {f.revisions >= 5 ? 'Зафиксировать запрос' : 'Отправить правку'}
            <ArrowRight size={16} />
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
function Personality({
  data,
  save,
}: {
  data: Workspace;
  save: (s: Partial<BotSettings>) => Promise<any>;
}) {
  const [prompt, setPrompt] = useState(data.settings.prompt),
    [testPrompt, setTestPrompt] = useState(prompt),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [generator, setGenerator] = useState(false),
    [description, setDescription] = useState('');
  const presets = [
    [
      'Свой человек',
      'Ты NEXO, дружелюбный участник сообщества. Отвечай по-русски, коротко, с уместными шутками. Поддерживай новичков. Честно говори, что ты AI.',
    ],
    [
      'Спокойный эксперт',
      'Ты NEXO, спокойный эксперт. Давай точные, структурированные ответы на русском. Объясняй сложное простыми словами, признавай неопределённость. Не выдумывай факты.',
    ],
    [
      'С иронией',
      'Ты NEXO, участник игрового сообщества с лёгкой иронией. Шути дружелюбно, не оскорбляй людей. Помни контекст и честно называй себя AI.',
    ],
  ];
  return (
    <>
      <PageTitle
        eyebrow="ОДИН БОТ. ТЫСЯЧА ХАРАКТЕРОВ."
        title="Пусть будет собой."
        text="Задайте тон общения и проверьте его до сохранения."
      />
      {error && <Notice error>{error}</Notice>}
      <div className="personality-layout">
        <section className="panel prompt-panel">
          <div className="panel-heading">
            <h3>Характер бота</h3>
            <Sparkles size={19} />
          </div>
          <div className="preset-list">
            {presets.map(([label, text]) => (
              <button key={label} onClick={() => setPrompt(text)}>
                {label}
              </button>
            ))}
          </div>
          <label className="field-label" htmlFor="system-prompt">
            Системный prompt
          </label>
          <textarea
            id="system-prompt"
            className="field prompt-field"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={8000}
            rows={12}
          />
          <div className="field-meta">
            <span>Как общаться, о чём помнить, чего избегать.</span>
            <span>{prompt.length} / 8000</span>
          </div>
          <button className="text-link" onClick={() => setGenerator(true)}>
            <Sparkles size={16} />
            Сформулировать с AI
          </button>
          <Notice>
            Изменение prompt влияет на ответы. Сначала проверьте характер
            справа; применение к Discord выполняется через синхронизацию бота.
          </Notice>
          <div className="button-row">
            <button
              disabled={busy || !prompt.trim()}
              className="button primary"
              onClick={async () => {
                setBusy(true);
                setError('');
                try {
                  await save({ prompt });
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? 'Сохраняем…' : 'Сохранить характер'}
              <Check size={16} />
            </button>
            <button
              className="button secondary"
              onClick={() => setPrompt(DEFAULT_PROMPT)}
            >
              Сбросить
            </button>
          </div>
          {data.settings.promptHistory.length > 0 && (
            <details className="prompt-history">
              <summary>
                История версий · {data.settings.promptHistory.length}
              </summary>
              {data.settings.promptHistory.map((h, i) => (
                <div key={i}>
                  <span>{date(h.date)}</span>
                  <p>{h.text}</p>
                  <button
                    className="text-link"
                    onClick={() => setPrompt(h.text)}
                  >
                    Восстановить в редакторе
                  </button>
                </div>
              ))}
            </details>
          )}
        </section>
        <section>
          <div className="test-toolbar">
            <span>
              <span className="live-dot" /> Тест до применения
            </span>
            <button
              className="text-link"
              disabled={!prompt.trim()}
              onClick={() => setTestPrompt(prompt)}
            >
              Проверить этот характер <ArrowRight size={15} />
            </button>
          </div>
          <Chat key={testPrompt} mode="personality" prompt={testPrompt} />
        </section>
      </div>
      <Dialog open={generator} onOpenChange={setGenerator}>
        <DialogContent className="nexo-dialog">
          <DialogTitle>Как должен вести себя бот?</DialogTitle>
          <DialogDescription>
            Опишите его роль, манеру и пару важных правил.
          </DialogDescription>
          <textarea
            aria-label="Описание характера"
            className="field"
            rows={5}
            maxLength={2000}
            placeholder="Как опытный администратор игрового сообщества. Спокойно, иногда шутит."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            disabled={busy || !description.trim()}
            className="button primary"
            onClick={async () => {
              setBusy(true);
              try {
                const r = await api('personality/generate', { description });
                setPrompt(r.prompt);
                setGenerator(false);
              } catch (e) {
                setError((e as Error).message);
                setGenerator(false);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'AI подбирает слова…' : 'Создать характер'}
            <Sparkles size={16} />
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
function Moderation({
  data,
  save,
}: {
  data: Workspace;
  save: (s: Partial<BotSettings>) => Promise<any>;
}) {
  const [settings, setSettings] = useState(data.settings),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const categories = [
    ['spam', 'Спам', 'Повторяющиеся сообщения и навязчивая реклама'],
    ['scam', 'Мошенничество', 'Подозрительные предложения и фишинг'],
    ['insults', 'Оскорбления', 'Агрессия и нападки на участников'],
    ['hate', 'Язык вражды', 'Дискриминация и разжигание ненависти'],
    ['nsfw', 'Контент 18+', 'Неприемлемые материалы'],
    ['suspicious_links', 'Подозрительные ссылки', 'Потенциально опасные сайты'],
  ];
  return (
    <>
      <PageTitle
        eyebrow="ЗАБОТА О СООБЩЕСТВЕ"
        title="Порядок без перегибов."
        text="AI замечает нарушения. Решения принимаете вы."
      />
      {error && <Notice error>{error}</Notice>}
      <div className="moderation-layout">
        <section className="panel">
          <div className="toggle-row">
            <div>
              <h3>AI-модерация</h3>
              <p>Анализ сообщений и уведомления администраторам</p>
            </div>
            <Switch
              aria-label="AI-модерация"
              checked={settings.moderation}
              onCheckedChange={(v) =>
                setSettings({ ...settings, moderation: v })
              }
            />
          </div>
          <div className="settings-divider" />
          <h3>На что обращать внимание</h3>
          <div className="category-list">
            {categories.map(([id, label, text]) => (
              <label key={id} className="toggle-row">
                <div>
                  <b>{label}</b>
                  <small>{text}</small>
                </div>
                <Switch
                  aria-label={label}
                  checked={settings.categories.includes(id)}
                  onCheckedChange={(v) =>
                    setSettings({
                      ...settings,
                      categories: v
                        ? [...settings.categories, id]
                        : settings.categories.filter((c) => c !== id),
                    })
                  }
                />
              </label>
            ))}
          </div>
          <label htmlFor="custom-rules" className="field-label">
            Правила вашего сервера
          </label>
          <textarea
            id="custom-rules"
            className="field"
            value={settings.customRules}
            onChange={(e) =>
              setSettings({ ...settings, customRules: e.target.value })
            }
            maxLength={4000}
            rows={4}
            placeholder="Например: не публиковать спойлеры вне специального канала."
          />
        </section>
        <aside>
          <section className="panel">
            <h3>Чувствительность</h3>
            <p className="panel-description">
              Насколько строго оценивать потенциальные нарушения.
            </p>
            <Select
              value={settings.sensitivity}
              onValueChange={(v) =>
                v && setSettings({ ...settings, sensitivity: v })
              }
            >
              <SelectTrigger className="full-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Мягко</SelectItem>
                <SelectItem value="balanced">Сбалансированно</SelectItem>
                <SelectItem value="strict">Строго</SelectItem>
              </SelectContent>
            </Select>
            <label className="field-label" htmlFor="alert-channel">
              ID канала для уведомлений
            </label>
            <input
              id="alert-channel"
              className="field"
              placeholder="ID закрытого канала администраторов"
              value={settings.alertChannel}
              onChange={(e) =>
                setSettings({ ...settings, alertChannel: e.target.value })
              }
              maxLength={30}
            />
            <Notice>
              Автоматические баны выключены. Бот передаёт сообщение, автора и
              причину — решение остаётся за модератором.
            </Notice>
            <button
              className="button primary full-width"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError('');
                try {
                  await save({
                    moderation: settings.moderation,
                    categories: settings.categories,
                    sensitivity: settings.sensitivity,
                    alertChannel: settings.alertChannel,
                    customRules: settings.customRules,
                  });
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? 'Сохраняем…' : 'Сохранить настройки'}
              <Check size={16} />
            </button>
          </section>
          <section className="panel mt-panel">
            <h3>События модерации</h3>
            <p className="panel-description">
              Журнал появится после подключения API вашего Discord-бота. Сейчас
              реальные сообщения сервера не анализируются.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
function Billing({ data }: { data: Workspace }) {
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [invoices, setInvoices] = useState<any[]>([]);
  useEffect(() => {
    api('payments/history')
      .then((r) => setInvoices(r.invoices))
      .catch((e) => setError(e.message));
  }, []);
  async function action(path: string) {
    setBusy(true);
    setError('');
    try {
      const r = await api(`payments/${path}`, {});
      location.assign(r.url);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="ПОНЯТНАЯ ПОДПИСКА"
        title="Больше возможностей. Каждый месяц."
        text="Управляйте тарифом, кредитом и платежами."
      />
      {error && <Notice error>{error}</Notice>}
      {!data.integrations.billing && (
        <Notice>
          Оплата ещё не подключена. Здесь не выполняются списания и не
          активируются платные подписки.
        </Notice>
      )}
      <div className="billing-grid">
        <section className="panel billing-plan">
          <div className="panel-heading">
            <h3>Ваш тариф</h3>
            <span className="tiny-badge">
              {data.plan === 'pro' ? 'АКТИВЕН' : 'БЕСПЛАТНО'}
            </span>
          </div>
          <h2>{data.plan === 'pro' ? 'NEXO Pro' : 'Basic'}</h2>
          <div className="price">
            ${data.plan === 'pro' ? 20 : 0}
            <span>/ месяц</span>
          </div>
          <p>
            {data.plan === 'pro'
              ? 'Всё для развития вашего AI-участника.'
              : 'Для первого знакомства и базового общения.'}
          </p>
          <div className="estimate-line">
            <span>Следующая оплата</span>
            <b>{date(data.renewDate)}</b>
          </div>
          {data.plan === 'pro' ? (
            <div className="button-row">
              <button
                disabled={busy}
                className="button secondary"
                onClick={() => action('portal')}
              >
                Управлять подпиской <ArrowUpRight size={16} />
              </button>
            </div>
          ) : (
            <button
              disabled={busy}
              className="button primary"
              onClick={() => action('subscribe')}
            >
              Перейти на Pro · $20/мес. <ArrowUpRight size={16} />
            </button>
          )}
        </section>
        <section className="panel credit-panel">
          <h3>Кредит на новую функцию</h3>
          <div className="credit-number">
            ${data.credit}
            <span>доступно</span>
          </div>
          <p>
            В Pro каждый месяц включены $20 на одну новую функцию. Более дорогая
            возможность оплачивается с учётом кредита.
          </p>
          <div className="credit-example">
            <span>Пример: интернет-поиск</span>
            <b>
              $40 − $20 = <span className="lime-text">$20</span>
            </b>
          </div>
          <small className="small-note">
            Кредит не переносится между месяцами. Для каждой функции — 5
            бесплатных правок.
          </small>
        </section>
      </div>
      <section className="panel mt-panel">
        <div className="panel-heading">
          <h3>История платежей</h3>
          {data.plan === 'pro' && (
            <button
              className="text-link"
              disabled={busy}
              onClick={() => action('portal')}
            >
              Способ оплаты и отмена <ArrowUpRight size={15} />
            </button>
          )}
        </div>
        {invoices.length ? (
          <div className="invoice-list">
            {invoices.map((i) => (
              <div key={i.id}>
                <span>{date(i.date)}</span>
                <span>{i.status === 'paid' ? 'Оплачено' : i.status}</span>
                <b>${i.amount}</b>
                {i.url && (
                  <a href={i.url} target="_blank" rel="noreferrer">
                    Квитанция <ArrowUpRight size={15} />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title="Платежей пока нет"
            description="Здесь появятся реальные списания и квитанции платёжной системы."
          />
        )}
      </section>
    </>
  );
}
function SettingsPage({
  data,
  save,
}: {
  data: Workspace;
  save: (s: Partial<BotSettings>) => Promise<any>;
}) {
  const [settings, setSettings] = useState(data.settings),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [health, setHealth] = useState<any>(null);
  async function check() {
    try {
      setHealth(await api('health'));
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    check();
  }, []);
  return (
    <>
      <PageTitle
        eyebrow="ВСЁ ПОД ВАШ КОНТРОЛЬ"
        title="Настройки пространства"
        text="Профиль бота, доступ и подключения."
      />
      {error && <Notice error>{error}</Notice>}
      <div className="settings-grid">
        <section className="panel">
          <h3>Профиль и доступ</h3>
          <label htmlFor="bot-name" className="field-label">
            Имя бота в кабинете
          </label>
          <input
            id="bot-name"
            className="field"
            value={settings.name}
            maxLength={40}
            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
          />
          <label htmlFor="channels" className="field-label">
            Разрешённые каналы
          </label>
          <textarea
            id="channels"
            className="field"
            rows={3}
            value={settings.allowedChannels}
            onChange={(e) =>
              setSettings({ ...settings, allowedChannels: e.target.value })
            }
            placeholder="ID каналов, по одному на строку"
            maxLength={4000}
          />
          <label htmlFor="roles" className="field-label">
            Роли, управляющие ботом
          </label>
          <textarea
            id="roles"
            className="field"
            rows={3}
            value={settings.adminRoles}
            onChange={(e) =>
              setSettings({ ...settings, adminRoles: e.target.value })
            }
            placeholder="ID ролей администраторов, по одному на строку"
            maxLength={4000}
          />
          <div className="settings-divider" />
          <h3>Уведомления</h3>
          {[
            ['featureUpdates', 'Готовность задач'],
            ['credits', 'Обновление кредита'],
            ['email', 'Письма на email'],
          ].map(([key, label]) => (
            <label className="toggle-row" key={key}>
              <span>{label}</span>
              <Switch
                aria-label={label}
                checked={
                  settings.notifications[
                    key as keyof typeof settings.notifications
                  ]
                }
                onCheckedChange={(v) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, [key]: v },
                  })
                }
              />
            </label>
          ))}
          <p className="small-note">
            Уведомления в кабинете работают. Email-канал ещё не подключён.
          </p>
          <button
            className="button primary"
            disabled={busy || !settings.name.trim()}
            onClick={async () => {
              setBusy(true);
              try {
                await save({
                  name: settings.name,
                  allowedChannels: settings.allowedChannels,
                  adminRoles: settings.adminRoles,
                  notifications: settings.notifications,
                });
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Сохраняем…' : 'Сохранить настройки'}
            <Check size={16} />
          </button>
        </section>
        <aside>
          <section className="panel">
            <div className="panel-heading">
              <h3>LM Studio</h3>
              <button
                className="icon-button"
                onClick={check}
                aria-label="Проверить LM Studio"
              >
                <RefreshCw size={17} />
              </button>
            </div>
            <span
              className={`status-badge ${health?.online ? 'status-complete' : ''}`}
            >
              <span />
              {health
                ? health.online
                  ? 'Сервер доступен'
                  : 'Нет соединения'
                : 'Проверяем…'}
            </span>
            <div className="integration-model">
              <span>Модель чата</span>
              <code>{health?.chatModel || 'gemma-4b-instructed'}</code>
              <small>
                {health?.chatReady
                  ? 'Доступна'
                  : 'Загрузите модель в LM Studio'}
              </small>
            </div>
            <div className="integration-model">
              <span>Модель агента</span>
              <code>{health?.agentModel || 'qwen2.5-coder-3b-instruct'}</code>
              <small>
                {health?.agentReady
                  ? 'Доступна'
                  : 'Загрузите модель в LM Studio'}
              </small>
            </div>
            {health?.models?.length > 0 && (
              <details className="model-list">
                <summary>Доступные API Identifier</summary>
                {health.models.map((m: string) => (
                  <code key={m}>{m}</code>
                ))}
              </details>
            )}
          </section>
          <section className="panel mt-panel">
            <h3>Подключения</h3>
            {[
              ['Discord OAuth', data.integrations.discord],
              ['API вашего бота', data.integrations.bot],
              ['Платёжная система', data.integrations.billing],
            ].map(([label, ready]) => (
              <div className="integration-row" key={String(label)}>
                <span>{label}</span>
                <b className={ready ? 'lime-text' : 'muted-text'}>
                  {ready ? 'Настроено' : 'Не подключено'}
                </b>
              </div>
            ))}
            <p className="small-note">
              Ключи подключений хранятся на сервере. Секреты не передаются в
              браузер.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
