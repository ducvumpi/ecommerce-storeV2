-- Restrict customer/order data to its authenticated owner.
-- Review and apply through Supabase SQL Editor after taking a database backup.

begin;

-- Remove the permissive policy that currently grants every command to PUBLIC.
drop policy if exists "Enable read access for all users" on public.orders;
drop policy if exists "Enable read access for all users" on public.order_items;
drop policy if exists "Enable read access for all users" on public.addresses;
drop policy if exists "Enable read access for all users" on public.profiles;
drop policy if exists "Allow anon read profiles" on public.profiles;

-- Drop the prior broad admin policy: user_metadata is user-editable and must
-- never be used as an authorization source.
drop policy if exists "admin_all" on public.profiles;

-- Orders: customers can read/update only their own orders. Inserts are made
-- exclusively through the checked SECURITY DEFINER checkout RPC below.
drop policy if exists "orders_select_own" on public.orders;
drop policy if exists "orders_update_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select to authenticated
  using (user_id = (select auth.uid()));
create policy "orders_update_own"
  on public.orders for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Order lines are visible only when the parent order belongs to this user.
drop policy if exists "order_items_select_own_order" on public.order_items;
create policy "order_items_select_own_order"
  on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = (select auth.uid())
  ));

-- Address rows must be attached to the authenticated owner.
drop policy if exists "addresses_select_own" on public.addresses;
drop policy if exists "addresses_insert_own" on public.addresses;
drop policy if exists "addresses_update_own" on public.addresses;
drop policy if exists "addresses_delete_own" on public.addresses;
create policy "addresses_select_own"
  on public.addresses for select to authenticated
  using (user_id = (select auth.uid()));
create policy "addresses_insert_own"
  on public.addresses for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "addresses_update_own"
  on public.addresses for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "addresses_delete_own"
  on public.addresses for delete to authenticated
  using (user_id = (select auth.uid()));

-- Profiles: own-row access, plus admin access only from trusted app_metadata.
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "self_select" on public.profiles;
drop policy if exists "self_update" on public.profiles;
drop policy if exists "profiles_admin_app_metadata" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
create policy "profiles_admin_app_metadata"
  on public.profiles for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Defense in depth for SECURITY DEFINER checkout functions: RLS may be bypassed
-- by a definer, but the request JWT identity remains available to this trigger.
create or replace function public.enforce_customer_row_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is null or new.user_id is distinct from auth.uid() then
    raise exception 'row owner must match authenticated user'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists orders_enforce_customer_owner on public.orders;
create trigger orders_enforce_customer_owner
  before insert or update of user_id on public.orders
  for each row execute function public.enforce_customer_row_owner();

drop trigger if exists addresses_enforce_customer_owner on public.addresses;
create trigger addresses_enforce_customer_owner
  before insert or update of user_id on public.addresses
  for each row execute function public.enforce_customer_row_owner();

-- The checkout RPC is SECURITY DEFINER and accepts a user id as an argument.
-- Add an identity check before its original body so one signed-in user cannot
-- create an order/address against another account. Keep the original body and
-- signature intact; fail loudly if the expected function is absent or changes.
do $$
declare
  function_oid oid;
  function_definition text;
begin
  select p.oid into function_oid
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'create_order_from_cart_full'
    and pg_get_function_identity_arguments(p.oid) =
      'p_user_id uuid, p_full_name text, p_phone text, p_address_line text, p_city text, p_ward text, p_mail text, p_selected_items uuid[], p_address_id uuid, p_save_address boolean, p_payment_method text';

  if function_oid is null then
    raise exception 'Expected checkout RPC signature was not found';
  end if;

  function_definition := pg_get_functiondef(function_oid);
  if position('user id must match authenticated user' in function_definition) = 0 then
    if function_definition !~* '\mbegin\M' then
      raise exception 'Could not safely locate checkout RPC body';
    end if;

    function_definition := regexp_replace(
      function_definition,
      '\mbegin\M',
      E'BEGIN\n  IF auth.uid() IS NULL OR p_user_id IS DISTINCT FROM auth.uid() THEN\n    RAISE EXCEPTION ''user id must match authenticated user'' USING ERRCODE = ''42501'';\n  END IF;\n',
      'i'
    );
    execute function_definition;
  end if;
end;
$$;

revoke execute on function public.create_order_from_cart_full(
  uuid, text, text, text, text, text, text, uuid[], uuid, boolean, text
) from public, anon;
grant execute on function public.create_order_from_cart_full(
  uuid, text, text, text, text, text, text, uuid[], uuid, boolean, text
) to authenticated;

commit;
