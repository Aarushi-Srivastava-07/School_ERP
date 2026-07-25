alter table public.assignments enable row level security;

create policy "assignments_admin_full_access"
on public.assignments
for all
using ( is_admin_equivalent() )
with check ( is_admin_equivalent() );

create policy "assignments_teacher_full_access"
on public.assignments
for all
using ( current_user_role() = 'teacher' )
with check ( current_user_role() = 'teacher' );

create policy "assignments_select_student_parent"
on public.assignments
for select
using ( current_user_role() in ('student', 'parent') );
