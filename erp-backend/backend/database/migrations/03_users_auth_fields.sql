alter table public.users
  add column full_name text,
  add column account_status text not null default 'active' check (account_status in ('active', 'inactive')),
  add column failed_login_attempts integer not null default 0,
  add column account_locked_until timestamptz null,
  add column last_login_at timestamptz null,
  add column updated_at timestamptz not null default now();

alter table public.users drop constraint if exists users_role_check;

alter table public.users
  add constraint users_role_check check (role in ('admin', 'teacher', 'student', 'parent', 'principal'));

create or replace function public.is_admin_equivalent()
returns boolean
language sql
security definer
stable
as $$
  select current_user_role() in ('admin', 'principal');
$$;

create policy "users_admin_full_access"
on public.users
for all
using ( is_admin_equivalent() )
with check ( is_admin_equivalent() );
