create table public.exam_marks (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references public.users(id) on delete cascade,
  teacher_id     uuid not null references public.users(id),
  class_id       uuid not null,
  exam_id        uuid not null,
  subject_id     uuid not null,
  marks_obtained numeric not null,
  max_marks      numeric not null,
  passing_marks  numeric not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint valid_marks_range check (marks_obtained >= 0 and marks_obtained <= max_marks),
  constraint valid_passing_marks check (passing_marks >= 0 and passing_marks <= max_marks)
);

create index idx_exam_marks_student on public.exam_marks(student_id);
create index idx_exam_marks_teacher on public.exam_marks(teacher_id);
create index idx_exam_marks_class_exam on public.exam_marks(class_id, exam_id);

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

create policy "exam_marks_teacher_select_own"
on public.exam_marks
for select
using (
  current_user_role() = 'teacher'
  and teacher_id = auth.uid()
);

create policy "exam_marks_teacher_insert_own"
on public.exam_marks
for insert
with check (
  current_user_role() = 'teacher'
  and teacher_id = auth.uid()
);

create policy "exam_marks_teacher_update_own"
on public.exam_marks
for update
using (
  current_user_role() = 'teacher'
  and teacher_id = auth.uid()
)
with check (
  current_user_role() = 'teacher'
  and teacher_id = auth.uid()
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
