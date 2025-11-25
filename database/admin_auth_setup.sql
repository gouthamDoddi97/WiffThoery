-- =====================================================
-- ADMIN AUTHENTICATION & USER PROFILES
-- Run this after the main schema
-- =====================================================

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all admin profiles
CREATE POLICY "Admins can view all profiles"
    ON user_profiles FOR SELECT
    TO authenticated
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Update expenses table to track which user created it
ALTER TABLE expenses 
    DROP COLUMN IF EXISTS created_by,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Update RLS policies for expenses
DROP POLICY IF EXISTS "Admins can view all expenses" ON expenses;
DROP POLICY IF EXISTS "Admins can insert expenses" ON expenses;
DROP POLICY IF EXISTS "Admins can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Admins can delete own expenses" ON expenses;

-- New expense policies
CREATE POLICY "Admins can view all expenses"
    ON expenses FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can insert expenses"
    ON expenses FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can update own expenses"
    ON expenses FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "Admins can delete own expenses"
    ON expenses FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

-- Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- CREATE ADMIN USERS
-- Run these statements in Supabase Dashboard > Authentication > Users
-- Or use the Supabase Auth Admin API
-- =====================================================

-- NOTE: You'll need to create these users via Supabase Dashboard:
-- 1. Go to Authentication > Users > Add User
-- 2. Create users with these emails:
--    - vinod@perfume.com (password: set your own)
--    - neelam@perfume.com (password: set your own)
--    - goutham@perfume.com (password: set your own)
-- 3. The trigger will automatically create their profiles

-- Or manually insert profiles if users already exist:
-- First, get the user IDs from auth.users, then:
/*
INSERT INTO user_profiles (id, email, full_name, role) 
VALUES 
    ('user-id-1', 'vinod@perfume.com', 'Vinod', 'admin'),
    ('user-id-2', 'neelam@perfume.com', 'Neelam', 'admin'),
    ('user-id-3', 'goutham@perfume.com', 'Goutham', 'admin')
ON CONFLICT (email) DO NOTHING;
*/
