create table public.assignment_submissions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id    uuid not null references public.users(id) on delete cascade,
  file_url      text not null,
  file_name     text not null,
  file_type     text not null,
  file_size     integer not null,
  status        text not null default 'pending' check (status in ('pending', 'submitted', 'late')),
  submitted_at  timestamptz null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  unique (assignment_id, student_id),
  constraint valid_file_type check (file_type in ('application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
  constraint valid_file_size check (file_size > 0 and file_size <= 5242880)
);

create index idx_submissions_assignment on public.assignment_submissions(assignment_id);
create index idx_submissions_student on public.assignment_submissions(student_id);

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
