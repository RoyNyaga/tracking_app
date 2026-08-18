-- Migration to add updated_at column to public.shipments table

-- Add updated_at column if it does not exist (defaulting to current timestamp)
alter table public.shipments add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;
