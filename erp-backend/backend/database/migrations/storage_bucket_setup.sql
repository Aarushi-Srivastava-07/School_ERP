insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'assignment-submissions',
  'assignment-submissions',
  false,
  5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

create policy "students_upload_own_submission"
on storage.objects
for insert
with check (
  bucket_id = 'assignment-submissions'
  and (storage.foldername(name))[2] = auth.uid()::text
  and current_user_role() = 'student'
);

create policy "students_view_own_submission"
on storage.objects
for select
using (
  bucket_id = 'assignment-submissions'
  and (storage.foldername(name))[2] = auth.uid()::text
  and current_user_role() = 'student'
);

create policy "teachers_view_class_submissions"
on storage.objects
for select
using (
  bucket_id = 'assignment-submissions'
  and current_user_role() = 'teacher'
);

create policy "admin_full_storage_access"
on storage.objects
for all
using (
  bucket_id = 'assignment-submissions'
  and current_user_role() = 'admin'
);
