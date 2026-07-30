/**
 * Ejecuta la migración de weekly_history en Supabase.
 * Uso: node scripts/run-weekly-history-migration.mjs
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const SQL = readFileSync(join(__dirname, 'setup-weekly-history.sql'), 'utf-8');
const ref = URL_.split('.')[0].split('//')[1];

async function tryExecSql() {
  const res = await fetch(`${URL_}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, apikey: KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ sql: SQL }),
  });
  return res;
}

(async () => {
  console.log(`\n🚀 Migrando weekly_history en ${URL_}\n`);
  const res = await tryExecSql();
  if (res.ok) {
    console.log('✅ Tabla weekly_history creada (método exec_sql).');
    return;
  }
  const txt = await res.text();
  console.log(`⚠️  exec_sql [${res.status}]: ${txt.slice(0, 160)}`);
  console.log('\n📋 No se pudo ejecutar automáticamente. Copia este SQL en Supabase Dashboard → SQL Editor:');
  console.log(`   ${URL_.replace('https://', 'https://supabase.com/dashboard/project/').split('.')[0]}/sql/new\n`);
  console.log('─────────────────────────────────────────');
  console.log(SQL.trim());
  console.log('─────────────────────────────────────────');
})();
