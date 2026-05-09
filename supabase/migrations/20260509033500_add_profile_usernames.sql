ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_unique
ON public.profiles (lower(username))
WHERE username IS NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  requested_username TEXT;
BEGIN
  requested_username := lower(regexp_replace(COALESCE(NEW.raw_user_meta_data->>'username', ''), '[^a-z0-9_]', '', 'g'));

  INSERT INTO public.profiles (id, username, display_name, avatar_color)
  VALUES (
    NEW.id,
    NULLIF(requested_username, ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name', ''), NULLIF(requested_username, ''), 'PILOT_' || substr(replace(NEW.id::text,'-',''),1,6)),
    (ARRAY['green','magenta','cyan','yellow'])[1 + floor(random()*4)::int]
  );
  RETURN NEW;
END; $$;
