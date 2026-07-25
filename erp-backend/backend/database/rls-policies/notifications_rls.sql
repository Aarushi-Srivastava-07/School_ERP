alter table public.notifications enable row level security;

create policy "notifications_insert_admin"
on public.notifications
for insert
with check ( is_admin_equivalent() );

create policy "notifications_insert_teacher_class_scope"
on public.notifications
for insert
with check (
  current_user_role() = 'teacher'
  and target_audience in ('students', 'parents', 'class')
  and class_id in (
    select class_id from public.class_teachers where teacher_id = auth.uid()
  )
);

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

create policy "notifications_delete_admin_only"
on public.notifications
for delete
using ( is_admin_equivalent() );

create policy "notifications_select_admin_all"
on public.notifications
for select
using ( is_admin_equivalent() );

create policy "notifications_select_via_recipient"
on public.notifications
for select
using (
  id in (
    select notification_id from public.notification_recipients
    where recipient_id = auth.uid()
  )
);

create policy "notifications_select_own_sent"
on public.notifications
for select
using ( created_by = auth.uid() );
