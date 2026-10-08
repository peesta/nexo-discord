// Publishes the demo build to Cloudflare Workers:
// D1 database (created once) → migrations → build → deploy.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const CONFIG = 'wrangler.cloudflare.json';
// CI=true keeps wrangler from asking interactive questions.
const env = { ...process.env, CI: 'true' };
const run = (command) => execSync(command, { stdio: 'inherit', env });
const output = (command) =>
  execSync(command, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    env,
  });

if (output('npx --no-install wrangler whoami').includes('not authenticated')) {
  console.error('Сначала войдите в Cloudflare: npx wrangler login');
  process.exit(1);
}

const config = JSON.parse(readFileSync(CONFIG, 'utf8'));
const database = config.d1_databases[0];
if (!database.database_id) {
  const find = () =>
    JSON.parse(output('npx --no-install wrangler d1 list --json')).find(
      (d) => d.name === database.database_name,
    );
  let found = find();
  if (!found) {
    console.log(`Создаю базу D1 ${database.database_name}...`);
    run(`npx --no-install wrangler d1 create ${database.database_name}`);
    found = find();
  }
  if (!found?.uuid) throw new Error('Не удалось получить ID базы D1.');
  database.database_id = found.uuid;
  writeFileSync(CONFIG, `${JSON.stringify(config, null, 2)}\n`);
  console.log(`ID базы записан в ${CONFIG}.`);
}

run(
  `npx --no-install wrangler d1 migrations apply ${database.database_name} --remote --config ${CONFIG}`,
);
run('npx --no-install vinext build --mode cloudflare');
run('npx --no-install wrangler deploy --config dist/server/wrangler.json');
