'use client';
import { useState } from 'react';

export function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login'),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function submit(e: {
    preventDefault(): void;
    currentTarget: HTMLFormElement;
  }) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (mode === 'register' && form.get('password') !== form.get('repeat')) {
      setError('Пароли не совпадают.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
      });
      if (!response.ok)
        throw new Error(
          ((await response.json().catch(() => ({}))) as { error?: string })
            .error || 'Не удалось войти. Попробуйте ещё раз.',
        );
      location.reload();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="auth-tabs" role="tablist">
        {(
          [
            ['login', 'Вход'],
            ['register', 'Регистрация'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            className={mode === id ? 'active' : ''}
            onClick={() => {
              setMode(id);
              setError('');
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="field-label" htmlFor="auth-email">
        Email
      </label>
      <input
        id="auth-email"
        className="field"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <label className="field-label" htmlFor="auth-password">
        Пароль
      </label>
      <input
        id="auth-password"
        className="field"
        name="password"
        type="password"
        minLength={8}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        required
      />
      {mode === 'register' && (
        <>
          <label className="field-label" htmlFor="auth-repeat">
            Повторите пароль
          </label>
          <input
            id="auth-repeat"
            className="field"
            name="repeat"
            type="password"
            minLength={8}
            autoComplete="new-password"
            required
          />
        </>
      )}
      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}
      <button className="button primary" type="submit" disabled={busy}>
        {busy
          ? 'Подождите…'
          : mode === 'login'
            ? 'Войти в кабинет →'
            : 'Создать аккаунт →'}
      </button>
    </form>
  );
}

export async function signOut() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  location.href = '/';
}
