import { Header } from '../page';
import { Connect } from '@/components/connect';
import { AuthGate } from '@/components/auth-gate';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Подключить Discord — NEXO' };
export default function ConnectPage() {
  return (
    <>
      <Header />
      <AuthGate returnTo="/connect">
        <Connect />
      </AuthGate>
    </>
  );
}
