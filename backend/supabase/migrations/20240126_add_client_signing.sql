
-- Migration: Add client signature columns to contracts table
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS client_signature TEXT,
ADD COLUMN IF NOT EXISTS client_signed_at TIMESTAMPTZ;

-- Update RLS policies (if applicable, but assuming public/authenticated access for now)
-- Ensure clients can update their own contract signature
CREATE POLICY "Clients can sign their contracts" ON contracts
    FOR UPDATE
    USING (auth.uid() = client_id)
    WITH CHECK (auth.uid() = client_id);
