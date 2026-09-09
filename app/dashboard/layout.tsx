import { AuthGate } from '@/components/auth-gate';
export const dynamic = 'force-dynamic';
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGate returnTo="/dashboard">{children}</AuthGate>;
}
