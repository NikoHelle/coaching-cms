create table drills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  description text not null default '',
  purpose text not null default '',
  player_count text not null default '',
  duration_minutes int not null default 0,
  focus_points text[] not null default '{}',
  dos text[] not null default '{}',
  donts text[] not null default '{}',
  video_urls text[] not null default '{}',
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('public', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index drills_tags_idx on drills using gin (tags);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  session_date date,
  notes text not null default '',
  status text not null default 'draft' check (status in ('public', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table session_drills (
  session_id uuid not null references sessions(id) on delete cascade,
  drill_id uuid not null references drills(id) on delete cascade,
  position int not null,
  note text,
  primary key (session_id, drill_id)
);

create or replace function set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger drills_updated_at before update on drills
  for each row execute function set_updated_at();
create trigger sessions_updated_at before update on sessions
  for each row execute function set_updated_at();

alter table drills enable row level security;
alter table sessions enable row level security;
alter table session_drills enable row level security;

-- Anonymous read: public drills, plus draft drills referenced by a public
-- session (the session share page must render them; they still have no
-- public drill page because page queries filter status = 'public').
create policy "anon read public drills" on drills for select to anon
  using (
    status = 'public'
    or exists (
      select 1 from session_drills sd
      join sessions s on s.id = sd.session_id
      where sd.drill_id = drills.id and s.status = 'public'
    )
  );

create policy "anon read public sessions" on sessions for select to anon
  using (status = 'public');

create policy "anon read public session_drills" on session_drills for select to anon
  using (
    exists (
      select 1 from sessions s
      where s.id = session_drills.session_id and s.status = 'public'
    )
  );

-- Single authenticated user (the coach) gets full access.
create policy "auth full drills" on drills for all to authenticated
  using (true) with check (true);
create policy "auth full sessions" on sessions for all to authenticated
  using (true) with check (true);
create policy "auth full session_drills" on session_drills for all to authenticated
  using (true) with check (true);
