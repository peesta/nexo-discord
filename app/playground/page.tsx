import { Header } from '../page';
import { Chat } from '@/components/chat';
export const metadata = { title: 'Песочница — поговорите с NEXO' };
export default function Playground() {
  return (
    <>
      <Header />
      <main className="wrap playground-page">
        <div className="eyebrow">БЕЗ ПОДПИСКИ. ПРОСТО РАЗГОВОР.</div>
        <h1>
          Ну что, познакомимся<span className="lime-text">?</span>
        </h1>
        <p>Проверьте, как NEXO поддерживает диалог. Здесь можно быть собой.</p>
        <Chat />
        <div className="playground-note">
          15 сообщений в день · без доступа к вашему Discord · без выполнения
          команд
        </div>
      </main>
    </>
  );
}
