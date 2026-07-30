// Migración: tablas de seguimiento nutricional (logs de alimentos + meta diaria)
// Uso:  SUPABASE_PAT=sbp_xxx SUPABASE_REF=xxxx node scripts/setup-nutrition.mjs
const PAT = process.env.SUPABASE_PAT;
const REF = process.env.SUPABASE_REF;

if (!PAT || !REF) {
  console.error('Faltan SUPABASE_PAT o SUPABASE_REF en el entorno.');
  process.exit(1);
}

const SQL = `
create table if not exists nutrition_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  log_date date not null default current_date,
  meal_slot text not null,
  food_name text not null,
  quantity_g numeric,
  kcal numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fats numeric not null default 0,
  created_at timestamptz default now()
);

alter table nutrition_logs enable row level security;
drop policy if exists "own nutrition logs" on nutrition_logs;
create policy "own nutrition logs" on nutrition_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_nutrition_logs_user_date on nutrition_logs(user_id, log_date);

create table if not exists nutrition_days (
  user_id uuid references auth.users on delete cascade not null,
  log_date date not null default current_date,
  water_glasses int not null default 0,
  water_goal int not null default 8,
  updated_at timestamptz default now(),
  primary key (user_id, log_date)
);

alter table nutrition_days enable row level security;
drop policy if exists "own nutrition days" on nutrition_days;
create policy "own nutrition days" on nutrition_days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
`;

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${PAT}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: SQL }),
});

const text = await res.text();
console.log('HTTP', res.status);
console.log(text || '(sin cuerpo)');
if (!res.ok) process.exit(1);
console.log('✅ Migración de nutrición aplicada.');