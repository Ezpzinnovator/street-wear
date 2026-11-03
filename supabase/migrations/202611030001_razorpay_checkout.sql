-- Trusted Razorpay checkout and order persistence.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending_payment',
  payment_status text not null default 'pending',
  currency text not null default 'INR',
  subtotal_amount numeric(12,2) not null default 0,
  shipping_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  razorpay_payment_link_id text unique,
  razorpay_payment_link_reference_id text unique,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.orders alter column user_id drop not null;
alter table public.orders add column if not exists razorpay_payment_link_id text;
alter table public.orders add column if not exists razorpay_payment_link_reference_id text;
alter table public.orders add column if not exists razorpay_payment_id text;
alter table public.orders alter column status set default 'pending_payment';

create unique index if not exists orders_razorpay_payment_link_id_uidx
  on public.orders(razorpay_payment_link_id)
  where razorpay_payment_link_id is not null;
create unique index if not exists orders_razorpay_reference_id_uidx
  on public.orders(razorpay_payment_link_reference_id)
  where razorpay_payment_link_reference_id is not null;
create unique index if not exists orders_razorpay_payment_id_uidx
  on public.orders(razorpay_payment_id)
  where razorpay_payment_id is not null;
create index if not exists orders_user_created_idx
  on public.orders(user_id, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image_url text,
  selected_size text,
  selected_color text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total >= 0)
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Customers read own orders" on public.orders;
create policy "Customers read own orders"
  on public.orders for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Customers read own order items" on public.order_items;
create policy "Customers read own order items"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );
