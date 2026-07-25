alter table public.classes enable row level security;

create policy "classes_admin_full_access"
on public.classes
for all
using ( is_admin_equivalent() )
with check ( is_admin_equivalent() );

create policy "classes_teacher_select"
on public.classes
for select
using ( current_user_role() = 'teacher' );
