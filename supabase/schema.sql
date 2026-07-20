-- EPO Import Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: portfolios
-- Stores portfolio metadata
-- =====================================================
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  epo_user_id TEXT NOT NULL,
  epo_portfolio_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own portfolios
CREATE POLICY "Users can view own portfolios"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own portfolios
CREATE POLICY "Users can insert own portfolios"
  ON portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own portfolios
CREATE POLICY "Users can update own portfolios"
  ON portfolios FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own portfolios
CREATE POLICY "Users can delete own portfolios"
  ON portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: portfolio_data
-- Stores subsection data as JSONB
-- =====================================================
CREATE TABLE IF NOT EXISTS portfolio_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  subsection_id TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique combination of portfolio + subsection
  UNIQUE(portfolio_id, subsection_id)
);

-- Add index for faster portfolio lookups
CREATE INDEX IF NOT EXISTS idx_portfolio_data_portfolio_id ON portfolio_data(portfolio_id);

-- Add RLS policies
ALTER TABLE portfolio_data ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view data for their own portfolios
CREATE POLICY "Users can view own portfolio data"
  ON portfolio_data FOR SELECT
  USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert data for their own portfolios
CREATE POLICY "Users can insert own portfolio data"
  ON portfolio_data FOR INSERT
  WITH CHECK (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update data for their own portfolios
CREATE POLICY "Users can update own portfolio data"
  ON portfolio_data FOR UPDATE
  USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete data for their own portfolios
CREATE POLICY "Users can delete own portfolio data"
  ON portfolio_data FOR DELETE
  USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update portfolios.updated_at
CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update portfolio_data.updated_at
CREATE TRIGGER update_portfolio_data_updated_at
  BEFORE UPDATE ON portfolio_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL SETUP COMPLETE
-- =====================================================
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Create at least one user in Authentication > Users
-- 3. Test connection from the app
