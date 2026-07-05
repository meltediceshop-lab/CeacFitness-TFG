// Inserta entradas en la base de conocimiento del Coach IA (tabla coach_knowledge).
// Uso: node scripts/add-knowledge.mjs entradas.json
//
// entradas.json debe ser un objeto o array de objetos:
// { "category": "nutrition" | "gym" | "outdoor" | "calisthenics" | "general",
//   "title": "...", "content": "...", "tags": ["opcional", "..."] }
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Uso: node scripts/add-knowledge.mjs entradas.json');
  process.exit(1);
}

const raw = JSON.parse(readFileSync(resolve(jsonPath), 'utf-8'));
const entries = Array.isArray(raw) ? raw : [raw];

const VALID_CATEGORIES = ['nutrition', 'gym', 'outdoor', 'calisthenics', 'general'];
for (const e of entries) {
  if (!VALID_CATEGORIES.includes(e.category)) {
    console.error(`❌ Categoría inválida: "${e.category}". Debe ser una de: ${VALID_CATEGORIES.join(', ')}`);
    process.exit(1);
  }
  if (!e.title || !e.content) {
    console.error('❌ Cada entrada necesita "title" y "content".');
    process.exit(1);
  }
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const { data, error } = await supabase
  .from('coach_knowledge')
  .insert(entries.map(e => ({
    category: e.category,
    title: e.title,
    content: e.content,
    tags: e.tags || [],
  })))
  .select('id, category, title');

if (error) {
  console.error('❌ Error insertando conocimiento:', error.message);
  process.exit(1);
}

console.log(`✅ ${data.length} entrada(s) añadida(s) a la base de conocimiento:`);
for (const row of data) {
  console.log(`   [${row.category}] ${row.title} (${row.id})`);
}
