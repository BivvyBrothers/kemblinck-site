# Backend van het contactformulier

De site is statisch (GitHub Pages). Het formulier onderaan de homepage post naar de
Supabase edge function `kemblinck-contact` in project "Samen" (`xyfvkmhkwcjqskxrcfrj`).

- `kemblinck-contact/index.ts`: de functie (verify_jwt UIT, eigen controles: CORS op
  kemblinck.nl, honeypot, 5 berichten per uur per afzender, 100 per dag totaal).
- `migratie_kemblinck_contactformulier.sql`: de tabel `public.kemblinck_contactberichten`
  (RLS aan zonder policies; alleen de service role schrijft en leest).
- Melding naar info@kemblinck.nl gaat via Resend met afzender
  `website@mail.tweehuizen.com` (het enige geverifieerde Resend-domein) en de
  invuller als reply-to. Daarvoor moet in Supabase de secret `RESEND_API_KEY`
  staan (Edge Functions > Secrets). Zonder die secret wordt het bericht wel
  bewaard, maar komt er geen mail; `mail_fout` in de tabel zegt dan waarom.

Deployen gebeurt via de Supabase MCP (`deploy_edge_function`) of
`supabase functions deploy kemblinck-contact --no-verify-jwt`.
Berichten nalezen: `select aangemaakt, naam, email, bericht, mail_verzonden, mail_fout
from public.kemblinck_contactberichten order by aangemaakt desc;`
