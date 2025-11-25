-- =====================================================
-- NOTES AND TODOS TABLES SETUP WITH STATUS & COMMENTS
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create Notes Table
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Todos Table
CREATE TABLE IF NOT EXISTS todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    created_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Note Status Votes Table
-- Tracks which users voted for which status on each note
CREATE TABLE IF NOT EXISTS note_status_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('strike', 'urgent', 'done', 'in-progress')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(note_id, user_id)
);

-- Create Todo Status Votes Table
-- Tracks which users voted for which status on each todo
CREATE TABLE IF NOT EXISTS todo_status_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    todo_id UUID REFERENCES todos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('strike', 'urgent', 'done', 'in-progress')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(todo_id, user_id)
);

-- Create Note Comments Table
CREATE TABLE IF NOT EXISTS note_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Todo Comments Table
CREATE TABLE IF NOT EXISTS todo_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    todo_id UUID REFERENCES todos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Note Reactions Table
CREATE TABLE IF NOT EXISTS note_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(note_id, user_id, emoji)
);

-- Create Todo Reactions Table
CREATE TABLE IF NOT EXISTS todo_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    todo_id UUID REFERENCES todos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(todo_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_status_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_status_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_reactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view notes" ON notes;
DROP POLICY IF EXISTS "Users can create notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;

DROP POLICY IF EXISTS "Anyone can view todos" ON todos;
DROP POLICY IF EXISTS "Users can create todos" ON todos;
DROP POLICY IF EXISTS "Users can update own todos" ON todos;
DROP POLICY IF EXISTS "Users can delete own todos" ON todos;

DROP POLICY IF EXISTS "Anyone can view note status votes" ON note_status_votes;
DROP POLICY IF EXISTS "Users can create note status votes" ON note_status_votes;
DROP POLICY IF EXISTS "Users can update own note status votes" ON note_status_votes;
DROP POLICY IF EXISTS "Users can delete own note status votes" ON note_status_votes;

DROP POLICY IF EXISTS "Anyone can view todo status votes" ON todo_status_votes;
DROP POLICY IF EXISTS "Users can create todo status votes" ON todo_status_votes;
DROP POLICY IF EXISTS "Users can update own todo status votes" ON todo_status_votes;
DROP POLICY IF EXISTS "Users can delete own todo status votes" ON todo_status_votes;

DROP POLICY IF EXISTS "Anyone can view note comments" ON note_comments;
DROP POLICY IF EXISTS "Users can create note comments" ON note_comments;
DROP POLICY IF EXISTS "Users can update own note comments" ON note_comments;
DROP POLICY IF EXISTS "Users can delete own note comments" ON note_comments;

DROP POLICY IF EXISTS "Anyone can view todo comments" ON todo_comments;
DROP POLICY IF EXISTS "Users can create todo comments" ON todo_comments;
DROP POLICY IF EXISTS "Users can update own todo comments" ON todo_comments;
DROP POLICY IF EXISTS "Users can delete own todo comments" ON todo_comments;

DROP POLICY IF EXISTS "Anyone can view note reactions" ON note_reactions;
DROP POLICY IF EXISTS "Users can create note reactions" ON note_reactions;
DROP POLICY IF EXISTS "Users can delete own note reactions" ON note_reactions;

DROP POLICY IF EXISTS "Anyone can view todo reactions" ON todo_reactions;
DROP POLICY IF EXISTS "Users can create todo reactions" ON todo_reactions;
DROP POLICY IF EXISTS "Users can delete own todo reactions" ON todo_reactions;

-- RLS Policies for Notes
-- Everyone can view all notes
CREATE POLICY "Anyone can view notes"
ON notes FOR SELECT
TO authenticated
USING (true);

-- Users can create their own notes
CREATE POLICY "Users can create notes"
ON notes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Users can update their own notes
CREATE POLICY "Users can update own notes"
ON notes FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Users can delete their own notes
CREATE POLICY "Users can delete own notes"
ON notes FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- RLS Policies for Todos
-- Everyone can view all todos
CREATE POLICY "Anyone can view todos"
ON todos FOR SELECT
TO authenticated
USING (true);

-- Users can create their own todos
CREATE POLICY "Users can create todos"
ON todos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Users can update their own todos
CREATE POLICY "Users can update own todos"
ON todos FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Users can delete their own todos
CREATE POLICY "Users can delete own todos"
ON todos FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- RLS Policies for Note Status Votes
CREATE POLICY "Anyone can view note status votes"
ON note_status_votes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create note status votes"
ON note_status_votes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own note status votes"
ON note_status_votes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own note status votes"
ON note_status_votes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for Todo Status Votes
CREATE POLICY "Anyone can view todo status votes"
ON todo_status_votes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create todo status votes"
ON todo_status_votes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todo status votes"
ON todo_status_votes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todo status votes"
ON todo_status_votes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for Note Comments
CREATE POLICY "Anyone can view note comments"
ON note_comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create note comments"
ON note_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own note comments"
ON note_comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own note comments"
ON note_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for Todo Comments
CREATE POLICY "Anyone can view todo comments"
ON todo_comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create todo comments"
ON todo_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todo comments"
ON todo_comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todo comments"
ON todo_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for Note Reactions
CREATE POLICY "Anyone can view note reactions"
ON note_reactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create note reactions"
ON note_reactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own note reactions"
ON note_reactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for Todo Reactions
CREATE POLICY "Anyone can view todo reactions"
ON todo_reactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create todo reactions"
ON todo_reactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own todo reactions"
ON todo_reactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for notes
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add triggers for todos
DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add triggers for note_status_votes
DROP TRIGGER IF EXISTS update_note_status_votes_updated_at ON note_status_votes;
CREATE TRIGGER update_note_status_votes_updated_at
    BEFORE UPDATE ON note_status_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add triggers for todo_status_votes
DROP TRIGGER IF EXISTS update_todo_status_votes_updated_at ON todo_status_votes;
CREATE TRIGGER update_todo_status_votes_updated_at
    BEFORE UPDATE ON todo_status_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add triggers for note_comments
DROP TRIGGER IF EXISTS update_note_comments_updated_at ON note_comments;
CREATE TRIGGER update_note_comments_updated_at
    BEFORE UPDATE ON note_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add triggers for todo_comments
DROP TRIGGER IF EXISTS update_todo_comments_updated_at ON todo_comments;
CREATE TRIGGER update_todo_comments_updated_at
    BEFORE UPDATE ON todo_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_created_by ON notes(created_by);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_created_by ON todos(created_by);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_note_status_votes_note_id ON note_status_votes(note_id);
CREATE INDEX IF NOT EXISTS idx_note_status_votes_user_id ON note_status_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_status_votes_todo_id ON todo_status_votes(todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_status_votes_user_id ON todo_status_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_note_comments_note_id ON note_comments(note_id);
CREATE INDEX IF NOT EXISTS idx_note_comments_created_at ON note_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todo_comments_todo_id ON todo_comments(todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_comments_created_at ON todo_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_note_reactions_note_id ON note_reactions(note_id);
CREATE INDEX IF NOT EXISTS idx_note_reactions_user_id ON note_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_reactions_todo_id ON todo_reactions(todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_reactions_user_id ON todo_reactions(user_id);

-- Verification queries
SELECT 'Notes table' as table_name, COUNT(*) as row_count FROM notes
UNION ALL
SELECT 'Todos table' as table_name, COUNT(*) as row_count FROM todos
UNION ALL
SELECT 'Note status votes' as table_name, COUNT(*) as row_count FROM note_status_votes
UNION ALL
SELECT 'Todo status votes' as table_name, COUNT(*) as row_count FROM todo_status_votes
UNION ALL
SELECT 'Note comments' as table_name, COUNT(*) as row_count FROM note_comments
UNION ALL
SELECT 'Todo comments' as table_name, COUNT(*) as row_count FROM todo_comments
UNION ALL
SELECT 'Note reactions' as table_name, COUNT(*) as row_count FROM note_reactions
UNION ALL
SELECT 'Todo reactions' as table_name, COUNT(*) as row_count FROM todo_reactions;

-- Expected result: 0 rows for all tables (empty tables)

-- =====================================================
-- HELPER FUNCTIONS FOR STATUS AGGREGATION
-- =====================================================

-- Function to get status consensus for a note
-- Returns the status only if all 3 users agree, otherwise NULL
CREATE OR REPLACE FUNCTION get_note_status_consensus(p_note_id UUID)
RETURNS TEXT AS $$
DECLARE
    vote_count INTEGER;
    status_result TEXT;
BEGIN
    -- Check if all 3 users have voted for the same status
    SELECT status, COUNT(*) INTO status_result, vote_count
    FROM note_status_votes
    WHERE note_id = p_note_id
    GROUP BY status
    HAVING COUNT(*) = 3;
    
    RETURN status_result;
END;
$$ LANGUAGE plpgsql;

-- Function to get status consensus for a todo
CREATE OR REPLACE FUNCTION get_todo_status_consensus(p_todo_id UUID)
RETURNS TEXT AS $$
DECLARE
    vote_count INTEGER;
    status_result TEXT;
BEGIN
    -- Check if all 3 users have voted for the same status
    SELECT status, COUNT(*) INTO status_result, vote_count
    FROM todo_status_votes
    WHERE todo_id = p_todo_id
    GROUP BY status
    HAVING COUNT(*) = 3;
    
    RETURN status_result;
END;
$$ LANGUAGE plpgsql;

-- Expected result: 0 rows for all tables (empty tables)
