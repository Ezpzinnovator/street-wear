-- Newsletter signups collected by the public footer form.
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now(),
  source text not null default 'website_footer'
);

alter table public.newsletter_subscribers enable row level security;

-- Visitors may subscribe, but cannot read the subscriber list.
grant insert on table public.newsletter_subscribers to anon, authenticated;

drop policy if exists "Visitors can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Visitors can subscribe to newsletter"
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (
    length(email) <= 254
    and email = lower(trim(email))
    and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    and source = 'website_footer'
  );
