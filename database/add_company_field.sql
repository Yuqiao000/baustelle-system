-- Add company field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company);

-- Comment on the column
COMMENT ON COLUMN profiles.company IS 'Company name (e.g., STG for main company, MAFC/BBR for subsidiaries)';
