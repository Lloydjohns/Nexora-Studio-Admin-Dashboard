/*
# Restrict signup to the agency email domain

## Why
Every table's RLS policy is `TO authenticated USING (true)` — meaning *any*
signed-in user can read and write all client, finance, and lead data. Combined
with an open signup form, anyone on the internet could register and read the
whole database.

Checking the domain in the React form is not enough: the signup endpoint is a
public HTTP API, so anyone can POST directly to /auth/v1/signup and skip the
client entirely. The check has to live in the database.

## What this does
Adds a BEFORE INSERT trigger on auth.users that rejects any email outside the
allowed domain.

## Note on behaviour
This applies to *every* insert into auth.users, including users you create by
hand in the Supabase dashboard. To onboard someone on a different domain,
change `allowed_domain` below, or drop the trigger, add the user, re-create it.

GoTrue surfaces a trigger exception as a generic "Database error saving new
user" rather than the message below, so the login form also shows its own
domain hint to set expectations before submit.
*/

CREATE OR REPLACE FUNCTION public.enforce_signup_domain()
RETURNS trigger
LANGUAGE plpgsql
-- SECURITY INVOKER (the default): this function only raises an exception and
-- needs no elevated privileges. SECURITY DEFINER here would be needless risk.
SET search_path = ''
AS $$
DECLARE
  allowed_domain constant text := 'nexorastudio.ph';
BEGIN
  IF new.email IS NULL OR lower(new.email) NOT LIKE ('%@' || allowed_domain) THEN
    RAISE EXCEPTION 'Signups are restricted to @% email addresses.', allowed_domain
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN new;
END;
$$;

-- Postgres grants EXECUTE to PUBLIC on every newly created function, which would
-- expose this as a callable endpoint to the anon and authenticated roles.
-- It only ever needs to run as a trigger.
REVOKE EXECUTE ON FUNCTION public.enforce_signup_domain() FROM PUBLIC;

-- The role GoTrue uses to insert new users must still be able to run it.
GRANT EXECUTE ON FUNCTION public.enforce_signup_domain() TO supabase_auth_admin;

DROP TRIGGER IF EXISTS enforce_signup_domain ON auth.users;
CREATE TRIGGER enforce_signup_domain
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.enforce_signup_domain();
