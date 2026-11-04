-- Fulfillment workflow for AKURA admin order management.
alter table public.orders
  add column if not exists fulfillment_status text not null default 'new',
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz;

alter table public.orders
  drop constraint if exists orders_fulfillment_status_check;

alter table public.orders
  add constraint orders_fulfillment_status_check
  check (fulfillment_status in ('new', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'));

create index if not exists orders_fulfillment_created_idx
  on public.orders(fulfillment_status, created_at desc);
