alter table public.assignments
  add column class_id uuid references public.classes(id) on delete set null;

create index idx_assignments_class_id on public.assignments(class_id);
