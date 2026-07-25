create table public.classes (
  id         uuid primary key default gen_random_uuid(),
  class_name varchar(50) not null,
  section    varchar(10) null,
  created_at timestamptz not null default now()
);

create index idx_classes_name on public.classes(class_name);

alter table public.classes enable row level security;

create policy "classes_admin_full_access"
on public.classes
for all
using ( is_admin_equivalent() )
with check ( is_admin_equivalent() );

create policy "classes_teacher_select"
on public.classes
for select
using ( current_user_role() = 'teacher' );
