-- 선진산업 Business AX — Supabase 기본 스키마 (선택 사항)
-- 환경변수(NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)가 없으면
-- 앱은 Demo Mode(로컬 시드 데이터)로 완전히 동작합니다.

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ceo_name text,
  biz_type text,
  region text,
  created_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  name text not null,
  role text,
  created_at timestamptz default now()
);

create table if not exists customers (
  id text primary key,
  company_id uuid references companies(id),
  name text not null,
  contact_name text,
  region text,
  segment text,
  since text,
  preferred_materials text[],
  preferred_colors text[],
  preferred_thickness numrange,
  preferred_grades text[],
  avg_repurchase_cycle_days int,
  memo text
);

create table if not exists leather_products (
  id text primary key,
  code text not null,
  name text not null,
  material text,
  color text,
  thickness_mm numeric,
  grade text,
  finish text,
  unit text default '평'
);

create table if not exists inventory_items (
  id text primary key,
  product_id text references leather_products(id),
  stock_qty numeric,
  cost_per_unit numeric,
  list_price_per_unit numeric,
  received_date date
);

create table if not exists sales_transactions (
  id text primary key,
  date date not null,
  customer_id text references customers(id),
  product_id text references leather_products(id),
  qty numeric,
  unit_price numeric
);

create table if not exists quotes (
  id text primary key,
  number text not null,
  customer_id text references customers(id),
  status text,
  created_at date,
  memo text,
  source text
);

create table if not exists quote_items (
  id bigserial primary key,
  quote_id text references quotes(id),
  product_id text references leather_products(id),
  qty numeric,
  unit_price numeric
);

create table if not exists recommendations (
  id text primary key,
  category text,
  priority text,
  title text,
  payload jsonb,
  created_at timestamptz default now()
);

create table if not exists alerts (
  id text primary key,
  category text,
  title text,
  body text,
  date date,
  href text
);

create table if not exists activities (
  id text primary key,
  date date,
  customer_id text references customers(id),
  type text,
  memo text
);
