# 🏭 Helix Point — Procurement Desk

A shared web app for Helix Point Solution's material procurement:

1. **RFQ Generator** — build a ready-to-send RFQ email in your standard format.
2. **Quote Comparison** — paste supplier quotes; it normalises everything to a true
   **price per kg**, checks each quote's dimensions against your inquiry, and awards
   the best-value, spec-matched supplier.
3. **Supplier Scorecard** — weighted scoring + a shared supplier directory.

Saved RFQ rounds and the supplier directory are stored in **Supabase** so your whole
team sees the same data. Hosted on **Vercel**.

The app works fully **offline** too — Supabase just adds the shared/saved features.

---

## Deploy in 3 steps

### 1) Set up the database (Supabase — free)
1. Go to **https://supabase.com** → create a project (pick a strong DB password, any region near Malaysia e.g. Singapore).
2. Open **SQL Editor → New query**, paste all of [`supabase/schema.sql`](supabase/schema.sql), click **Run**.
3. Go to **Project Settings → API** and copy two values:
   - **Project URL** (e.g. `https://abcd1234.supabase.co`)
   - **anon public** key (a long `eyJ...` string — this one is safe to make public)

### 2) Add your keys
Open [`js/config.js`](js/config.js) and paste the two values:

```js
window.PROCUREMENT_CONFIG = {
  SUPABASE_URL: "https://abcd1234.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGci..."
};
```

Commit and push the change. (You can also enter them in the app's **⚙️ Setup**
button to test first — that only saves to your own browser.)

### 3) Host on Vercel
1. Go to **https://vercel.com**, sign in with GitHub.
2. **Add New → Project → Import** this repo (`HelixPointSolution/workshoptool`).
3. Framework preset: **Other**. Build command: none. Output directory: **/** (root).
4. **Deploy.** You get a URL like `https://workshoptool.vercel.app` — **share that with your team.**

Every time you push to GitHub, Vercel redeploys automatically.

---

## Run locally
```bash
npx serve .
```
Then open the printed `http://localhost:...` address. (A plain static server is enough — there is no build step.)

---

## Security note
The included policies let **anyone with the site URL** read and write data — fine for an
internal team tool. To restrict it to signed-in staff later, enable **Supabase Auth** and
replace the `anon` policies in `schema.sql` with policies scoped to `authenticated`.
Never commit your Supabase **service_role** key — only the **anon** key belongs in this app.

---

## Project layout
```
index.html          app shell + tabs
css/styles.css      styling
js/config.js        ← your Supabase URL + anon key go here
js/app.js           all app logic (RFQ, comparison maths, scorecard, sync)
supabase/schema.sql database setup — run once in Supabase
vercel.json         static hosting config
```

Built for Helix Point Solution · Penang.
