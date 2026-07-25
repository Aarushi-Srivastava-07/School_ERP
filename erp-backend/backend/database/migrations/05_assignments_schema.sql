create table public.assignments (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null,
  subject     text not null,
  class_name  text not null,
  due_date    date not null,
  created_by  uuid not null references public.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint due_date_not_in_past check (due_date >= current_date)
);

create index idx_assignments_created_by on public.assignments(created_by);
create index idx_assignments_class_name on public.assignments(class_name);

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
