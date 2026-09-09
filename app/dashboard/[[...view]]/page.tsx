import { Dashboard } from '@/components/dashboard';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Личный кабинет — NEXO' };
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ view?: string[] }>;
}) {
  const { view = [] } = await params;
  return <Dashboard view={view} />;
}
