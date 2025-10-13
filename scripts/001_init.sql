-- Customers
create table if not exists public.customers (
  id bigint generated always as identity primary key,
  name text not null,
  phone text unique,
  created_at timestamp with time zone default now()
);

-- Queues
create table if not exists public.queues (
  id bigint generated always as identity primary key,
  customer_id bigint references public.customers(id) on delete set null,
  queue_number text not null,
  purpose text not null, -- tanya_harga/cetak/konsultasi_desain
  status text not null default 'ANTRIAN_BARU',
  order_code text unique not null,
  created_at timestamp with time zone default now()
);

-- Orders
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  order_code text unique not null,
  customer_id bigint references public.customers(id) on delete set null,
  product_type text not null,
  size text not null,
  quantity integer not null,
  material text not null,
  finishing text not null,
  notes text,
  price numeric not null default 0,
  payment_status text not null default 'UNPAID', -- UNPAID/DP/PAID
  status text not null default 'INQUIRY',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;
drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
for each row execute function public.set_updated_at();

-- Files
create table if not exists public.order_files (
  id bigint generated always as identity primary key,
  order_code text references public.orders(order_code) on delete cascade,
  file_url text not null,
  file_name text,
  kind text not null, -- FINAL/REF
  created_at timestamp with time zone default now()
);

-- Payments
create table if not exists public.payments (
  id bigint generated always as identity primary key,
  order_code text references public.orders(order_code) on delete cascade,
  amount numeric not null,
  method text not null, -- CASH/TRANSFER/QRIS
  kind text not null, -- DP/PAID
  created_at timestamp with time zone default now()
);

-- Tracking
create table if not exists public.order_tracking (
  id bigint generated always as identity primary key,
  order_code text references public.orders(order_code) on delete cascade,
  status text not null,
  created_at timestamp with time zone default now()
);

-- Price Index
create table if not exists public.price_index (
  id bigint generated always as identity primary key,
  product_type text not null,
  size text not null,
  material text not null,
  finishing_price numeric default 0,
  unit_price numeric not null,
  unique(product_type, size, material)
);

-- Profiles (roles)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('ADMIN','CS','EDITOR','KASIR','PRODUKSI','GUDANG')),
  created_at timestamp with time zone default now()
);

-- Simple view for dashboard joining needed fields
create or replace view public.orders_view as
select
  o.order_code,
  c.name as customer_name,
  o.status,
  case
    when o.status = 'ANTRIAN_BARU' then 'Antrian Baru'
    when o.status = 'INQUIRY' then 'Inquiry'
    when o.status = 'MENUNGGU_FILE_DESAIN' then 'Menunggu File/Desain'
    when o.status = 'SELESAI_EDIT_MENUNGGU_PEMBAYARAN' then 'Selesai Edit – Menunggu Pembayaran'
    when o.status = 'SUDAH_DIBAYAR_MENUNGGU_PRODUKSI' then 'Sudah Dibayar – Menunggu Produksi'
    when o.status = 'ON_PROCESS_CUTTING' then 'On Process – Cutting'
    when o.status = 'ON_PROCESS_PRINTING' then 'On Process – Printing'
    when o.status = 'ON_PROCESS_FINISHING' then 'On Process – Finishing'
    when o.status = 'QC_CHECKING' then 'QC – Checking'
    when o.status = 'READY_FOR_PICKUP' then 'Ready for Pickup'
    when o.status = 'BARANG_SUDAH_DIAMBIL' then 'Barang Sudah Diambil'
    else o.status
  end as status_readable,
  o.payment_status,
  o.created_at,
  o.updated_at,
  null::text as eta,
  null::text as handled_by
from public.orders o
left join public.customers c on c.id = o.customer_id;

-- Realtime
do $$
begin
  begin
    alter publication supabase_realtime add table public.order_tracking;
  exception
    when undefined_object then
      -- publication not present (e.g. local Postgres); ignore
      null;
  end;
end $$;

-- SECURITY: Enable RLS and policies
alter table public.customers enable row level security;
alter table public.queues enable row level security;
alter table public.orders enable row level security;
alter table public.order_files enable row level security;
alter table public.payments enable row level security;
alter table public.order_tracking enable row level security;
alter table public.price_index enable row level security;
alter table public.profiles enable row level security;

-- Helper function to check role
create or replace function public.current_role()
returns text language sql stable as $$
  select (auth.jwt() ->> 'user_metadata')::json ->> 'role';
$$;

-- Policies (simplified): allow read for authenticated; restrict writes by role
-- READ policies
create policy read_all_customers on public.customers
for select to authenticated using (true);

create policy read_all_orders on public.orders
for select to authenticated using (true);

create policy read_all_files on public.order_files
for select to authenticated using (true);

create policy read_all_payments on public.payments
for select to authenticated using (true);

create policy read_all_tracking on public.order_tracking
for select to authenticated using (true);

create policy read_all_queue on public.queues
for select to authenticated using (true);

create policy read_price_index on public.price_index
for select to authenticated using (true);

create policy read_profiles on public.profiles
for select to authenticated using (auth.uid() = user_id);

-- WRITE policies by module
-- CS: create queues, create orders
create policy cs_insert_queue on public.queues
for insert to authenticated with check (coalesce(public.current_role(),'') in ('ADMIN','CS'));

create policy cs_insert_order on public.orders
for insert to authenticated with check (coalesce(public.current_role(),'') in ('ADMIN','CS','EDITOR'));

-- Editor: attach files, update order to waiting payment
create policy editor_insert_file on public.order_files
for insert to authenticated with check (coalesce(public.current_role(),'') in ('ADMIN','EDITOR'));

create policy editor_update_order on public.orders
for update to authenticated using (true)
with check (coalesce(public.current_role(),'') in ('ADMIN','EDITOR'));

-- Kasir: insert payments and update payment status
create policy kasir_insert_payment on public.payments
for insert to authenticated with check (coalesce(public.current_role(),'') in ('ADMIN','KASIR'));

create policy kasir_update_order on public.orders
for update to authenticated using (true)
with check (coalesce(public.current_role(),'') in ('ADMIN','KASIR'));

-- Produksi: update status and track
create policy produksi_insert_tracking on public.order_tracking
for insert to authenticated with check (coalesce(public.current_role(),'') in ('ADMIN','PRODUKSI','EDITOR','KASIR','GUDANG'));

create policy produksi_update_order on public.orders
for update to authenticated using (true)
with check (coalesce(public.current_role(),'') in ('ADMIN','PRODUKSI'));

-- Gudang: finalize pickup
create policy gudang_update_order on public.orders
for update to authenticated using (true)
with check (coalesce(public.current_role(),'') in ('ADMIN','GUDANG'));

-- Admin can manage price index
create policy admin_insert_price on public.price_index
for insert to authenticated with check (coalesce(public.current_role(),'') in ('ADMIN'));

create policy admin_update_price on public.price_index
for update to authenticated using (true)
with check (coalesce(public.current_role(),'') in ('ADMIN'));

-- Profiles only user can update own role if admin (set role via backend normally)
create policy admin_manage_profiles on public.profiles
for all to authenticated using (coalesce(public.current_role(),'') = 'ADMIN') with check (coalesce(public.current_role(),'') = 'ADMIN');
