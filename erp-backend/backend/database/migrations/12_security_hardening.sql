drop policy if exists "teachers_view_class_submissions" on storage.objects;
create policy "teachers_view_class_submissions"
on storage.objects
for select
using (
  bucket_id = 'assignment-submissions'
  and current_user_role() = 'teacher'
  and (storage.foldername(name))[1] in (
    select id::text from public.assignments where created_by = auth.uid()
  )
);

drop policy if exists "assignments_teacher_full_access" on public.assignments;

create policy "assignments_teacher_select"
on public.assignments
for select
using ( current_user_role() = 'teacher' );

create policy "assignments_teacher_insert"
on public.assignments
for insert
with check (
  current_user_role() = 'teacher'
  and created_by = auth.uid()
);

create policy "assignments_teacher_update"
on public.assignments
for update
using (
  current_user_role() = 'teacher'
  and created_by = auth.uid()
)
with check (
  current_user_role() = 'teacher'
  and created_by = auth.uid()
);

create policy "assignments_teacher_delete"
on public.assignments
for delete
using (
  current_user_role() = 'teacher'
  and created_by = auth.uid()
);

drop policy if exists "exam_marks_teacher_insert_own" on public.exam_marks;
create policy "exam_marks_teacher_insert_own"
on public.exam_marks
for insert
with check (
  current_user_role() = 'teacher'
  and teacher_id = auth.uid()
  and class_id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
);

drop policy if exists "exam_marks_teacher_update_own" on public.exam_marks;
create policy "exam_marks_teacher_update_own"
on public.exam_marks
for update
using (
  current_user_role() = 'teacher'
  and teacher_id = auth.uid()
  and class_id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
)
with check (
  current_user_role() = 'teacher'
  and teacher_id = auth.uid()
  and class_id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
);

drop policy if exists "recipients_insert_admin_or_teacher" on public.notification_recipients;
create policy "recipients_insert_admin_or_teacher"
on public.notification_recipients
for insert
with check (
  is_admin_equivalent()
  or (
    current_user_role() = 'teacher'
    and notification_id in (
      select id from public.notifications where created_by = auth.uid()
    )
  )
);

drop policy if exists "classes_teacher_select" on public.classes;
create policy "classes_teacher_select"
on public.classes
for select
using (
  current_user_role() = 'teacher'
  and id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
);

create or replace function public.enforce_recipient_read_only_update()
returns trigger
language plpgsql
as $$
begin
  if new.notification_id is distinct from old.notification_id
     or new.recipient_id is distinct from old.recipient_id
     or new.delivered_at is distinct from old.delivered_at then
    raise exception 'only read_at can be updated on notification_recipients';
  end if;
  return new;
end;
$$;

drop trigger if exists notification_recipients_restrict_update on public.notification_recipients;
create trigger notification_recipients_restrict_update
before update on public.notification_recipients
for each row
execute function public.enforce_recipient_read_only_update();

create policy "users_update_own_profile"
on public.users
for update
using ( id = auth.uid() )
with check (
  id = auth.uid()
  and role = (select role from public.users where id = auth.uid())
  and account_status = (select account_status from public.users where id = auth.uid())
  and failed_login_attempts = (select failed_login_attempts from public.users where id = auth.uid())
  and account_locked_until is not distinct from (select account_locked_until from public.users where id = auth.uid())
);
