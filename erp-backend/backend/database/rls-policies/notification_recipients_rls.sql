alter table public.notification_recipients enable row level security;

create policy "recipients_select_own"
on public.notification_recipients
for select
using ( recipient_id = auth.uid() );

create policy "recipients_select_admin_all"
on public.notification_recipients
for select
using ( is_admin_equivalent() );

create policy "recipients_mark_own_read"
on public.notification_recipients
for update
using ( recipient_id = auth.uid() )
with check ( recipient_id = auth.uid() );

create policy "recipients_insert_admin_or_teacher"
on public.notification_recipients
for insert
with check ( is_admin_equivalent() or current_user_role() = 'teacher' );
