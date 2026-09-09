'use client';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowUp,
  Square,
  RotateCcw,
  Hash,
  Zap,
  Sparkles,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
import type { ChatMessage } from '@/lib/product';
export async function api<T = any>(path: string, data?: unknown): Promise<T> {
  const r = await fetch(
    `/api/${path}`,
    data === undefined
      ? { cache: 'no-store' }
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
  );
  const result = (await r.json()) as any;
  if (!r.ok) throw new Error(result.error || 'Не удалось выполнить запрос');
  return result;
}
export function Chat({
  mode = 'playground',
  prompt,
  onMessages,
  initialMessage,
}: {
  mode?: 'playground' | 'feature' | 'personality';
  prompt?: string;
  onMessages?: (m: ChatMessage[]) => void;
  initialMessage?: string;
}) {
  const welcome =
    initialMessage ||
    (mode === 'feature'
      ? 'Что вы хотите добавить вашему боту? Расскажите об идее — вместе превратим её в понятную задачу.'
      : 'Привет! Я NEXO. Давай знакомиться: чем живёт твой сервер?');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: welcome },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [used, setUsed] = useState(0);
  const [health, setHealth] = useState<any>(null);
  const abort = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    api('health')
      .then(setHealth)
      .catch(() => setHealth({ online: false }));
    if (mode === 'playground')
      api('chat/quota')
        .then((q) => setUsed(q.used))
        .catch(() => {});
    return () => abort.current?.abort();
  }, [mode]);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    onMessages?.(messages);
  }, [messages, onMessages]);
  async function send(text = input) {
    if (!text.trim() || busy || text.length > 4000) return;
    const history = [
      ...messages,
      { role: 'user' as const, content: text.trim() },
    ];
    setMessages(history);
    setInput('');
    setBusy(true);
    setError('');
    const controller = new AbortController();
    abort.current = controller;
    let answer = '';
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, prompt, messages: history.slice(-30) }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const data = (await response.json()) as any;
        throw new Error(data.error);
      }
      setUsed(Number(response.headers.get('X-Messages-Used')) || used);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Ответ недоступен');
      setMessages([...history, { role: 'assistant', content: '' }]);
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const data = JSON.parse(payload);
            const chunk = data.choices?.[0]?.delta?.content;
            if (chunk) {
              answer += chunk;
              setMessages([...history, { role: 'assistant', content: answer }]);
            }
          } catch {
            /* Wait for a complete SSE data line. */
          }
        }
      }
      if (!answer)
        throw new Error('Модель вернула пустой ответ. Повторите запрос.');
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        if (!answer) setMessages(history);
      } else {
        setError(e instanceof Error ? e.message : 'Не удалось получить ответ');
        if (!answer) setMessages(history);
      }
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }
  const chips =
    mode === 'feature'
      ? [
          'Уведомлять о скидках в Steam',
          'Искать в интернете с источниками',
          'Приветствовать новичков',
        ]
      : [
          'Помоги оживить сервер',
          'Придумай идею для турнира',
          'Расскажи о себе',
        ];
  return (
    <div className="live-chat">
      <div className="live-chat-header">
        <Hash size={22} />
        <strong>
          {mode === 'feature'
            ? 'новая-способность'
            : mode === 'personality'
              ? 'тест-характера'
              : 'песочница'}
        </strong>
        <span className="chat-connection">
          <i
            className={
              health?.online &&
              (mode === 'feature' ? health.agentReady : health.chatReady)
                ? 'live-dot'
                : 'offline-dot'
            }
          />
          {health === null
            ? 'Подключаемся…'
            : health.online
              ? (mode === 'feature' ? health.agentReady : health.chatReady)
                ? 'Модель доступна'
                : 'Модель не загружена'
              : 'LM Studio недоступен'}
        </span>
        <button
          className="icon-button"
          disabled={busy}
          onClick={() => {
            setMessages([{ role: 'assistant', content: welcome }]);
            setError('');
          }}
          title="Новый разговор"
          aria-label="Новый разговор"
        >
          <RotateCcw size={17} />
        </button>
      </div>
      <div
        className="live-messages"
        ref={listRef}
        aria-live="polite"
        aria-relevant="additions text"
      >
        {messages.map((m, i) => (
          <div key={i} className={`live-message ${m.role}`}>
            <span
              className={`avatar ${m.role === 'assistant' ? 'bot' : 'purple'}`}
            >
              {m.role === 'assistant' ? <Zap size={19} /> : 'Я'}
            </span>
            <div>
              <div className="message-author">
                {m.role === 'assistant' ? 'nexo' : 'Вы'}
                {m.role === 'assistant' && <span>AI</span>}
              </div>
              <div className="message-content">
                {m.content || (
                  <span className="typing">
                    <i />
                    <i />
                    <i />
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {busy && messages.at(-1)?.role === 'user' && (
          <div className="typing-line">
            <span className="typing">
              <i />
              <i />
              <i />
            </span>{' '}
            NEXO думает
          </div>
        )}
        <div ref={bottom} />
      </div>
      {error && (
        <div className="inline-error" role="alert">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}
      {messages.length === 1 && (
        <div className="chat-suggestions">
          {chips.map((s) => (
            <button key={s} disabled={busy} onClick={() => send(s)}>
              <Sparkles size={13} />
              {s}
            </button>
          ))}
        </div>
      )}
      <form
        className="live-composer"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <textarea
          aria-label="Сообщение"
          placeholder={
            mode === 'feature'
              ? 'Например: отслеживать цены в Steam и сообщать о скидках…'
              : 'Напишите что-нибудь. Он в теме.'
          }
          value={input}
          maxLength={4000}
          rows={1}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              send();
            }
          }}
        />
        {busy ? (
          <button
            type="button"
            aria-label="Остановить ответ"
            className="send-button"
            onClick={() => abort.current?.abort()}
          >
            <Square size={16} />
          </button>
        ) : (
          <button
            className="send-button"
            aria-label="Отправить сообщение"
            disabled={!input.trim()}
          >
            <ArrowUp size={20} />
          </button>
        )}
      </form>
      <div className="chat-footnote">
        <span>
          {mode === 'playground'
            ? `${used} / 15 сообщений сегодня`
            : 'Shift + Enter — новая строка'}
        </span>
        <span>AI может ошибаться. Важное стоит проверить.</span>
      </div>
      {used >= 15 && mode === 'playground' && (
        <a className="button primary" href="/connect">
          Продолжить в Discord <ArrowUpRight size={17} />
        </a>
      )}
    </div>
  );
}
