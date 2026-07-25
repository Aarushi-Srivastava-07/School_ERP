alter table public.class_teachers enable row level security;

create policy "class_teachers_select_own"
on public.class_teachers
for select
using ( teacher_id = auth.uid() );

create policy "class_teachers_admin_full_access"
on public.class_teachers
for all
using ( is_admin_equivalent() )
with check ( is_admin_equivalent() );
