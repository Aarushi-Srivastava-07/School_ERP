create table public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null check (role in ('student', 'teacher', 'parent', 'admin', 'principal')),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users_select_own"
on public.users
for select
using ( id = auth.uid() );

create or replace function public.current_user_role()
returns text
language sql
security definer
stable
as $$
  select role from public.users where id = auth.uid();
$$;

create policy "users_select_admin_all"
on public.users
for select
using ( current_user_role() = 'admin' );

create table public.class_teachers (
  id         uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.users(id) on delete cascade,
  class_id   uuid not null,
  created_at timestamptz not null default now(),

  unique (teacher_id, class_id)
);

alter table public.class_teachers enable row level security;

create policy "class_teachers_select_own"
on public.class_teachers
for select
using ( teacher_id = auth.uid() );

create policy "class_teachers_admin_full_access"
on public.class_teachers
for all
using ( current_user_role() = 'admin' )
with check ( current_user_role() = 'admin' );
