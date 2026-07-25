create table public.notifications (
  id              uuid primary key default gen_random_uuid(),
  type            text not null check (type in ('general', 'announcement', 'reminder', 'alert')),
  title           text not null,
  message         text not null,
  target_audience text not null check (target_audience in ('students', 'teachers', 'parents', 'all', 'class')),
  class_id        uuid null,
  created_by      uuid not null references public.users(id),
  created_at      timestamptz not null default now(),
  status          text not null default 'draft' check (status in ('draft', 'sent', 'archived')),
  sent_at         timestamptz null,

  constraint no_html_in_title   check (title !~ '<[^>]+>'),
  constraint no_html_in_message check (message !~ '<[^>]+>')
);

create table public.notification_recipients (
  id              uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  recipient_id    uuid not null references public.users(id) on delete cascade,
  read_at         timestamptz null,
  delivered_at    timestamptz not null default now(),

  unique (notification_id, recipient_id)
);

create index idx_notifications_created_by on public.notifications(created_by);
create index idx_notifications_status on public.notifications(status);
create index idx_notification_recipients_recipient on public.notification_recipients(recipient_id);

alter table public.notifications enable row level security;
alter table public.notification_recipients enable row level security;

create policy "notifications_insert_admin"
on public.notifications
for insert
with check ( current_user_role() = 'admin' );

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
  current_user_role() = 'admin'
  or created_by = auth.uid()
)
with check (
  current_user_role() = 'admin'
  or created_by = auth.uid()
);

create policy "notifications_delete_admin_only"
on public.notifications
for delete
using ( current_user_role() = 'admin' );

create policy "notifications_select_admin_all"
on public.notifications
for select
using ( current_user_role() = 'admin' );

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

create policy "recipients_select_own"
on public.notification_recipients
for select
using ( recipient_id = auth.uid() );

create policy "recipients_select_admin_all"
on public.notification_recipients
for select
using ( current_user_role() = 'admin' );

create policy "recipients_mark_own_read"
on public.notification_recipients
for update
using ( recipient_id = auth.uid() )
with check ( recipient_id = auth.uid() );

create policy "recipients_insert_admin_or_teacher"
on public.notification_recipients
for insert
with check ( current_user_role() in ('admin', 'teacher') );
