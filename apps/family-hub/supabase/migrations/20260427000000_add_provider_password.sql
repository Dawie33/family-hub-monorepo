ALTER TABLE member_integrations
  ADD COLUMN IF NOT EXISTS provider_password TEXT;
