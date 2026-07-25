create or replace function public.current_user_role()
returns text
language sql
security definer
stable
as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.is_admin_equivalent()
returns boolean
language sql
security definer
stable
as $$
  select current_user_role() in ('admin', 'principal');
$$;
