import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
export const workspaces = sqliteTable('workspaces', {
  owner: text('owner').primaryKey(),
  settings: text('settings').notNull(),
  discordId: text('discord_id'),
  discordName: text('discord_name'),
  discordToken: text('discord_token'),
  guildId: text('guild_id'),
  guildName: text('guild_name'),
  plan: text('plan').notNull().default('basic'),
  credit: integer('credit').notNull().default(0),
  creditPeriod: text('credit_period'),
  stripeCustomer: text('stripe_customer'),
  stripeSubscription: text('stripe_subscription'),
  renewDate: text('renew_date'),
  createdAt: text('created_at').notNull(),
});
export const features = sqliteTable(
  'features',
  {
    id: text('id').primaryKey(),
    owner: text('owner').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    status: text('status').notNull().default('draft'),
    price: integer('price').notNull(),
    credit: integer('credit').notNull().default(0),
    proposal: text('proposal').notNull(),
    conversation: text('conversation').notNull(),
    specification: text('specification').notNull().default(''),
    revisions: integer('revisions').notNull().default(0),
    error: text('error'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [index('idx_features_owner_created').on(t.owner, t.createdAt)],
);
export const revisions = sqliteTable(
  'feature_revisions',
  {
    id: text('id').primaryKey(),
    featureId: text('feature_id').notNull(),
    owner: text('owner').notNull(),
    number: integer('number').notNull(),
    message: text('message').notNull(),
    previousSpec: text('previous_spec').notNull(),
    result: text('result'),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    uniqueIndex('idx_revisions_feature_number').on(t.featureId, t.number),
    index('idx_revisions_owner_feature').on(t.owner, t.featureId),
  ],
);
export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(),
  owner: text('owner').notNull(),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  createdAt: text('created_at').notNull(),
});
export const rateLimits = sqliteTable(
  'rate_limits',
  {
    key: text('key').notNull(),
    bucket: integer('bucket').notNull(),
    count: integer('count').notNull(),
  },
  (t) => [primaryKey({ columns: [t.key, t.bucket] })],
);
export const oauthStates = sqliteTable('oauth_states', {
  state: text('state').primaryKey(),
  owner: text('owner').notNull(),
  expires: integer('expires').notNull(),
});
export const paymentEvents = sqliteTable('payment_events', {
  id: text('id').primaryKey(),
  createdAt: text('created_at').notNull(),
});
export const notifications = sqliteTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    owner: text('owner').notNull(),
    title: text('title').notNull(),
    link: text('link').notNull(),
    read: integer('read').notNull().default(0),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('idx_notifications_owner_created').on(t.owner, t.createdAt)],
);
