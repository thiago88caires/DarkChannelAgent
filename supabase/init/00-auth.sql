-- Initialize basic extensions for Supabase compatibility
-- Enable required extensions (available in standard PostgreSQL)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create auth schema for GoTrue (it will populate it)
create schema if not exists auth;