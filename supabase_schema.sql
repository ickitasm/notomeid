-- =========================================================================
-- NOTOME - Supabase Database Schema (with Auth & Gmail Isolation)
-- Run this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Media Items Table (Movies & TV Series)
CREATE TABLE IF NOT EXISTS public.media_items (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('movie', 'series')),
    status TEXT NOT NULL CHECK (status IN ('watchlist', 'watching', 'completed', 'dropped')),
    release_date DATE,
    rating NUMERIC(3, 1) DEFAULT 0.0,
    poster_url TEXT,
    genres TEXT[] DEFAULT '{}',
    notes TEXT,
    series_details JSONB, -- { totalSeasons, totalEpisodes, currentSeason, currentEpisode }
    scheduled_watch_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Daily Nutrition Logs Table
CREATE TABLE IF NOT EXISTS public.daily_nutrition_logs (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    date DATE NOT NULL,
    calories_consumed INT DEFAULT 0,
    calorie_goal INT DEFAULT 2100,
    sugar_grams NUMERIC(5, 1) DEFAULT 0,
    sugar_limit_grams NUMERIC(5, 1) DEFAULT 36,
    weight_kg NUMERIC(5, 2),
    water_ml INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- 4. Meal Items Table
CREATE TABLE IF NOT EXISTS public.meal_items (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    name TEXT NOT NULL,
    calories INT NOT NULL,
    sugar_grams NUMERIC(5, 1) DEFAULT 0,
    protein_grams NUMERIC(5, 1) DEFAULT 0,
    carbs_grams NUMERIC(5, 1) DEFAULT 0,
    fat_grams NUMERIC(5, 1) DEFAULT 0,
    time TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Pet Profiles Table
CREATE TABLE IF NOT EXISTS public.pet_profiles (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'other')),
    breed TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    weight_kg NUMERIC(5, 2) NOT NULL,
    microchip_id TEXT,
    avatar_url TEXT,
    allergies TEXT[] DEFAULT '{}',
    dietary_notes TEXT,
    vet_clinic_name TEXT,
    emergency_contact TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Pet Medical Records Table
CREATE TABLE IF NOT EXISTS public.pet_medical_records (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    pet_id TEXT NOT NULL REFERENCES public.pet_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('vaccine', 'checkup', 'medication', 'surgery', 'deworming', 'grooming', 'lab')),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    next_due_date DATE,
    clinic_name TEXT,
    veterinarian TEXT,
    cost NUMERIC(8, 2),
    notes TEXT,
    completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Pet Medications Table
CREATE TABLE IF NOT EXISTS public.pet_medications (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    pet_id TEXT NOT NULL REFERENCES public.pet_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Calendar Events Table
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT,
    category TEXT NOT NULL CHECK (category IN ('media', 'nutrition', 'pet', 'personal')),
    description TEXT,
    related_id TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_user ON public.media_items(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_user_date ON public.daily_nutrition_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON public.meal_items(user_id, date);
CREATE INDEX IF NOT EXISTS idx_pets_user ON public.pet_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_records_user ON public.pet_medical_records(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user ON public.calendar_events(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Per-User RLS Policies (Users can only see and manipulate their own records)
CREATE POLICY "Users access own media" ON public.media_items 
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users access own nutrition" ON public.daily_nutrition_logs 
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users access own meals" ON public.meal_items 
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users access own pets" ON public.pet_profiles 
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users access own pet records" ON public.pet_medical_records 
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users access own pet meds" ON public.pet_medications 
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users access own events" ON public.calendar_events 
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- =========================================================================
-- 9. Whitelist / Invited Users Table (Invite-Only Access Control)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.invited_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    notes TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('primary_admin', 'member')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    invited_by TEXT DEFAULT 'mike777rafael@gmail.com',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_invited_users_email ON public.invited_users(email);

-- Enable RLS on invited_users
ALTER TABLE public.invited_users ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone authenticated can verify their own invitation status
CREATE POLICY "Users can check own invite status" ON public.invited_users
    FOR SELECT USING (
        LOWER(email) = LOWER(auth.jwt() ->> 'email')
        OR LOWER(auth.jwt() ->> 'email') = 'mike777rafael@gmail.com'
    );

-- Policy: Primary Admin mike777rafael@gmail.com has full control over whitelist
CREATE POLICY "Primary Admin full control on invites" ON public.invited_users
    FOR ALL USING (
        LOWER(auth.jwt() ->> 'email') = 'mike777rafael@gmail.com'
    )
    WITH CHECK (
        LOWER(auth.jwt() ->> 'email') = 'mike777rafael@gmail.com'
    );

-- Seed Primary Admin permanently
INSERT INTO public.invited_users (email, full_name, notes, role, status, invited_by)
VALUES (
    'mike777rafael@gmail.com',
    'Mike Rafael',
    'Primary Admin Permanen',
    'primary_admin',
    'active',
    'system'
)
ON CONFLICT (email) DO UPDATE 
SET role = 'primary_admin', status = 'active';

-- =========================================================================
-- 10. Notes & Footnotes Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.notes (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('idea', 'project', 'personal', 'research', 'archive')),
    tags TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT FALSE,
    color TEXT DEFAULT '#D97706',
    footnotes JSONB DEFAULT '[]', -- [ { id, index, label, content } ]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_user ON public.notes(user_id);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own notes" ON public.notes
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- =========================================================================
-- 11. Dream Catcher & Sleep Journal Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.dream_logs (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    wake_time TEXT,
    tags TEXT[] DEFAULT '{}',
    emotion TEXT NOT NULL CHECK (emotion IN ('happy', 'neutral', 'sad', 'anxious')),
    clarity_score INT DEFAULT 3 CHECK (clarity_score BETWEEN 1 AND 5),
    lucidity_score INT DEFAULT 1 CHECK (lucidity_score BETWEEN 1 AND 5),
    is_recurring BOOLEAN DEFAULT FALSE,
    is_nightmare BOOLEAN DEFAULT FALSE,
    interpretation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dreams_user ON public.dream_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_dreams_user_date ON public.dream_logs(user_id, date);
ALTER TABLE public.dream_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own dreams" ON public.dream_logs
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

