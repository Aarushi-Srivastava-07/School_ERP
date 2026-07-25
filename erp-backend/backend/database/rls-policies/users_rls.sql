alter table public.users enable row level security;

create policy "users_select_own"
on public.users
for select
using ( id = auth.uid() );

create policy "users_select_admin_all"
on public.users
for select
using ( is_admin_equivalent() );

create policy "users_admin_full_access"
on public.users
for all
using ( is_admin_equivalent() )
with check ( is_admin_equivalent() );
