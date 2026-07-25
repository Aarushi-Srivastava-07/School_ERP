alter table public.exam_marks enable row level security;

create policy "exam_marks_admin_full_access"
on public.exam_marks
for all
using ( is_admin_equivalent() )
with check ( is_admin_equivalent() );

create policy "exam_marks_student_select_own"
on public.exam_marks
for select
using (
  current_user_role() = 'student'
  and student_id = auth.uid()
);

create policy "exam_marks_teacher_select_class"
on public.exam_marks
for select
using (
  current_user_role() = 'teacher'
  and class_id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
);

create policy "exam_marks_teacher_insert_own"
on public.exam_marks
for insert
with check (
  current_user_role() = 'teacher'
  and teacher_id = auth.uid()
  and class_id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
);

create policy "exam_marks_teacher_update_own"
on public.exam_marks
for update
using (
  current_user_role() = 'teacher'
  and teacher_id = auth.uid()
  and class_id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
)
with check (
  current_user_role() = 'teacher'
  and teacher_id = auth.uid()
  and class_id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
);

create policy "exam_marks_parent_select_linked"
on public.exam_marks
for select
using (
  current_user_role() = 'parent'
  and student_id in (
    select student_id from public.parent_students where parent_id = auth.uid()
  )
);
