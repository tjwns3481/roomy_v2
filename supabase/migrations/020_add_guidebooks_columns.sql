-- Add missing columns to guidebooks table for Clerk compatibility
-- Run this in Supabase Dashboard > SQL Editor

ALTER TABLE public.guidebooks ADD COLUMN IF NOT EXISTS title TEXT DEFAULT '';
ALTER TABLE public.guidebooks ADD COLUMN IF NOT EXISTS slug TEXT DEFAULT '';
ALTER TABLE public.guidebooks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE public.guidebooks ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'modern';
ALTER TABLE public.guidebooks ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#2563EB';
ALTER TABLE public.guidebooks ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#F97316';
ALTER TABLE public.guidebooks ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;
ALTER TABLE public.guidebooks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.guidebooks ADD COLUMN IF NOT EXISTS is_password_protected BOOLEAN DEFAULT FALSE;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_guidebooks_slug ON public.guidebooks(slug);
