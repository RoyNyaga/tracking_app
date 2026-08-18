# Supabase Schema Reference (Current State)

Use this document as a clean reference for the entire database structure, reflecting all migrations applied up to the shipments columns update.

---

## 1. Profiles Table
Tracks user profiles synced from Supabase Auth.
```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text default 'user' not null check (role in ('admin', 'user')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## 2. Companies Table
Represents company workspaces.
```sql
create table public.companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## 3. Company Collaborators Table
Maps workspace collaborators and roles.
```sql
create table public.company_collaborators (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  invited_email text not null,
  role text not null check (role in ('owner', 'collaborator')),
  status text not null check (status in ('pending', 'active')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## 4. Shipments Table
Core shipment data. Tracks cargo metadata and transit location checkpoints.
```sql
create table public.shipments (
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
```

## 5. Packages Table
Packaging dimension details linked to shipments.
```sql
create table public.packages (
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
```

## 6. Contact Messages Table
Inbox feedback logs from users.
```sql
create table public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  sender_name text not null,
  sender_email text not null,
  subject text not null,
  message text not null,
  status text default 'unread' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```
