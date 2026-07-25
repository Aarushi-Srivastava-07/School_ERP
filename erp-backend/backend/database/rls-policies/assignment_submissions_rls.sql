alter table public.assignment_submissions enable row level security;

create policy "submissions_admin_full_access"
on public.assignment_submissions
for all
using ( is_admin_equivalent() )
with check ( is_admin_equivalent() );

create policy "submissions_teacher_view_own_assignments"
on public.assignment_submissions
for select
using (
  current_user_role() = 'teacher'
  and assignment_id in (
    select id from public.assignments where created_by = auth.uid()
  )
);

create policy "submissions_student_insert_own"
on public.assignment_submissions
for insert
with check (
  current_user_role() = 'student'
  and student_id = auth.uid()
);

create policy "submissions_student_select_own"
on public.assignment_submissions
for select
using (
  current_user_role() = 'student'
  and student_id = auth.uid()
);
