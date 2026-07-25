drop policy if exists "users_select_admin_all" on public.users;
create policy "users_select_admin_all"
on public.users
for select
using ( is_admin_equivalent() );

drop policy if exists "class_teachers_admin_full_access" on public.class_teachers;
create policy "class_teachers_admin_full_access"
on public.class_teachers
for all
using ( is_admin_equivalent() )
with check ( is_admin_equivalent() );

drop policy if exists "notifications_insert_admin" on public.notifications;
create policy "notifications_insert_admin"
on public.notifications
for insert
with check ( is_admin_equivalent() );

drop policy if exists "notifications_update_own_or_admin" on public.notifications;
create policy "notifications_update_own_or_admin"
on public.notifications
for update
using (
  is_admin_equivalent()
  or created_by = auth.uid()
)
with check (
  is_admin_equivalent()
  or created_by = auth.uid()
);

drop policy if exists "notifications_delete_admin_only" on public.notifications;
create policy "notifications_delete_admin_only"
on public.notifications
for delete
using ( is_admin_equivalent() );

drop policy if exists "notifications_select_admin_all" on public.notifications;
create policy "notifications_select_admin_all"
on public.notifications
for select
using ( is_admin_equivalent() );

drop policy if exists "recipients_select_admin_all" on public.notification_recipients;
create policy "recipients_select_admin_all"
on public.notification_recipients
for select
using ( is_admin_equivalent() );

drop policy if exists "recipients_insert_admin_or_teacher" on public.notification_recipients;
create policy "recipients_insert_admin_or_teacher"
on public.notification_recipients
for insert
with check ( is_admin_equivalent() or current_user_role() = 'teacher' );

drop policy if exists "admin_full_storage_access" on storage.objects;
create policy "admin_full_storage_access"
on storage.objects
for all
using (
  bucket_id = 'assignment-submissions'
  and is_admin_equivalent()
);
