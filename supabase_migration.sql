-- Run this in Supabase SQL Editor

-- Buyer activity table (realtime feed for seller)
create table if not exists buyer_activity (
  id uuid default gen_random_uuid() primary key,
  seller_id text not null,
  buyer_phone text not null,
  action text not null, -- view | add_to_cart | order | return | negotiate | negotiate_accept
  payload jsonb default '{}',
  created_at timestamptz default now()
);

-- Enable realtime on buyer_activity
alter publication supabase_realtime add table buyer_activity;

-- Orders table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  seller_id text not null,
  buyer_phone text not null,
  items jsonb default '[]',
  total numeric not null default 0,
  status text not null default 'pending',
  negotiated_price numeric,
  created_at timestamptz default now()
);

-- RLS
alter table buyer_activity enable row level security;
alter table orders enable row level security;

-- Allow insert from buyer (anon)
create policy "Anyone can insert activity" on buyer_activity for insert to anon with check (true);
create policy "Anyone can insert orders"   on orders           for insert to anon with check (true);
create policy "Anyone can read own orders" on orders           for select to anon using (true);
create policy "Seller can read activity"   on buyer_activity   for select to anon using (true);
create policy "Seller can update orders"   on orders           for update to anon using (true);

-- Index for realtime query performance
create index if not exists idx_buyer_activity_seller on buyer_activity(seller_id, created_at desc);
create index if not exists idx_orders_seller         on orders(seller_id, created_at desc);
create index if not exists idx_orders_buyer          on orders(buyer_phone, seller_id);
