create table public.parent_students (
  id         uuid primary key default gen_random_uuid(),
  parent_id  uuid not null references public.users(id) on delete cascade,
  student_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),

  unique (parent_id, student_id)
);

create index idx_parent_students_parent on public.parent_students(parent_id);

alter table public.parent_students enable row level security;

create policy "parent_students_admin_full_access"
on public.parent_students
for all
using ( is_admin_equivalent() )
with check ( is_admin_equivalent() );

create policy "parent_students_select_own"
on public.parent_students
for select
using ( parent_id = auth.uid() );
