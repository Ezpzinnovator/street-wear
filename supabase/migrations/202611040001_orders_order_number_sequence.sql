-- Align the existing bigint order_number with a sequence.
-- This preserves all existing order records and assigns the next unused number.
create sequence if not exists public.orders_order_number_seq;

select setval(
  'public.orders_order_number_seq',
  coalesce((select max(order_number) from public.orders), 0) + 1,
  false
);

alter table public.orders
  alter column order_number set default nextval('public.orders_order_number_seq');

-- The server-side checkout uses the service_role key for trusted database writes.
grant usage on schema public to service_role;
grant select on table public.products to service_role;
grant select, insert, update, delete on table public.orders, public.order_items to service_role;
grant usage, select on sequence public.orders_order_number_seq to service_role;
