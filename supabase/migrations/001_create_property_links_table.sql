-- Create property_links table for storing shared property listings
-- Run this migration in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS property_links (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  image TEXT,
  shared_by TEXT NOT NULL DEFAULT 'anon',
  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  property_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_property_links_shared_by ON property_links(shared_by);
CREATE INDEX IF NOT EXISTS idx_property_links_shared_at ON property_links(shared_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_links_location ON property_links(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add RLS (Row Level Security) policies
ALTER TABLE property_links ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read property links (no authentication required)
CREATE POLICY "Anyone can read property links"
  ON property_links
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert their own property links
CREATE POLICY "Authenticated users can insert property links"
  ON property_links
  FOR INSERT
  WITH CHECK (auth.email() = shared_by);

-- Policy: Anonymous users can insert if location and link are present
CREATE POLICY "Anonymous users can insert property links with location"
  ON property_links
  FOR INSERT
  WITH CHECK (
    shared_by = 'anon'
    AND url IS NOT NULL
    AND latitude IS NOT NULL
    AND longitude IS NOT NULL
  );

-- Policy: Users can delete their own property links
CREATE POLICY "Users can delete their own property links"
  ON property_links
  FOR DELETE
  USING (auth.email() = shared_by);

-- Policy: Users can update their own property links
CREATE POLICY "Users can update their own property links"
  ON property_links
  FOR UPDATE
  USING (auth.email() = shared_by)
  WITH CHECK (auth.email() = shared_by);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_property_links_updated_at
  BEFORE UPDATE ON property_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment on table
COMMENT ON TABLE property_links IS 'Stores shared property listing links with metadata and location data';
