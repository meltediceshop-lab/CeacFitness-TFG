-- ============================================================
-- FitMente - Schema de base de datos
-- Pega este SQL en Supabase → SQL Editor → Run
-- ============================================================

-- Perfil fisico del usuario (extiende auth.users de Supabase)
create table if not exists user_profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  biological_profile text check (biological_profile in ('male', 'female')),
  weight decimal(5,2),
  height decimal(5,2),
  age_range text check (age_range in ('under-25', '25-34', '35-44', '45-54', '55+')),
  other_sports text[] default '{}',
  other_sports_days integer default 0,
  injuries text[] default '{}',
  excluded_exercises text[] default '{}',
  measurements jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Preferencias del onboarding (nivel, objetivos, dias de entrenamiento...)
create table if not exists user_onboarding (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null unique,
  level text not null check (level in ('beginner', 'advanced')),
  days_per_week integer,
  -- Campos principiante
  experience_level text check (experience_level in ('never', 'inconsistent')),
  beginner_goal text check (beginner_goal in ('energy', 'feel-better', 'strength', 'routine')),
  training_days jsonb default '[]',   -- [{day, timeOfDay}]
  workout_duration text check (workout_duration in ('30min', '45min', '1hour', 'depends')),
  gym_comfort text check (gym_comfort in ('shy', 'insecure', 'depends', 'comfortable')),
  start_week_preference text check (start_week_preference in ('this-week', 'next-week')),
  -- Campos avanzado
  advanced_goal text check (advanced_goal in ('strength', 'physique', 'performance', 'maintain')),
  training_style text check (training_style in ('clear-routine', 'improvise', 'optimize')),
  availability text check (availability in ('stable', 'variable', 'depends-work')),
  priority_muscle text check (priority_muscle in ('chest', 'back', 'shoulders', 'legs', 'arms', 'core', 'none')),
  app_tone text check (app_tone in ('demanding', 'flexible')),
  created_at timestamptz default now()
);

-- Sesiones semanales del usuario
create table if not exists weekly_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  session_number integer not null,
  name text not null,
  target_muscles text,
  duration integer,                    -- minutos
  status text default 'available' check (status in ('completed', 'available', 'locked')),
  completed_at timestamptz,
  week_number integer not null,
  year integer not null,
  sort_order integer default 0,
  exercises jsonb default '[]',        -- array de ejercicios (Exercise[])
  created_at timestamptz default now()
);

-- Entrenamientos completados
create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  weekly_session_id uuid references weekly_sessions on delete set null,
  date timestamptz not null default now(),
  energy_level text check (energy_level in ('very-low', 'low', 'normal', 'high')),
  completed boolean default false,
  notes text,
  mode text check (mode in ('guided', 'simple')),
  created_at timestamptz default now()
);

-- Series, pesos y repeticiones por ejercicio
create table if not exists exercise_logs (
  id uuid primary key default gen_random_uuid(),
  workout_session_id uuid references workout_sessions on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  exercise_id text not null,
  set_number integer not null,
  weight decimal(6,2),
  reps integer,
  timestamp timestamptz default now()
);

-- ============================================================
-- Row Level Security: cada usuario solo accede a sus datos
-- ============================================================

alter table user_profiles enable row level security;
alter table user_onboarding enable row level security;
alter table weekly_sessions enable row level security;
alter table workout_sessions enable row level security;
alter table exercise_logs enable row level security;

create policy "Solo el propietario puede ver y editar su perfil"
  on user_profiles for all using (auth.uid() = id);

create policy "Solo el propietario puede ver y editar su onboarding"
  on user_onboarding for all using (auth.uid() = user_id);

create policy "Solo el propietario puede ver y editar sus sesiones"
  on weekly_sessions for all using (auth.uid() = user_id);

create policy "Solo el propietario puede ver y editar sus entrenamientos"
  on workout_sessions for all using (auth.uid() = user_id);

create policy "Solo el propietario puede ver y editar sus logs"
  on exercise_logs for all using (auth.uid() = user_id);

-- ============================================================
-- Funcion: crear perfil vacio automaticamente al registrarse
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.user_profiles (id)
  values (new.id);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
