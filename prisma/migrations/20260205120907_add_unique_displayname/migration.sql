-- AddUniqueConstraint: displayName
-- This migration adds a unique constraint to the display_name column

-- First, handle any existing duplicates by appending a counter to duplicate names
-- This ensures the unique constraint can be applied
DO $$
DECLARE
    duplicate_name RECORD;
    counter INTEGER;
BEGIN
    -- Find and fix duplicate display names
    FOR duplicate_name IN
        SELECT display_name
        FROM users_extended
        WHERE display_name IS NOT NULL
        GROUP BY display_name
        HAVING COUNT(*) > 1
    LOOP
        counter := 2;
        -- Update duplicates by appending a number
        FOR duplicate_name IN
            SELECT id, display_name
            FROM users_extended
            WHERE display_name = duplicate_name.display_name
            ORDER BY created_at
            OFFSET 1  -- Keep the first one unchanged
        LOOP
            UPDATE users_extended
            SET display_name = duplicate_name.display_name || '_' || counter
            WHERE id = duplicate_name.id;
            counter := counter + 1;
        END LOOP;
    END LOOP;
END $$;

-- Now add the unique constraint
ALTER TABLE "users_extended" ADD CONSTRAINT "users_extended_display_name_key" UNIQUE ("display_name");
