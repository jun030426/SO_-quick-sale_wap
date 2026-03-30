# Quick Sale Deployment

## 1. Supabase project

1. Create a new Supabase project.
2. In the SQL Editor, run `supabase/schema.sql`.
3. If you want the same starter listings, run `supabase/seed.sql`.
4. In `Authentication > Providers`, enable Email.
5. Create your first account through the site or Supabase Auth.

## 2. Promote an admin

Run this once in the SQL Editor after creating your own account:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

## 3. Netlify environment variables

Set these in the Netlify site dashboard:

```bash
VITE_BACKEND_MODE=supabase
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

`netlify.toml` already configures the SPA redirect and publish directory.

## 4. Local development

- `npm run dev` keeps the existing local Express server + Vite flow for fallback development.
- `npm run dev:client` is enough when you are testing directly against Supabase.

## 5. Production behavior

- With Supabase env vars: full auth, alerts, inquiries, submissions, admin dashboard.
- With only local API: current Express + SQLite fallback.
- With no backend config: read-only preview mode so the deployed site never points at a dead `/api`.
