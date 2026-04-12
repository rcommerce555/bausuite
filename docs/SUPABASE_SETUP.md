# Supabase Setup

## 1. Projekt anlegen
- Neues Projekt in Supabase erstellen
- Region möglichst EU wählen

## 2. Werte übernehmen
In `.env.local` eintragen:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 3. Migration ausführen
SQL aus `supabase/migrations/001_init.sql` im SQL Editor ausführen.

## 4. Auth konfigurieren
- Email Login aktivieren
- Magic Link optional deaktivieren, wenn klassischer Password Login gewünscht ist
- Redirect URLs setzen:
  - `http://localhost:3000`
  - `https://deine-domain.tld`

## 5. Testnutzer anlegen
- User in Auth anlegen
- `users_profile` befüllen
- passende `membership` für den Demo-Tenant `demo-nordbau` anlegen

Beispiel SQL:
```sql
insert into users_profile (id, email, full_name)
values ('USER_UUID', 'demo@baufirma.de', 'Demo User')
on conflict (id) do nothing;

insert into memberships (tenant_id, user_id, role, status)
select t.id, 'USER_UUID', 'owner', 'active'
from tenants t where t.slug = 'demo-nordbau'
on conflict (tenant_id, user_id) do nothing;
```

## 6. Storage prüfen
Bucket `documents` wird in der Migration angelegt.
