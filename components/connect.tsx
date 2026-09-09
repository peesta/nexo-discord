'use client';
import { useEffect, useState } from 'react';
import {
  MessageCircle,
  ArrowRight,
  Check,
  Shield,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import { api } from './chat';
export function Connect() {
  const [data, setData] = useState<any>(null),
    [guilds, setGuilds] = useState<any[]>([]),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    api('workspace')
      .then(async (w) => {
        setData(w);
        if (w.discord) {
          const result = await api('discord/guilds');
          setGuilds(result.guilds);
        }
      })
      .catch((e) => setError(e.message));
    if (new URLSearchParams(location.search).get('error'))
      setError(
        'Подключение Discord не завершено. Проверьте настройку приложения и повторите вход.',
      );
  }, []);
  async function select(id: string) {
    setBusy(true);
    setError('');
    try {
      const r = await api('discord/select', { guildId: id });
      location.assign(r.url);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <main className="wrap connect-page">
      <div className="connect-copy">
        <div className="eyebrow">ПЕРВЫЙ ШАГ К СВОЕМУ БОТУ</div>
        <h1>
          Место для NEXO
          <br />
          уже найдётся.
        </h1>
        <p>
          Подключите Discord и выберите сервер.
          <br />
          Дальше настроим всё под ваше сообщество.
        </p>
        <ol className="connect-steps">
          <li className="done">
            <span>{data?.discord ? <Check size={17} /> : '01'}</span>
            <div>
              Войдите через Discord
              <small>Только профиль и список серверов</small>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              Выберите свой сервер<small>Нужны права управления сервером</small>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              Познакомьте NEXO с сообществом
              <small>Добавьте бота и задайте ему характер</small>
            </div>
          </li>
        </ol>
      </div>
      <div className="panel connect-panel">
        <span className="connect-logo">
          <Zap size={38} />
        </span>
        <h2>{data?.discord ? 'Выберите сервер' : 'Начнём с Discord'}</h2>
        <p>
          {data?.discord
            ? `Вы вошли как ${data.discord.username}`
            : 'Ваш аккаунт. Ваши серверы. Один новый участник.'}
        </p>
        {error && (
          <div className="inline-error" role="alert">
            {error}
          </div>
        )}
        {data?.discord ? (
          <div className="guild-list">
            {guilds.length ? (
              guilds.map((g) => (
                <button disabled={busy} key={g.id} onClick={() => select(g.id)}>
                  <span className="avatar purple">{g.name.slice(0, 1)}</span>
                  {g.name}
                  <ArrowUpRight size={18} />
                </button>
              ))
            ) : (
              <p>
                Нет доступных серверов с правом Manage Server или Administrator.
              </p>
            )}
          </div>
        ) : (
          <>
            <a
              className={`button primary ${data && !data.integrations.discord ? 'disabled-link' : ''}`}
              aria-disabled={!data?.integrations.discord}
              href={
                data?.integrations.discord ? '/api/discord/start' : undefined
              }
            >
              <MessageCircle size={19} />
              Войти через Discord
              <ArrowRight size={18} />
            </a>
            {data && !data.integrations.discord && (
              <div className="setup-notice">
                Подключение Discord ещё настраивается. Уже можно открыть кабинет
                и попробовать локальный AI-чат.
              </div>
            )}
          </>
        )}
        <a href="/dashboard" className="text-link">
          Открыть кабинет <ArrowRight size={16} />
        </a>
        <div className="connect-security">
          <Shield size={16} /> Бот не запрашивает право администратора.
        </div>
      </div>
    </main>
  );
}
