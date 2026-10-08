# Supabase database

This directory tracks the application's database baseline and incremental SQL changes.
The SQL here is derived from the application code and the schema requirements known to
this repository; it has **not** been introspected against the live Supabase project.
Review it against the actual database before using it as a production restore.

## Files

- `schema.sql` — baseline schema snapshot for a new/empty Supabase project.
- `migrations/20261009_initial_schema.sql` — initial schema migration for a new project.
- `migrations/20261009_add_operating_system.sql` — adds the per-game platform field.

## Existing project

Do not replay the initial schema migration against a populated production database.
Check the Supabase migration history and compare the live schema first. If the
`operating_system` column is missing, run the incremental SQL in
`migrations/20261009_add_operating_system.sql` in the Supabase SQL Editor. It is safe
to rerun because it uses `IF NOT EXISTS` and fills null values.

## New project

1. Create a Supabase project.
2. Review `schema.sql` for environment-specific settings and policies.
3. Run it in the Supabase SQL Editor, or adopt the SQL through the Supabase CLI's
   migration workflow.
4. Create the first admin through the protected setup flow, then configure the
   server-side environment variables.

The baseline creates public read-only RLS policies for published content, categories,
settings, and legacy game links. It deliberately creates no public policy for
`admin_users`; server-side `SUPABASE_SECRET_KEY` usage bypasses RLS and must never be
exposed to the browser.

## Adding future schema changes

1. Add a timestamped file under `migrations/`, for example
   `20261010_add_some_column.sql`.
2. Make it safe and targeted for databases that have already applied the current
   baseline.
3. Apply it to the intended Supabase project and record the migration in that
   project's migration history.
4. Update `schema.sql` to represent the latest baseline for new installations.

## Backups

Use Supabase's managed backups where available. A schema snapshot is not a data backup.
Do not commit `.env.local`, database credentials, or exported production data.
