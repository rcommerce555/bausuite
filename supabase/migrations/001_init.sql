create extension if not exists pgcrypto;

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'core',
  region text not null default 'eu',
  created_at timestamptz not null default now()
);

create table if not exists users_profile (
  id uuid primary key,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner','admin','sales','project_manager','site_manager','backoffice','viewer')),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create table if not exists tenant_modules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  module_key text not null check (module_key in ('docs','site','claims','admin')),
  status text not null default 'active',
  activated_at timestamptz not null default now(),
  unique (tenant_id, module_key)
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  code text,
  customer_name text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  title text not null,
  file_path text,
  doc_type text,
  content_text text,
  ai_summary text,
  risk_score integer check (risk_score between 0 and 100),
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists document_insights (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  risk_items jsonb not null default '[]'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  entities jsonb not null default '[]'::jsonb,
  raw_output jsonb,
  created_at timestamptz not null default now()
);

create table if not exists site_reports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  title text not null,
  source_notes text not null,
  ai_summary text,
  blockers jsonb not null default '[]'::jsonb,
  tasks jsonb not null default '[]'::jsonb,
  daily_report_text text,
  risk_score integer check (risk_score between 0 and 100),
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete set null,
  source text not null default 'website',
  name text not null,
  company text not null,
  email text not null,
  phone text,
  pain text,
  stage text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  user_id uuid,
  action text not null,
  entity_type text,
  entity_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  user_id uuid,
  module_key text,
  event_type text not null,
  units integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists billing_customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references tenants(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references tenants(id) on delete cascade,
  stripe_subscription_id text not null unique,
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.is_tenant_member(target_tenant uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from memberships m
    where m.tenant_id = target_tenant
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.has_tenant_role(target_tenant uuid, allowed_roles text[])
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from memberships m
    where m.tenant_id = target_tenant
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = any(allowed_roles)
  );
$$;

alter table tenants enable row level security;
alter table users_profile enable row level security;
alter table memberships enable row level security;
alter table tenant_modules enable row level security;
alter table projects enable row level security;
alter table documents enable row level security;
alter table document_insights enable row level security;
alter table site_reports enable row level security;
alter table leads enable row level security;
alter table audit_events enable row level security;
alter table usage_events enable row level security;
alter table billing_customers enable row level security;
alter table billing_subscriptions enable row level security;

create policy "members can read own tenant" on tenants for select using (public.is_tenant_member(id));
create policy "members can read own profile" on users_profile for select using (id = auth.uid());

create policy "members can read memberships" on memberships for select using (public.is_tenant_member(tenant_id));
create policy "admins can manage memberships" on memberships for all using (public.has_tenant_role(tenant_id, array['owner','admin'])) with check (public.has_tenant_role(tenant_id, array['owner','admin']));

create policy "members can read modules" on tenant_modules for select using (public.is_tenant_member(tenant_id));
create policy "admins can manage modules" on tenant_modules for all using (public.has_tenant_role(tenant_id, array['owner','admin'])) with check (public.has_tenant_role(tenant_id, array['owner','admin']));

create policy "members can read projects" on projects for select using (public.is_tenant_member(tenant_id));
create policy "project roles can write projects" on projects for insert with check (public.has_tenant_role(tenant_id, array['owner','admin','project_manager','site_manager','backoffice']));
create policy "project roles can update projects" on projects for update using (public.has_tenant_role(tenant_id, array['owner','admin','project_manager','site_manager','backoffice'])) with check (public.has_tenant_role(tenant_id, array['owner','admin','project_manager','site_manager','backoffice']));

create policy "members can read documents" on documents for select using (public.is_tenant_member(tenant_id));
create policy "authorized roles can insert documents" on documents for insert with check (public.has_tenant_role(tenant_id, array['owner','admin','project_manager','site_manager','backoffice']));
create policy "authorized roles can update documents" on documents for update using (public.has_tenant_role(tenant_id, array['owner','admin','project_manager','site_manager','backoffice'])) with check (public.has_tenant_role(tenant_id, array['owner','admin','project_manager','site_manager','backoffice']));

create policy "members can read document insights" on document_insights for select using (
  exists (
    select 1 from documents d
    where d.id = document_insights.document_id
      and public.is_tenant_member(d.tenant_id)
  )
);
create policy "authorized roles can insert document insights" on document_insights for insert with check (
  exists (
    select 1 from documents d
    where d.id = document_insights.document_id
      and public.has_tenant_role(d.tenant_id, array['owner','admin','project_manager','site_manager','backoffice'])
  )
);

create policy "members can read site reports" on site_reports for select using (public.is_tenant_member(tenant_id));
create policy "authorized roles can insert site reports" on site_reports for insert with check (public.has_tenant_role(tenant_id, array['owner','admin','project_manager','site_manager','backoffice']));
create policy "authorized roles can update site reports" on site_reports for update using (public.has_tenant_role(tenant_id, array['owner','admin','project_manager','site_manager','backoffice'])) with check (public.has_tenant_role(tenant_id, array['owner','admin','project_manager','site_manager','backoffice']));

create policy "members can read leads in tenant" on leads for select using (tenant_id is not null and public.is_tenant_member(tenant_id));
create policy "admins and sales can manage leads" on leads for all using (tenant_id is not null and public.has_tenant_role(tenant_id, array['owner','admin','sales'])) with check (tenant_id is not null and public.has_tenant_role(tenant_id, array['owner','admin','sales']));

create policy "members can read audit events" on audit_events for select using (public.is_tenant_member(tenant_id));
create policy "members can read usage events" on usage_events for select using (public.is_tenant_member(tenant_id));

create policy "members can read billing customers" on billing_customers for select using (public.is_tenant_member(tenant_id));
create policy "admins can read billing subscriptions" on billing_subscriptions for select using (public.has_tenant_role(tenant_id, array['owner','admin']));

insert into tenants (name, slug, plan, region)
values ('Demo Nordbau GmbH', 'demo-nordbau', 'core', 'eu')
on conflict (slug) do nothing;

insert into tenant_modules (tenant_id, module_key, status)
select t.id, m.module_key, 'active'
from tenants t
cross join (values ('docs'), ('site'), ('admin')) as m(module_key)
where t.slug = 'demo-nordbau'
on conflict (tenant_id, module_key) do nothing;

insert into projects (tenant_id, name, code, customer_name, status)
select id, 'Neubau Logistikhalle Nord', 'LOG-001', 'Nordbau Kunde', 'active'
from tenants
where slug = 'demo-nordbau'
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "tenant members can read document storage"
on storage.objects for select
using (
  bucket_id = 'documents'
  and public.is_tenant_member((select id from tenants where slug = split_part(name, '/', 1)))
);

create policy "tenant staff can upload document storage"
on storage.objects for insert
with check (
  bucket_id = 'documents'
  and public.has_tenant_role((select id from tenants where slug = split_part(name, '/', 1)), array['owner','admin','project_manager','site_manager','backoffice'])
);
