-- ====================================================================
-- SOFRAFLOW — PROFILE PHONE NUMBER UNIQUENESS & INTEGRITY HARDENING
-- ====================================================================

-- 1. Create a unique partial index on normalized phone numbers in public.profiles
-- Excludes NULL and empty strings so accounts without phone numbers can exist.
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique 
  ON public.profiles (phone) 
  WHERE phone IS NOT NULL AND phone <> '';

COMMENT ON INDEX idx_profiles_phone_unique IS 
  'Enforces uniqueness of phone numbers across user profiles, preventing duplicate records at the database level.';

-- 2. Trigger function to check phone uniqueness before update or insert,
-- explicitly excluding the user's own record (id <> NEW.id).
CREATE OR REPLACE FUNCTION public.check_profile_phone_uniqueness()
RETURNS trigger AS $$
BEGIN
  IF NEW.phone IS NOT NULL AND NEW.phone <> '' THEN
    IF EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE phone = NEW.phone 
        AND id <> NEW.id
    ) THEN
      RAISE EXCEPTION 'duplicate_phone_number: This phone number is already registered to another account.' 
        USING ERRCODE = '23505';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to public.profiles
DROP TRIGGER IF EXISTS trg_check_profile_phone ON public.profiles;
CREATE TRIGGER trg_check_profile_phone
  BEFORE INSERT OR UPDATE OF phone ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_phone_uniqueness();
