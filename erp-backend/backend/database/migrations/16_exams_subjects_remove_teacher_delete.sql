drop policy if exists "exams_teacher_class_scope" on public.exams;

create policy "exams_teacher_select"
on public.exams
for select
using (
  current_user_role() = 'teacher'
  and class_id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
);

create policy "exams_teacher_insert"
on public.exams
for insert
with check (
  current_user_role() = 'teacher'
  and class_id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
);

create policy "exams_teacher_update"
on public.exams
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

drop policy if exists "subjects_teacher_class_scope" on public.subjects;

create policy "subjects_teacher_select"
on public.subjects
for select
using (
  current_user_role() = 'teacher'
  and class_id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
);

create policy "subjects_teacher_insert"
on public.subjects
for insert
with check (
  current_user_role() = 'teacher'
  and class_id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
);

create policy "subjects_teacher_update"
on public.subjects
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
