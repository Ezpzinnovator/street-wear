-- Idempotent inventory deduction for paid AKURA orders.
-- Apply this migration before deploying code that calls process_paid_order_inventory.

alter table public.orders
  add column if not exists inventory_deducted boolean not null default false,
  add column if not exists inventory_issue text;

create or replace function public.process_paid_order_inventory(
  p_order_id uuid,
  p_payment_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
  v_stock integer;
  v_issue text := null;
begin
  select *
    into v_order
    from public.orders
   where id = p_order_id
   for update;

  if not found then
    raise exception 'Order not found';
  end if;

  -- Duplicate callback/webhook deliveries must never deduct stock twice.
  if v_order.inventory_deducted then
    return jsonb_build_object('success', true, 'already_deducted', true);
  end if;

  -- Validate and lock every product before changing any stock.
  for v_item in
    select product_id, quantity, product_name
      from public.order_items
     where order_id = p_order_id
     order by product_id nulls last
  loop
    if v_item.product_id is null then
      v_issue := 'Missing product record for ' || v_item.product_name;
      exit;
    end if;

    select stock
      into v_stock
      from public.products
     where id = v_item.product_id
     for update;

    if not found then
      v_issue := 'Product record not found for ' || v_item.product_name;
      exit;
    end if;

    if v_stock < v_item.quantity then
      v_issue := 'Insufficient stock for ' || v_item.product_name ||
                 ': available ' || v_stock || ', ordered ' || v_item.quantity;
      exit;
    end if;
  end loop;

  -- Only deduct when every line can be fulfilled; never partially deduct an order.
  if v_issue is null then
    for v_item in
      select product_id, quantity
        from public.order_items
       where order_id = p_order_id
       order by product_id
    loop
      update public.products
         set stock = stock - v_item.quantity
       where id = v_item.product_id;
    end loop;
  end if;

  -- Record payment even if inventory is insufficient; never lose the paid order.
  update public.orders
     set status = 'placed',
         payment_status = 'paid',
         razorpay_payment_id = coalesce(p_payment_id, razorpay_payment_id),
         inventory_deducted = (v_issue is null),
         inventory_issue = v_issue,
         updated_at = now()
   where id = p_order_id;

  return jsonb_build_object(
    'success', true,
    'inventory_deducted', (v_issue is null),
    'inventory_issue', v_issue
  );
end;
$$;

revoke all on function public.process_paid_order_inventory(uuid, text) from public, anon, authenticated;
grant execute on function public.process_paid_order_inventory(uuid, text) to service_role;
