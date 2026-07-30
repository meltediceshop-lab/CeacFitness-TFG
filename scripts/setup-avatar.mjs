import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const idx = l.indexOf('='); return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]; })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// 1. Crear bucket "avatars"
console.log('Creando bucket avatars...');
const { data: bucket, error: bucketError } = await supabase.storage.createBucket('avatars', {
  public: true,
  fileSizeLimit: 5242880, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
});
if (bucketError?.message?.includes('already exists')) {
  console.log('✓ Bucket ya existe');
} else if (bucketError) {
  console.error('✗ Error bucket:', bucketError.message);
} else {
  console.log('✓ Bucket creado:', bucket);
}

// 2. Añadir columna avatar_url via Management API
console.log('Añadiendo columna avatar_url...');
const res = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?select=avatar_url&limit=1`, {
  headers: {
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    apikey: SERVICE_ROLE_KEY,
  },
});

if (res.ok) {
  console.log('✓ Columna avatar_url ya existe');
} else {
  // Columna no existe, añadirla via pg_query
  const sqlRes = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ query: 'ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;' }),
  });

  if (sqlRes.ok) {
    console.log('✓ Columna avatar_url añadida');
  } else {
    const err = await sqlRes.text();
    // Intentar con endpoint alternativo
    const sqlRes2 = await fetch(`https://api.supabase.com/v1/projects/pzyvspzfdwfwzgvbhgyt/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: 'ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;' }),
    });
    if (sqlRes2.ok) {
      console.log('✓ Columna avatar_url añadida (v2)');
    } else {
      console.log('⚠ No se pudo añadir la columna automáticamente.');
      console.log('Ejecuta esto en Supabase → SQL Editor:');
      console.log('ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;');
    }
  }
}
