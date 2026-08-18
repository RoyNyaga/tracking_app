-- 1. Profiles Table (Linked to Supabase Auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;
create policy "Allow public read access to profiles" on public.profiles for select using (true);
create policy "Allow individual insert to profiles" on public.profiles for insert with check (auth.uid() = id);
create policy "Allow individual update to profiles" on public.profiles for update using (auth.uid() = id);

-- 2. Companies Table
create table if not exists public.companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  tenant_slug text not null unique,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for companies
alter table public.companies enable row level security;
create policy "Allow public read access to companies" on public.companies for select using (true);
create policy "Allow authenticated inserts to companies" on public.companies for insert with check (auth.uid() = created_by);
create policy "Allow owners update access to companies" on public.companies for update using (true); -- basic permissive rule for dev

-- Seed default company for Global Load Logistics
insert into public.companies (id, name, tenant_slug)
values ('11111111-1111-1111-1111-111111111111', 'Global Load Logistics', 'global-load-logistics')
on conflict (id) do nothing;

-- 3. Company Collaborators Table
create table if not exists public.company_collaborators (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade,
  invited_email text not null,
  role text not null check (role in ('owner', 'collaborator')),
  status text not null check (status in ('pending', 'active')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for collaborators
alter table public.company_collaborators enable row level security;
create policy "Allow read access to collaborators" on public.company_collaborators for select using (true);
create policy "Allow insert access to collaborators" on public.company_collaborators for insert with check (true);
create policy "Allow delete access to collaborators" on public.company_collaborators for delete using (true);

-- 4. Shipments Table
create table if not exists public.shipments (
  uuid uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  date date default current_date not null,
  time text,
  visibility_status text default 'draft' not null check (visibility_status in ('draft', 'published')),
  location text default 'Pending' not null,
  shipper_name text,
  shipper_phone_number text,
  shipper_address text,
  shipper_email text,
  receiver_name text,
  receiver_phone_number text,
  receiver_address text,
  receiver_email text,
  type_of_shipment text,
  weight numeric default 0,
  courier text,
  mode text,
  product text,
  quantity integer default 0,
  payment_mode text,
  total_freight numeric default 0,
  carrier text,
  carrier_reference_no text not null,
  departure_time text,
  origin text,
  destination text,
  pickup_date date,
  pickup_time text,
  expected_delivery_date date,
  comments text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for shipments
alter table public.shipments enable row level security;
create policy "Allow read access to shipments" on public.shipments for select using (true);
create policy "Allow insert access to shipments" on public.shipments for insert with check (true);
create policy "Allow update access to shipments" on public.shipments for update using (true);
create policy "Allow delete access to shipments" on public.shipments for delete using (true);

-- 5. Packages Table
create table if not exists public.packages (
  id uuid default gen_random_uuid() primary key,
  shipment_id uuid references public.shipments(uuid) on delete cascade not null,
  quantity integer default 1,
  piece_type text,
  description text,
  length numeric default 0,
  width numeric default 0,
  height numeric default 0,
  weight numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for packages
alter table public.packages enable row level security;
create policy "Allow read access to packages" on public.packages for select using (true);
create policy "Allow insert access to packages" on public.packages for insert with check (true);
create policy "Allow update access to packages" on public.packages for update using (true);
create policy "Allow delete access to packages" on public.packages for delete using (true);

-- 6. Contact Messages Table
create table if not exists public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  sender_name text not null,
  sender_email text not null,
  subject text not null,
  message text not null,
  status text default 'unread' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for contact messages
alter table public.contact_messages enable row level security;
create policy "Allow read access to contact messages" on public.contact_messages for select using (true);
create policy "Allow insert access to contact messages" on public.contact_messages for insert with check (true);
create policy "Allow delete access to contact messages" on public.contact_messages for delete using (true);
