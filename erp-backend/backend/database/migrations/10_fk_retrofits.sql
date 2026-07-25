alter table public.class_teachers
  add constraint class_teachers_class_id_fkey
  foreign key (class_id) references public.classes(id) on delete cascade;

alter table public.notifications
  add constraint notifications_class_id_fkey
  foreign key (class_id) references public.classes(id) on delete set null;

alter table public.exam_marks
  add constraint exam_marks_class_id_fkey
  foreign key (class_id) references public.classes(id) on delete cascade;
