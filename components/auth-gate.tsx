import { headers } from 'next/headers';
import { Brand } from '@/app/page';
import { accountFromCookie } from '@/lib/auth';
import { AuthForm } from '@/components/auth-form';
export async function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  if (
    h.get('oai-authenticated-user-id') ||
    (await accountFromCookie(h.get('cookie')))
  )
    return children;
  return (
    <main className="auth-gate">
      <Brand />
      <h1>Ваше пространство NEXO</h1>
      <p>
        Войдите или создайте аккаунт, чтобы сохранять настройки бота и заявки.
        Discord подключается на следующем шаге.
      </p>
      <AuthForm />
      <a href="/" className="text-link">
        Вернуться на сайт
      </a>
    </main>
  );
}
