// ── Helix Point Procurement Desk — team database config ──────────────
// Fill these in ONCE to share saved rounds + the supplier directory with
// your whole team. Get them from your Supabase project:
//   Supabase dashboard → Project Settings → API
//
// The anon key is designed to be public (safe to commit and deploy).
// Row Level Security in supabase/schema.sql controls what it can do.
//
// Leave blank to run the app in local-only mode (works, but nothing is shared).

window.PROCUREMENT_CONFIG = {
  SUPABASE_URL: "https://iryftwfbrmbkvfinvycq.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_z_NlFB-fELF1hpL4tkQgRw_iXp51xAy"
  // ↑ Publishable (anon) key — safe to be public. NEVER put the sb_secret_ key here.
};
