-- Reset database: Drop all custom tables to allow Prisma to recreate them
-- This is safe because there's no production data yet

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS recent_changes CASCADE;
DROP VIEW IF EXISTS page_engagement_7day CASCADE;
DROP VIEW IF EXISTS active_pins CASCADE;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS edit_proposals CASCADE;
DROP TABLE IF EXISTS pinned_pages CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS page_events CASCADE;
DROP TABLE IF EXISTS page_metrics_daily CASCADE;
DROP TABLE IF EXISTS page_metadata CASCADE;
DROP TABLE IF EXISTS users_extended CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_page_metadata_timestamp() CASCADE;
DROP FUNCTION IF EXISTS update_users_extended_timestamp() CASCADE;
DROP FUNCTION IF EXISTS reset_daily_counters() CASCADE;
DROP FUNCTION IF EXISTS check_tier_promotion() CASCADE;
DROP FUNCTION IF EXISTS update_edit_proposals_timestamp() CASCADE;
DROP FUNCTION IF EXISTS set_approval_threshold() CASCADE;
DROP FUNCTION IF EXISTS check_proposal_resolution() CASCADE;
DROP FUNCTION IF EXISTS update_votes_timestamp() CASCADE;
DROP FUNCTION IF EXISTS calculate_vote_weight() CASCADE;
DROP FUNCTION IF EXISTS update_proposal_scores() CASCADE;
DROP FUNCTION IF EXISTS update_voter_stats() CASCADE;
DROP FUNCTION IF EXISTS prevent_audit_modification() CASCADE;
DROP FUNCTION IF EXISTS create_audit_entry(VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, INTEGER, VARCHAR, TEXT, JSONB, JSONB, JSONB, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS update_page_metrics_timestamp() CASCADE;
DROP FUNCTION IF EXISTS aggregate_daily_metrics(DATE) CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_page_events() CASCADE;
DROP FUNCTION IF EXISTS update_pinned_pages_timestamp() CASCADE;
DROP FUNCTION IF EXISTS deactivate_expired_pins() CASCADE;
DROP FUNCTION IF EXISTS audit_pin_changes() CASCADE;

-- Note: This does NOT drop NextAuth tables (User, Account, Session, VerificationToken)
-- Those will be created by Prisma migrations
