-- Migration to add status enum to public.shipments table

-- 1. Create the custom enum type for shipment status
create type public.shipment_status as enum (
  'pending',
  'picked_up',
  'on_hold',
  'out_for_deliver',
  'in_transit',
  'enroute',
  'cancelled',
  'delivered',
  'returned'
);

-- 2. Add the status column to the shipments table, defaulting to 'pending'
alter table public.shipments 
add column if not exists status public.shipment_status default 'pending'::public.shipment_status not null;
