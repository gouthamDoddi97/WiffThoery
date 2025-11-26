-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view comment votes" ON note_comment_votes;
DROP POLICY IF EXISTS "Users can create comment votes" ON note_comment_votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON note_comment_votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON note_comment_votes;
DROP POLICY IF EXISTS "Anyone can view comment reactions" ON note_comment_reactions;
DROP POLICY IF EXISTS "Users can create comment reactions" ON note_comment_reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON note_comment_reactions;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_comment_votes_comment_id;
DROP INDEX IF EXISTS idx_comment_votes_user_id;
DROP INDEX IF EXISTS idx_comment_reactions_comment_id;
DROP INDEX IF EXISTS idx_comment_reactions_user_id;

-- Create note_comment_votes table
CREATE TABLE IF NOT EXISTS note_comment_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES note_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Create note_comment_reactions table
CREATE TABLE IF NOT EXISTS note_comment_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES note_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(comment_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE note_comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_comment_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for note_comment_votes
CREATE POLICY "Anyone can view comment votes"
  ON note_comment_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can create comment votes"
  ON note_comment_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON note_comment_votes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON note_comment_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for note_comment_reactions
CREATE POLICY "Anyone can view comment reactions"
  ON note_comment_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can create comment reactions"
  ON note_comment_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON note_comment_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_comment_votes_comment_id ON note_comment_votes(comment_id);
CREATE INDEX idx_comment_votes_user_id ON note_comment_votes(user_id);
CREATE INDEX idx_comment_reactions_comment_id ON note_comment_reactions(comment_id);
CREATE INDEX idx_comment_reactions_user_id ON note_comment_reactions(user_id);
