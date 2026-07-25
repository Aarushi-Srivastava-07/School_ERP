alter table public.parent_students enable row level security;

create policy "parent_students_admin_full_access"
on public.parent_students
for all
using ( is_admin_equivalent() )
with check ( is_admin_equivalent() );

create policy "parent_students_select_own"
on public.parent_students
for select
using ( parent_id = auth.uid() );
