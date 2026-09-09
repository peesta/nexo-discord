import { headers } from 'next/headers';
import { Brand } from '@/app/page';
export async function AuthGate({
  children,
  returnTo,
}: {
  children: React.ReactNode;
  returnTo: string;
}) {
  const h = await headers();
  if (h.get('oai-authenticated-user-id')) return children;
  return (
    <main className="auth-gate">
      <Brand />
      <h1>Ваше пространство NEXO</h1>
      <p>
        Откройте защищённый кабинет, чтобы сохранить настройки и заявки. Discord
        подключается на следующем шаге.
      </p>
      <a
        className="button primary"
        href={`/signin-with-chatgpt?return_to=${encodeURIComponent(returnTo)}`}
        target="_top"
      >
        Открыть кабинет →
      </a>
      <a href="/" className="text-link">
        Вернуться на сайт
      </a>
    </main>
  );
}
