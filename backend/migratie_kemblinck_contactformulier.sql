-- Contactformulier op kemblinck.nl (22 sep 2026). Alleen de edge function
-- kemblinck-contact schrijft hier (service role); niemand anders leest of schrijft.
-- Toegepast op project "Samen" (xyfvkmhkwcjqskxrcfrj) als migratie kemblinck_contactformulier.
create table public.kemblinck_contactberichten (
  id uuid primary key default gen_random_uuid(),
  aangemaakt timestamptz not null default now(),
  naam text not null check (char_length(naam) between 1 and 100),
  email text not null check (char_length(email) between 3 and 200),
  bericht text not null check (char_length(bericht) between 1 and 3000),
  ip_hash text,
  user_agent text,
  mail_verzonden boolean not null default false,
  mail_fout text,
  gelezen boolean not null default false
);
comment on table public.kemblinck_contactberichten is
  'Berichten uit het contactformulier op kemblinck.nl. Geschreven door edge function kemblinck-contact; RLS aan zonder policies, dus alleen de service role kan erbij.';
alter table public.kemblinck_contactberichten enable row level security;
revoke all on public.kemblinck_contactberichten from anon, authenticated;
create index kemblinck_contactberichten_ip_idx
  on public.kemblinck_contactberichten (ip_hash, aangemaakt desc);
