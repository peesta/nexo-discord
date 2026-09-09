import { verifySignature } from './payment-signature';
import { bindings, db, workspace, ApiError, json, now } from './server';
type Data = Record<string, any>;
async function stripe(path: string, params?: URLSearchParams, key?: string) {
  const secret = bindings().STRIPE_SECRET_KEY;
  if (!secret)
    throw new ApiError(
      503,
      'Оплата ещё не подключена. Списание не выполнялось.',
    );
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: params ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${secret}`,
      ...(params
        ? { 'Content-Type': 'application/x-www-form-urlencoded' }
        : {}),
      ...(key ? { 'Idempotency-Key': key } : {}),
    },
    body: params,
  });
  if (!res.ok)
    throw new ApiError(
      502,
      'Платёжный сервис не подтвердил запрос. Попробуйте позже.',
    );
  return res.json() as Promise<Data>;
}
export async function paymentRoute(
  req: Request,
  path: string,
  owner: string | null,
  featureId?: string,
) {
  if (path === 'payments/webhook') {
    if (req.method !== 'POST') throw new ApiError(405, 'Недопустимый метод.');
    const secret = bindings().STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new ApiError(503, 'Платежи не настроены.');
    const raw = await req.text();
    if (
      raw.length > 1000000 ||
      !(await verifySignature(
        raw,
        req.headers.get('stripe-signature') || '',
        secret,
      ))
    )
      throw new ApiError(400, 'Некорректная подпись.');
    const event = JSON.parse(raw) as Data;
    if (
      await db()
        .prepare('SELECT id FROM payment_events WHERE id=?')
        .bind(event.id)
        .first()
    )
      return json({ received: true });
    const object = event.data.object as Data;
    const statements: D1PreparedStatement[] = [];
    if (
      event.type === 'checkout.session.completed' &&
      object.mode === 'subscription'
    ) {
      const sub = await stripe(`subscriptions/${object.subscription}`);
      const user = sub.metadata?.owner;
      if (user)
        statements.push(
          db()
            .prepare(
              'UPDATE workspaces SET stripe_customer=?,stripe_subscription=? WHERE owner=?',
            )
            .bind(object.customer, sub.id, user),
        );
    }
    if (
      [
        'invoice.paid',
        'invoice.payment_failed',
        'customer.subscription.updated',
        'customer.subscription.deleted',
      ].includes(event.type)
    ) {
      const subscriptionId = event.type.startsWith('invoice.')
        ? object.subscription ||
          object.parent?.subscription_details?.subscription
        : object.id;
      if (subscriptionId) {
        const sub = await stripe(`subscriptions/${subscriptionId}`);
        const user = sub.metadata?.owner;
        if (user) {
          const active = ['active', 'trialing'].includes(sub.status);
          const period = String(
            sub.items?.data?.[0]?.current_period_start ||
              sub.current_period_start ||
              '',
          );
          const end =
            sub.items?.data?.[0]?.current_period_end || sub.current_period_end;
          const renew = end ? new Date(end * 1000).toISOString() : null;
          if (event.type === 'invoice.paid' && active) {
            statements.push(
              db()
                .prepare(
                  "UPDATE workspaces SET plan='pro', credit=CASE WHEN credit_period=? THEN credit ELSE 20 END,credit_period=?,stripe_customer=?,stripe_subscription=?,renew_date=? WHERE owner=?",
                )
                .bind(period, period, sub.customer, sub.id, renew, user),
            );
          } else
            statements.push(
              db()
                .prepare(
                  'UPDATE workspaces SET plan=?,credit=CASE WHEN ? THEN credit ELSE 0 END,renew_date=? WHERE owner=?',
                )
                .bind(active ? 'pro' : 'basic', active ? 1 : 0, renew, user),
            );
        }
      }
    }
    if (
      event.type === 'checkout.session.completed' &&
      object.mode === 'payment' &&
      object.payment_status === 'paid'
    ) {
      const id = object.metadata?.feature_id;
      const user = object.metadata?.owner;
      if (id && user) {
        const f = await db()
          .prepare('SELECT price,status FROM features WHERE id=? AND owner=?')
          .bind(id, user)
          .first<{ price: number; status: string }>();
        if (
          f &&
          object.amount_total === f.price * 100 &&
          object.currency === 'usd'
        )
          statements.push(
            db()
              .prepare(
                "UPDATE features SET status='queued',updated_at=? WHERE id=? AND owner=? AND status IN ('draft','awaiting_payment','specification_ready')",
              )
              .bind(now(), id, user),
          );
      }
    }
    statements.push(
      db()
        .prepare('INSERT INTO payment_events(id,created_at) VALUES(?,?)')
        .bind(event.id, now()),
    );
    try {
      await db().batch(statements);
    } catch (e) {
      if (
        await db()
          .prepare('SELECT id FROM payment_events WHERE id=?')
          .bind(event.id)
          .first()
      )
        return json({ received: true });
      throw e;
    }
    return json({ received: true });
  }
  if (!owner) throw new ApiError(401, 'Требуется вход.');
  const w = await workspace(owner);
  const origin = bindings().APP_ORIGIN || new URL(req.url).origin;
  if (path === 'payments/history' && req.method === 'GET') {
    if (!w.stripe_customer) return json({ invoices: [] });
    const result = await stripe(
      `invoices?customer=${encodeURIComponent(w.stripe_customer as string)}&limit=20`,
    );
    return json({
      invoices: result.data.map((i: Data) => ({
        id: i.id,
        date: new Date(i.created * 1000).toISOString(),
        amount: i.amount_paid / 100,
        status: i.status,
        url: i.hosted_invoice_url,
      })),
    });
  }
  if (req.method !== 'POST') throw new ApiError(405, 'Недопустимый метод.');
  if (!bindings().STRIPE_SECRET_KEY || !bindings().STRIPE_WEBHOOK_SECRET)
    throw new ApiError(
      503,
      'Платёжная система пока не подключена. Списание не выполнялось.',
    );
  if (path === 'payments/portal') {
    if (!w.stripe_customer)
      throw new ApiError(409, 'У вас пока нет платёжного профиля.');
    const result = await stripe(
      'billing_portal/sessions',
      new URLSearchParams({
        customer: w.stripe_customer as string,
        return_url: `${origin}/dashboard/billing`,
      }),
    );
    return json({ url: result.url });
  }
  if (path === 'payments/subscribe') {
    if (w.plan === 'pro')
      throw new ApiError(
        409,
        'Подписка уже активна. Используйте управление подпиской.',
      );
    if (!bindings().STRIPE_PRICE_ID)
      throw new ApiError(503, 'Тариф ещё не подключён к платёжной системе.');
    const params = new URLSearchParams({
      mode: 'subscription',
      'line_items[0][price]': bindings().STRIPE_PRICE_ID!,
      'line_items[0][quantity]': '1',
      'subscription_data[metadata][owner]': owner,
      'metadata[owner]': owner,
      success_url: `${origin}/dashboard/billing?payment=returned`,
      cancel_url: `${origin}/dashboard/billing?payment=cancelled`,
    });
    if (w.stripe_customer) params.set('customer', w.stripe_customer as string);
    const result = await stripe(
      'checkout/sessions',
      params,
      `subscribe:${owner}:${Math.floor(Date.now() / 3600000)}`,
    );
    return json({ url: result.url });
  }
  if (path === 'payments/feature' && featureId) {
    throw new ApiError(
      409,
      'Покупка функций откроется после подключения исполнительного агента. Сейчас можно бесплатно подготовить и проверить ТЗ.',
    );
  }
  throw new ApiError(404, 'Платёжное действие не найдено.');
}
