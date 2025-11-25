-- =====================================================
-- VERIFICATION QUERIES FOR STATUS & COMMENTS SYSTEM
-- Run these after notes_todos_setup.sql to verify
-- =====================================================

-- 1. Check all tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('notes', 'todos', 'note_status_votes', 'todo_status_votes', 'note_comments', 'todo_comments') 
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notes', 'todos', 'note_status_votes', 'todo_status_votes', 'note_comments', 'todo_comments')
ORDER BY table_name;

-- Expected: 6 rows, all with ✅ EXISTS

-- 2. Check table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('note_status_votes', 'todo_status_votes', 'note_comments', 'todo_comments')
ORDER BY table_name, ordinal_position;

-- Expected: Shows all columns for the 4 new tables

-- 3. Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('notes', 'todos', 'note_status_votes', 'todo_status_votes', 'note_comments', 'todo_comments');

-- Expected: All 6 tables should have rls_enabled = true

-- 4. Check policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN cmd = 'r' THEN 'SELECT'
        WHEN cmd = 'a' THEN 'INSERT'
        WHEN cmd = 'w' THEN 'UPDATE'
        WHEN cmd = 'd' THEN 'DELETE'
        ELSE cmd
    END as command
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('note_status_votes', 'todo_status_votes', 'note_comments', 'todo_comments')
ORDER BY tablename, command;

-- Expected: 4 policies per table (SELECT, INSERT, UPDATE, DELETE) = 16 total

-- 5. Check indexes exist
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('note_status_votes', 'todo_status_votes', 'note_comments', 'todo_comments')
ORDER BY tablename, indexname;

-- Expected: Multiple indexes per table for performance

-- 6. Check constraints (UNIQUE, CHECK)
SELECT
    conrelid::regclass AS table_name,
    conname AS constraint_name,
    contype AS constraint_type,
    CASE contype
        WHEN 'c' THEN 'CHECK'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
    END as type_description
FROM pg_constraint
WHERE conrelid::regclass::text IN ('note_status_votes', 'todo_status_votes', 'note_comments', 'todo_comments')
ORDER BY table_name, constraint_type;

-- Expected: UNIQUE(note_id, user_id) for votes, CHECK(status IN ...) for status values

-- 7. Check foreign key relationships
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('note_status_votes', 'todo_status_votes', 'note_comments', 'todo_comments');

-- Expected: Each table has 2 foreign keys (to notes/todos and user_profiles)

-- 8. Test helper function for consensus
-- First, insert some test votes (replace UUIDs with actual values from your database)
/*
-- Get a note ID
SELECT id FROM notes LIMIT 1;

-- Get user IDs
SELECT id, full_name FROM user_profiles;

-- Insert test votes (all 3 users voting for 'urgent')
INSERT INTO note_status_votes (note_id, user_id, status) VALUES
    ('YOUR_NOTE_ID', 'USER_1_ID', 'urgent'),
    ('YOUR_NOTE_ID', 'USER_2_ID', 'urgent'),
    ('YOUR_NOTE_ID', 'USER_3_ID', 'urgent');

-- Test consensus function
SELECT get_note_status_consensus('YOUR_NOTE_ID');
-- Expected: 'urgent'

-- Clean up test data
DELETE FROM note_status_votes WHERE note_id = 'YOUR_NOTE_ID';
*/

-- 9. Count existing data
SELECT 
    'Notes' as item_type,
    COUNT(*) as count
FROM notes
UNION ALL
SELECT 'Todos', COUNT(*) FROM todos
UNION ALL
SELECT 'Note Votes', COUNT(*) FROM note_status_votes
UNION ALL
SELECT 'Todo Votes', COUNT(*) FROM todo_status_votes
UNION ALL
SELECT 'Note Comments', COUNT(*) FROM note_comments
UNION ALL
SELECT 'Todo Comments', COUNT(*) FROM todo_comments;

-- Expected: Shows current counts (may all be 0 if just set up)

-- 10. Test query for fetching notes with vote and comment counts
SELECT 
    n.id,
    n.title,
    n.created_at,
    up.full_name as author,
    COUNT(DISTINCT nsv.id) as vote_count,
    COUNT(DISTINCT nc.id) as comment_count,
    STRING_AGG(DISTINCT nsv.status, ', ') as statuses
FROM notes n
LEFT JOIN user_profiles up ON n.created_by = up.id
LEFT JOIN note_status_votes nsv ON n.id = nsv.note_id
LEFT JOIN note_comments nc ON n.id = nc.note_id
GROUP BY n.id, n.title, n.created_at, up.full_name
ORDER BY n.created_at DESC;

-- Expected: Shows all notes with their vote and comment counts

-- =====================================================
-- ALL CHECKS PASSED? ✅
-- You're ready to use the status voting & comments system!
-- =====================================================
