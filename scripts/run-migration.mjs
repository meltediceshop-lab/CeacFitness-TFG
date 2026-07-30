/**
 * Ejecuta la migración de métricas en Supabase:
 *  1. Crea el bucket de Storage "body-progress"
 *  2. Crea la tabla body_measurements + índice + RLS policies
 *
 * Uso: node scripts/run-migration.mjs
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Variables de entorno ─────────────────────────────────────────────────────
// Leemos .env.local manualmente (no dependemos de dotenv)
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const SUPABASE_URL       = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY   = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY           = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const AUTH_HEADER = { Authorization: `Bearer ${SERVICE_ROLE_KEY}`, apikey: SERVICE_ROLE_KEY };

// ─── 1. Crear bucket body-progress ───────────────────────────────────────────
async function createBucket() {
  console.log('📦 Creando bucket "body-progress"...');
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'body-progress', name: 'body-progress', public: true }),
  });
  const json = await res.json().catch(() => ({}));

  if (res.ok) {
    console.log('   ✅ Bucket creado correctamente.');
    return true;
  }
  // 409 = ya existe → OK
  if (res.status === 409 || (json.error ?? '').includes('already exists') || (json.message ?? '').includes('already exists')) {
    console.log('   ℹ️  El bucket ya existía (OK).');
    return true;
  }
  console.warn(`   ⚠️  Error creando bucket [${res.status}]:`, json);
  return false;
}

// ─── 2. Policy pública de lectura para Storage ────────────────────────────────
async function createStoragePolicy() {
  const sql = `
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname='storage' AND tablename='objects' AND policyname='body-progress public read'
      ) THEN
        CREATE POLICY "body-progress public read"
          ON storage.objects FOR SELECT
          USING (bucket_id = 'body-progress');
      END IF;
    END $$;
  `;
  return runSQL(sql, 'Policy SELECT de storage');
}

// ─── 3. Intentar ejecutar SQL por distintos métodos ───────────────────────────
async function runSQL(sql, label = 'SQL') {
  console.log(`\n🔧 ${label}...`);

  // Método A: exec_sql RPC (existe en algunos proyectos Supabase)
  {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: { ...AUTH_HEADER, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ sql }),
    });
    if (res.ok) { console.log(`   ✅ ${label} — método exec_sql`); return true; }
    if (res.status !== 404) {
      const t = await res.text();
      console.log(`   exec_sql [${res.status}]: ${t.slice(0, 120)}`);
    }
  }

  // Método B: pgmigrations / pg_query RPC
  for (const fn of ['run_sql', 'pg_query', 'query']) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { ...AUTH_HEADER, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ sql }),
    });
    if (res.ok) { console.log(`   ✅ ${label} — método ${fn}`); return true; }
    if (res.status !== 404 && res.status !== 400) {
      const t = await res.text();
      console.log(`   ${fn} [${res.status}]: ${t.slice(0, 120)}`);
    }
  }

  // Método C: Supabase Management API (si hay acceso)
  {
    const projectRef = SUPABASE_URL.split('.')[0].split('//')[1];
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: sql }),
    });
    if (res.ok) { console.log(`   ✅ ${label} — Management API`); return true; }
    // 401/403 = no PAT (esperado)
  }

  console.log(`   ⚠️  No se pudo ejecutar automáticamente. Ejecuta este SQL manualmente en Supabase Dashboard → SQL Editor:`);
  console.log('   ─────────────────────────────────────────');
  console.log(sql.trim());
  console.log('   ─────────────────────────────────────────');
  return false;
}

// ─── 4. SQL principal ─────────────────────────────────────────────────────────
const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS body_measurements (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID         REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recorded_at DATE         NOT NULL DEFAULT CURRENT_DATE,
  weight      NUMERIC(5,2),
  chest       NUMERIC(5,1),
  waist       NUMERIC(5,1),
  hips        NUMERIC(5,1),
  glutes      NUMERIC(5,1),
  arms        NUMERIC(5,1),
  forearms    NUMERIC(5,1),
  thighs      NUMERIC(5,1),
  calves      NUMERIC(5,1),
  photo_url   TEXT,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date
  ON body_measurements(user_id, recorded_at DESC);

ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='metrics_select' AND tablename='body_measurements') THEN
    CREATE POLICY "metrics_select" ON body_measurements FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='metrics_insert' AND tablename='body_measurements') THEN
    CREATE POLICY "metrics_insert" ON body_measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='metrics_delete' AND tablename='body_measurements') THEN
    CREATE POLICY "metrics_delete" ON body_measurements FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
`;

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`\n🚀 Migrando proyecto Supabase: ${SUPABASE_URL}\n`);

  const bucketOk = await createBucket();

  const sqlOk = await runSQL(MIGRATION_SQL, 'Tabla body_measurements + RLS');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (bucketOk && sqlOk) {
    console.log('✅ Migración completada. ¡Todo listo!');
  } else {
    console.log('⚠️  Revisa los mensajes anteriores.');
    if (!sqlOk) {
      console.log('\n📋 Abre este enlace y ejecuta el SQL que aparece arriba:');
      console.log(`   ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/').split('.')[0]}/sql/new`);
    }
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
})();
