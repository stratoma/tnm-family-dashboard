create extension if not exists "pgcrypto";

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  color text not null default '#8da089',
  role text not null default 'Child' check (role in ('Adult', 'Child')),
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  assignee text not null default 'Unassigned',
  assignee_id uuid references public.family_members(id) on delete set null,
  priority text not null check (priority in ('Low', 'Medium', 'High')),
  due_date date,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.kids_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  activity_name text not null,
  child_name text not null,
  location text,
  address text,
  frequency text not null default 'Weekly' check (frequency in ('One-time', 'Weekly', 'Biweekly', 'Monthly')),
  date_time timestamptz not null,
  notes text,
  reminder boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  calendar text not null default 'Family',
  owner text not null default 'Everyone',
  start_time timestamptz not null,
  end_time timestamptz not null,
  color text not null default '#8da089',
  location text,
  created_at timestamptz not null default now()
);

create table public.doctor_appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  person text not null,
  doctor_name text not null,
  appointment_type text not null,
  date_time timestamptz not null,
  address text,
  notes text,
  follow_up_reminder boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.birthdays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  relationship text not null,
  birthday date not null,
  reminder_days int not null default 7 check (reminder_days between 0 and 60),
  created_at timestamptz not null default now()
);

create table public.grocery_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  category text not null check (category in ('Produce', 'Meat', 'Dairy', 'Pantry', 'Household', 'Snacks', 'Other')),
  bought boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.home_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  project_name text not null,
  status text not null check (status in ('Not Started', 'In Progress', 'Waiting', 'Done')),
  budget numeric(10, 2) not null default 0,
  due_date date,
  notes text,
  created_at timestamptz not null default now()
);

create table public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  project_id uuid not null references public.home_projects(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.google_calendar_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  google_email text not null,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, google_email)
);

create table public.cal_calendar_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  encrypted_api_key text not null,
  key_hint text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_calendar_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  connection_id uuid not null references public.google_calendar_connections(id) on delete cascade,
  calendar_id text not null,
  calendar_name text not null,
  color text not null default '#8da089',
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, connection_id, calendar_id)
);

alter table public.users enable row level security;
alter table public.family_members enable row level security;
alter table public.tasks enable row level security;
alter table public.calendar_events enable row level security;
alter table public.kids_activities enable row level security;
alter table public.doctor_appointments enable row level security;
alter table public.birthdays enable row level security;
alter table public.grocery_items enable row level security;
alter table public.home_projects enable row level security;
alter table public.project_tasks enable row level security;
alter table public.google_calendar_connections enable row level security;
alter table public.cal_calendar_connections enable row level security;
alter table public.user_calendar_preferences enable row level security;

create policy "Users can manage themselves" on public.users
  for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Users own family members" on public.family_members
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users own tasks" on public.tasks
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users own calendar events" on public.calendar_events
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users own kids activities" on public.kids_activities
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users own doctor appointments" on public.doctor_appointments
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users own birthdays" on public.birthdays
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users own grocery items" on public.grocery_items
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users own home projects" on public.home_projects
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users own project tasks" on public.project_tasks
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users can read calendar connections" on public.google_calendar_connections
  for select to authenticated using ((select auth.uid()) = user_id);

-- Customer API keys are only read and written through server routes using the service-role key.
-- No client policy is intentionally defined for this encrypted credentials table.

create policy "Users can read calendar preferences" on public.user_calendar_preferences
  for select to authenticated using ((select auth.uid()) = user_id);

create index tasks_user_due_idx on public.tasks(user_id, due_date);
create index calendar_events_user_start_idx on public.calendar_events(user_id, start_time);
create index activities_user_date_idx on public.kids_activities(user_id, date_time);
create index appointments_user_date_idx on public.doctor_appointments(user_id, date_time);
create index grocery_user_category_idx on public.grocery_items(user_id, category);
create index calendar_connections_user_idx on public.google_calendar_connections(user_id);
create index cal_connections_user_idx on public.cal_calendar_connections(user_id);
