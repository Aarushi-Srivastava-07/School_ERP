drop policy if exists "exam_marks_teacher_select_own" on public.exam_marks;

create policy "exam_marks_teacher_select_class"
on public.exam_marks
for select
using (
  current_user_role() = 'teacher'
  and class_id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
);
