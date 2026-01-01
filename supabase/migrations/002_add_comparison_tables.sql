-- Migration: Add comparison feature tables and columns
-- Description: Extends property_links table with comparison-specific fields and creates comparison_sessions table

-- Add new JSONB fields to existing property_links table
ALTER TABLE property_links
ADD COLUMN IF NOT EXISTS floor_plans JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS sun_orientation JSONB,
ADD COLUMN IF NOT EXISTS image_gallery JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS short_description TEXT;

-- Create comparison_sessions table for saved comparisons
CREATE TABLE IF NOT EXISTS comparison_sessions (
  id TEXT PRIMARY KEY,
  name TEXT,
  property_ids TEXT[] NOT NULL,
  shared_by TEXT NOT NULL,
  user_annotations JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_comparison_sessions_shared_by ON comparison_sessions(shared_by);
CREATE INDEX IF NOT EXISTS idx_comparison_sessions_updated_at ON comparison_sessions(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE comparison_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comparison_sessions

-- Policy: Users can view their own comparison sessions
CREATE POLICY "Users can view their own comparison sessions"
  ON comparison_sessions
  FOR SELECT
  USING (shared_by = auth.email() OR shared_by = 'anon');

-- Policy: Users can create their own comparison sessions
CREATE POLICY "Users can create their own comparison sessions"
  ON comparison_sessions
  FOR INSERT
  WITH CHECK (shared_by = auth.email() OR shared_by = 'anon');

-- Policy: Users can update their own comparison sessions
CREATE POLICY "Users can update their own comparison sessions"
  ON comparison_sessions
  FOR UPDATE
  USING (shared_by = auth.email() OR shared_by = 'anon')
  WITH CHECK (shared_by = auth.email() OR shared_by = 'anon');

-- Policy: Users can delete their own comparison sessions
CREATE POLICY "Users can delete their own comparison sessions"
  ON comparison_sessions
  FOR DELETE
  USING (shared_by = auth.email() OR shared_by = 'anon');

-- Create function to update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at on comparison_sessions
DROP TRIGGER IF EXISTS update_comparison_sessions_updated_at ON comparison_sessions;
CREATE TRIGGER update_comparison_sessions_updated_at
  BEFORE UPDATE ON comparison_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE comparison_sessions IS 'Stores saved property comparison sessions with user preferences and annotations';
COMMENT ON COLUMN comparison_sessions.property_ids IS 'Array of property link IDs included in this comparison';
COMMENT ON COLUMN comparison_sessions.user_annotations IS 'JSON object containing selected images, notes, and favorites';
