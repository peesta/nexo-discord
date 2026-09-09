import {
  ArrowUpRight,
  ArrowRight,
  Hash,
  Plus,
  Headphones,
  Settings,
  Mic,
  Sparkles,
  Check,
  Zap,
  MessageCircle,
  Shield,
} from 'lucide-react';
export function Brand() {
  return (
    <a className="brand" href="/" aria-label="NEXO — главная">
      <span className="brand-mark">
        <Zap size={23} fill="currentColor" />
      </span>
      nexo<span className="brand-dot">.</span>
    </a>
  );
}
export function Header() {
  return (
    <header className="site-header">
      <div className="wrap nav">
        <Brand />
        <nav aria-label="Основная навигация">
          <a href="/#abilities">Возможности</a>
          <a href="/#evolution">Как это работает</a>
          <a href="/playground">Песочница</a>
          <a href="/#pricing">Тарифы</a>
        </nav>
        <a className="login" href="/dashboard">
          Личный кабинет <ArrowUpRight size={16} />
        </a>
      </div>
    </header>
  );
}
function DiscordPreview() {
  return (
    <div className="discord-scene">
      <div className="floating-tag">
        <span className="live-dot" /> Новый участник подключился
      </div>
      <div className="discord-window">
        <aside className="discord-rail">
          <div className="server-icon">
            <Zap size={22} />
          </div>
          <div className="server-icon muted-server">G</div>
          <div className="server-icon muted-server">
            <Plus size={22} />
          </div>
        </aside>
        <aside className="discord-channels">
          <div className="server-title">The midnight club ⌄</div>
          <div className="channel-group">ТЕКСТОВЫЕ КАНАЛЫ</div>
          <div className="channel selected">
            <Hash size={17} />
            общий-чат
          </div>
          <div className="channel">
            <Hash size={17} />
            знакомства
          </div>
          <div className="channel">
            <Hash size={17} />
            мемы-и-жизнь
          </div>
          <div className="channel-group">ГОЛОСОВЫЕ КАНАЛЫ</div>
          <div className="channel">
            <Headphones size={17} />
            Вечерний сбор
          </div>
          <div className="discord-profile">
            <span className="avatar small purple">a</span>
            <div>
              alex<span>В сети</span>
            </div>
            <Mic size={14} />
            <Settings size={14} />
          </div>
        </aside>
        <div className="discord-main">
          <div className="chat-top">
            <Hash size={21} />
            <b>общий-чат</b>
            <span>Место для своих</span>
            <MessageCircle size={17} />
          </div>
          <div className="chat-date">ПРИМЕР ДИАЛОГА</div>
          <div className="message message-one">
            <span className="avatar purple">a</span>
            <div>
              <b className="purple-text">
                alex<span>Сегодня, в 03:18</span>
              </b>
              <p>Кто сегодня опять сломал сервер?</p>
            </div>
          </div>
          <div className="message message-two">
            <span className="avatar coral">m</span>
            <div>
              <b className="coral-text">
                mika<span>Сегодня, в 03:18</span>
              </b>
              <p>Я только зашла, ничего не знаю 👀</p>
            </div>
          </div>
          <div className="message message-three">
            <span className="avatar bot">
              <Zap size={19} fill="currentColor" />
            </span>
            <div>
              <b className="lime-text">
                nexo <em>APP ✓</em>
                <span>Сегодня, в 03:19</span>
              </b>
              <p>
                Судя по логам, технически никто.
                <br />
                Но Алекс менял конфиг в 03:17, поэтому
                <br className="desktop" /> у меня есть подозреваемый.
              </p>
              <div className="reactions">
                <span>😂 4</span>
                <span>💀 2</span>
              </div>
            </div>
          </div>
          <div className="message message-four">
            <span className="avatar purple">a</span>
            <div>
              <b className="purple-text">
                alex<span>Сегодня, в 03:19</span>
              </b>
              <p>Ладно, этот бот остаётся.</p>
            </div>
          </div>
          <a className="mock-composer" href="/playground">
            <Plus size={18} />
            <span>Написать в #общий-чат</span>
            <Sparkles size={17} />
          </a>
        </div>
      </div>
      <div className="context-tag">
        <Sparkles size={19} />
        <div>
          Читает между строк<span>Контекст, характер и немного иронии.</span>
        </div>
        <Check size={16} />
      </div>
    </div>
  );
}
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" /> AI-УЧАСТНИК ВАШЕГО DISCORD
            </div>
            <h1>
              У вашего сервера
              <br />
              появился <span>свой.</span>
            </h1>
            <p className="hero-description">
              Понимает контекст. Подхватывает шутки.
              <br />И учится новому, когда вы попросите.
              <br />
              Знакомьтесь, NEXO — больше, чем бот.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="/connect">
                <MessageCircle size={19} />
                Добавить в Discord
                <ArrowUpRight size={18} />
              </a>
              <a className="button secondary" href="/playground">
                Попробовать бота
                <ArrowRight size={17} />
              </a>
            </div>
            <div className="hero-note">
              <Check size={14} /> Бесплатный старт <span>·</span> Без банковской
              карты
            </div>
          </div>
          <DiscordPreview />
        </section>
        <div className="wrap product-strip">
          <span>ВПИШЕТСЯ В ВАШ МИР</span>
          <div>⌘ Игровые комьюнити</div>
          <div>◎ Творческие сообщества</div>
          <div>◇ Web3-серверы</div>
          <div>↗ Команды и проекты</div>
        </div>
        <section className="section wrap" id="abilities">
          <div className="section-heading">
            <div>
              <div className="eyebrow">01 / ВОЗМОЖНОСТИ</div>
              <h2>
                Характер есть.
                <br />
                <span className="muted-text">Остальному научится.</span>
              </h2>
            </div>
            <p>
              От первого «привет» до новых способностей.
              <br />
              Один бот, который растёт вместе с вами.
            </p>
          </div>
          <div className="feature-grid">
            <article className="feature-card">
              <MessageCircle />
              <h3>Разговор, а не команды</h3>
              <p>
                Помнит, о чём вы говорили. Отвечает по делу и чувствует
                настроение беседы.
              </p>
              <div className="mini-chat">
                <span>Стоит делать турнир в субботу?</span>
                <b>
                  Если все «скорее всего будут», начнём в воскресенье. Но идея
                  хорошая.
                </b>
              </div>
            </article>
            <article className="feature-card">
              <Sparkles />
              <h3>Ваш бот. Ваш характер.</h3>
              <p>
                Спокойный эксперт или свой человек с иронией — задайте ему роль
                обычными словами.
              </p>
              <div className="personality-chips">
                <span>Дружелюбный</span>
                <span>С иронией ↗</span>
                <span>Эксперт</span>
              </div>
            </article>
            <article className="feature-card">
              <Shield />
              <h3>Порядок без перегибов</h3>
              <p>
                Замечает спам и подозрительные сообщения. Уведомляет
                администратора — решение за человеком.
              </p>
              <div className="moderation-mini">
                <span className="live-dot" /> Наблюдает. Подсказывает. Не банит.
              </div>
            </article>
          </div>
        </section>
        <section className="section wrap evolution" id="evolution">
          <div>
            <div className="eyebrow">02 / БЕЗ ПОТОЛКА ВОЗМОЖНОСТЕЙ</div>
            <h2>
              Новая способность?
              <br />
              <span className="lime-text">Просто попросите.</span>
            </h2>
            <p>
              Не ищите другого бота под каждую задачу.
              <br />
              Опишите идею. AI уточнит детали, оценит
              <br />
              работу и подготовит задание на разработку.
            </p>
            <a className="text-link" href="/dashboard/add-feature">
              Придумать первую функцию <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="evolution-demo">
            <div className="request-line">
              <span className="avatar purple small">a</span>Научи бота искать в
              интернете и давать источники.
            </div>
            <div className="connector-line" />
            <div className="proposal-mini">
              <div>
                <Sparkles size={17} /> Поиск в интернете{' '}
                <span>ПРИМЕР ОЦЕНКИ</span>
              </div>
              <p>Поиск по запросу, краткий ответ и ссылки на источники.</p>
              <div className="proposal-stats">
                <span>
                  Разработка <b>2–3 дня</b>
                </span>
                <span>
                  Стоимость <b>$40</b>
                </span>
                <span>
                  Кредит Pro <b className="lime-text">−$20</b>
                </span>
              </div>
              <a className="button primary" href="/dashboard/add-feature">
                Обсудить свою идею <ArrowRight size={17} />
              </a>
            </div>
            <div className="pipeline">
              <span>
                <Check size={13} /> Идея
              </span>
              <i />
              <span>Разработка</span>
              <i />
              <span>Проверка</span>
              <i />
              <span className="lime-text">В эфире ↗</span>
            </div>
          </div>
        </section>
        <section className="section wrap" id="pricing">
          <div className="section-heading">
            <div>
              <div className="eyebrow">03 / ТАРИФЫ</div>
              <h2>
                Начните разговор.
                <br />
                <span className="muted-text">Дальше — больше.</span>
              </h2>
            </div>
            <p>
              Понятная подписка. Новые возможности каждый месяц.
              <br />
              Без скрытой стоимости разработки.
            </p>
          </div>
          <div className="pricing-grid">
            <article className="price-card">
              <div className="plan-name">
                Basic <span>Знакомство без обязательств</span>
              </div>
              <div className="price">
                $0<span>/ навсегда</span>
              </div>
              <p>Новый участник для вашего сервера.</p>
              <ul>
                <li>
                  <Check />
                  Базовый AI-чат в Discord
                </li>
                <li>
                  <Check />
                  Естественный диалог с контекстом
                </li>
                <li>
                  <Check />
                  Стандартный характер
                </li>
                <li>
                  <Check />
                  Песочница на сайте
                </li>
              </ul>
              <a className="button secondary" href="/connect">
                Добавить бесплатно <ArrowUpRight size={18} />
              </a>
            </article>
            <article className="price-card pro">
              <div className="plan-name">
                NEXO Pro <span className="pro-tag">ДЛЯ СВОИХ</span>
              </div>
              <div className="price">
                $20<span>/ месяц</span>
              </div>
              <p>Бот, который развивается вместе с вами.</p>
              <ul>
                <li>
                  <Check />
                  Всё из Basic + личный кабинет
                </li>
                <li>
                  <Check />
                  Свой характер и AI-модерация
                </li>
                <li>
                  <Check />
                  <strong>$20 на одну новую функцию ежемесячно</strong>
                </li>
                <li>
                  <Check />
                  Приоритетная разработка и 5 бесплатных правок
                </li>
              </ul>
              <a className="button primary" href="/connect?plan=pro">
                Начать за $20 <ArrowUpRight size={18} />
              </a>
              <small>Функция дороже $20? Оплачивается только разница.</small>
            </article>
          </div>
        </section>
        <section className="section wrap faq" id="faq">
          <div>
            <div className="eyebrow">04 / ЕСТЬ ВОПРОСЫ?</div>
            <h2>Давайте разберёмся.</h2>
          </div>
          <div>
            {[
              [
                'Чем NEXO отличается от обычного бота?',
                'NEXO поддерживает естественную переписку с контекстом. Его характер можно настроить, а новые функции — заказать, просто описав идею в чате.',
              ],
              [
                'Что входит в ежемесячные $20?',
                'Тариф Pro включает настройки характера, модерацию, кабинет и кредит $20 на одну функцию в месяц. Если функция стоит $60, доплата составит $40. Кредит не переносится.',
              ],
              [
                'Бот будет банить участников?',
                'По умолчанию — нет. AI отмечает потенциальное нарушение и отправляет уведомление администратору. Решение принимает человек.',
              ],
              [
                'А если новая функция работает не так?',
                'Для каждой функции предусмотрено 5 бесплатных итераций исправлений в рамках согласованного задания. Если проблема останется, задача передаётся специалисту.',
              ],
              [
                'Можно попробовать до оплаты?',
                'Да. В песочнице доступно до 15 сообщений без подписки. Basic позволяет начать с базового общения на сервере.',
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <Plus size={18} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="wrap final-cta">
          <div className="eyebrow">
            <span className="live-dot" /> ГОТОВ ПРИСОЕДИНИТЬСЯ
          </div>
          <h2>
            Ваш сервер.
            <br />
            Его следующий участник.
          </h2>
          <a className="button primary" href="/connect">
            Познакомиться с NEXO <ArrowUpRight size={19} />
          </a>
        </section>
      </main>
      <footer className="wrap footer">
        <Brand />
        <span>Не просто онлайн. В теме.</span>
        <a href="/playground">Песочница</a>
        <a href="/#faq">FAQ</a>
        <span>© 2026 NEXO</span>
      </footer>
    </>
  );
}
