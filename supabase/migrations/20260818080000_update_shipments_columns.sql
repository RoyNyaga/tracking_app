-- Incremental migration to update public.shipments columns

-- 1. Remove old status column if it exists
alter table public.shipments drop column if exists status;

-- 2. Add location column if it does not exist (defaulting to 'Pending')
alter table public.shipments add column if not exists location text default 'Pending' not null;

-- 3. Update visibility_status defaults and check constraints
alter table public.shipments alter column visibility_status set default 'draft';

-- Update existing data to default draft value if they are not conforming to the new enum rule
update public.shipments 
set visibility_status = 'draft' 
where visibility_status is null 
   or visibility_status not in ('draft', 'published');

-- Re-apply visibility check constraint
alter table public.shipments drop constraint if exists shipments_visibility_status_check;
alter table public.shipments add constraint shipments_visibility_status_check check (visibility_status in ('draft', 'published'));
