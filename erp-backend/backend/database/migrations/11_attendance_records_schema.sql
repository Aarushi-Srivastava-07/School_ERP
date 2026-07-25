create table public.attendance_records (
  id         uuid primary key default gen_random_uuid(),
  class_id   uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.users(id) on delete cascade,
  date       date not null,
  status     varchar(15) not null check (status in ('present', 'absent', 'late')),
  created_at timestamptz not null default now(),

  unique (student_id, class_id, date)
);

create index idx_attendance_student on public.attendance_records(student_id);
create index idx_attendance_class_date on public.attendance_records(class_id, date);

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
