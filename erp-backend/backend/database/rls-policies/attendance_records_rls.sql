alter table public.attendance_records enable row level security;

create policy "attendance_admin_full_access"
on public.attendance_records
for all
using ( is_admin_equivalent() )
with check ( is_admin_equivalent() );

create policy "attendance_teacher_select"
on public.attendance_records
for select
using (
  current_user_role() = 'teacher'
  and class_id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
);

create policy "attendance_teacher_insert"
on public.attendance_records
for insert
with check (
  current_user_role() = 'teacher'
  and class_id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
);

create policy "attendance_teacher_update"
on public.attendance_records
for update
using (
  current_user_role() = 'teacher'
  and class_id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
)
with check (
  current_user_role() = 'teacher'
  and class_id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
);

create policy "attendance_student_select_own"
on public.attendance_records
for select
using (
  current_user_role() = 'student'
  and student_id = auth.uid()
);

create policy "attendance_delete_admin_only"
on public.attendance_records
for delete
using ( is_admin_equivalent() );
