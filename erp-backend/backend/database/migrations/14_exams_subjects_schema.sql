create table public.exams (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  term          text not null,
  academic_year text not null,
  class_id      uuid not null references public.classes(id) on delete cascade,
  created_at    timestamptz not null default now()
);

create table public.subjects (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  class_id   uuid not null references public.classes(id) on delete cascade,
  sub_code   text null,
  created_at timestamptz not null default now()
);

create index idx_exams_class on public.exams(class_id);
create index idx_subjects_class on public.subjects(class_id);

alter table public.exams enable row level security;
alter table public.subjects enable row level security;

create policy "exams_admin_full_access"
on public.exams
for all
using ( is_admin_equivalent() )
with check ( is_admin_equivalent() );

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

create policy "exams_select_authenticated"
on public.exams
for select
using ( auth.uid() is not null );

create policy "subjects_admin_full_access"
on public.subjects
for all
using ( is_admin_equivalent() )
with check ( is_admin_equivalent() );

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

create policy "subjects_select_authenticated"
on public.subjects
for select
using ( auth.uid() is not null );
