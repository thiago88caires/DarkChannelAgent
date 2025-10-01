-- Setup minimal database structure
-- Let GoTrue use public schema (default behavior)

-- Basic roles (check if they exist first)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOINHERIT;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN  
    CREATE ROLE authenticated NOINHERIT;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOINHERIT BYPASSRLS;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'your-super-secret-and-long-postgres-password';
  END IF;
END
$$;

-- Grant role hierarchy
GRANT anon, authenticated, service_role TO authenticator;

-- Schema permissions
GRANT USAGE ON SCHEMA public TO authenticator, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA auth TO authenticator, service_role;
GRANT CREATE ON SCHEMA auth TO authenticator;
GRANT CREATE ON SCHEMA auth TO service_role;
GRANT CREATE ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Set search path for authenticator to include auth schema
ALTER ROLE authenticator SET search_path = auth, public;

-- Set default privileges for future objects in public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

-- Drop tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS public.videos CASCADE;
DROP TABLE IF EXISTS public.youtube_channels CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.genres_pt_br CASCADE;
DROP TABLE IF EXISTS public.genres_en CASCADE;
DROP TABLE IF EXISTS public.genres_es CASCADE;
DROP TABLE IF EXISTS public.genres CASCADE;

-- Consolidated genres table with language support
CREATE TABLE public.genres (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  language text NOT NULL CHECK (language IN ('pt-BR', 'en', 'es')),
  genre text NOT NULL,
  description text,
  structure text,
  tone text,
  video_title text,
  video_description text,
  video_tags text,
  elements text,
  composition_rules text,
  techniques text,
  lighting_and_atmosphere text,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  updated_at timestamp with time zone DEFAULT timezone('utc', now()),
  UNIQUE(language, genre)
);

CREATE INDEX genres_language_idx ON public.genres(language);
CREATE INDEX genres_genre_idx ON public.genres(genre);

-- Users and video workflow tables
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  name text,
  email text UNIQUE NOT NULL,
  credits integer NOT NULL DEFAULT 0,
  role text NOT NULL DEFAULT 'user',
  phone text,
  found_us text,
  preferred_language text
);

CREATE TABLE public.youtube_channels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  user_email text NOT NULL REFERENCES public.users(email) ON DELETE CASCADE,
  name text NOT NULL,
  oauth_encrypted text
);

CREATE INDEX youtube_channels_user_email_idx ON public.youtube_channels(user_email);

CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  user_email text NOT NULL REFERENCES public.users(email) ON DELETE CASCADE,
  channel_id text,
  video_file text,
  language text NOT NULL,
  video_yt_url text,
  status text NOT NULL DEFAULT 'Draft',
  genre text,
  screenplay text,
  description text,
  structure text,
  tone text,
  video_title text,
  video_description text,
  video_tags text,
  elements text,
  composition_rules text,
  techniques text,
  lighting_and_atmosphere text,
  character_count integer
);

CREATE INDEX videos_user_email_idx ON public.videos(user_email);
CREATE INDEX videos_status_idx ON public.videos(status);

-- Grant permissions on new tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Enable RLS on tables (but keep policies simple)
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies that work without auth.email()
-- Service role can access everything
CREATE POLICY "Service role can access all genres" ON public.genres FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all users" ON public.users FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all channels" ON public.youtube_channels FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all videos" ON public.videos FOR ALL TO service_role USING (true);

-- Public read access to genres (they are reference data)
CREATE POLICY "Public read access to genres" ON public.genres FOR SELECT TO authenticated, anon USING (true);

-- Authenticated users can access all data (simplified for now)
CREATE POLICY "Authenticated users can access users" ON public.users FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access channels" ON public.youtube_channels FOR ALL TO authenticated USING (true);  
CREATE POLICY "Authenticated users can access videos" ON public.videos FOR ALL TO authenticated USING (true);

