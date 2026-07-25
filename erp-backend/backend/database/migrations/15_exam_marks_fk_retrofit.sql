alter table public.exam_marks
  add constraint exam_marks_exam_id_fkey
  foreign key (exam_id) references public.exams(id) on delete cascade;

alter table public.exam_marks
  add constraint exam_marks_subject_id_fkey
  foreign key (subject_id) references public.subjects(id) on delete cascade;
