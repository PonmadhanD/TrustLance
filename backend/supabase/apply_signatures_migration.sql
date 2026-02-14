-- ============================================
-- MIGRATION: ADD DIGITAL SIGNATURE COLUMNS
-- ============================================

-- 1. Add signature columns to PROJECTS table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS client_signature TEXT,
ADD COLUMN IF NOT EXISTS client_signed_at TIMESTAMPTZ;

-- 2. Add signature columns to CONTRACTS table
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS freelancer_signature TEXT,
ADD COLUMN IF NOT EXISTS freelancer_signed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS agreement_pdf_url TEXT;

-- Verify changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name IN ('client_signature', 'client_signed_at');

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contracts' AND column_name IN ('freelancer_signature', 'freelancer_signed_at', 'agreement_pdf_url');
