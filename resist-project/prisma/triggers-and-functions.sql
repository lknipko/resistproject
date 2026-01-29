-- Resist Project - PostgreSQL Triggers, Functions, and Views
-- Run this file AFTER running Prisma migrations
-- Extracted from migrations 001-008

-- ============================================================================
-- From 001_page_metadata.sql
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_page_metadata_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamp
DROP TRIGGER IF EXISTS page_metadata_updated_at ON page_metadata;
CREATE TRIGGER page_metadata_updated_at
    BEFORE UPDATE ON page_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_page_metadata_timestamp();

-- ============================================================================
-- From 002_users_extended.sql
-- ============================================================================

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_users_extended_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_extended_updated_at ON users_extended;
CREATE TRIGGER users_extended_updated_at
    BEFORE UPDATE ON users_extended
    FOR EACH ROW
    EXECUTE FUNCTION update_users_extended_timestamp();

-- Function to reset daily counters
CREATE OR REPLACE FUNCTION reset_daily_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_activity_reset < CURRENT_DATE THEN
        NEW.daily_edit_count = 0;
        NEW.daily_vote_count = 0;
        NEW.last_activity_reset = CURRENT_DATE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_reset_daily ON users_extended;
CREATE TRIGGER users_reset_daily
    BEFORE UPDATE ON users_extended
    FOR EACH ROW
    EXECUTE FUNCTION reset_daily_counters();

-- Function to auto-promote users based on approved edits
CREATE OR REPLACE FUNCTION check_tier_promotion()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-promote to Tier 2 after first approved edit
    IF NEW.user_tier = 1 AND NEW.edits_approved >= 1 THEN
        NEW.user_tier = 2;
        NEW.reputation_score = NEW.reputation_score + 25;
        NEW.badges = NEW.badges || '["first-edit"]'::jsonb;
    -- Auto-promote to Tier 3 after 5 approved edits
    ELSIF NEW.user_tier = 2 AND NEW.edits_approved >= 5 THEN
        NEW.user_tier = 3;
        NEW.reputation_score = NEW.reputation_score + 25;
        NEW.badges = NEW.badges || '["trusted-contributor"]'::jsonb;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_check_promotion ON users_extended;
CREATE TRIGGER users_check_promotion
    BEFORE UPDATE ON users_extended
    FOR EACH ROW
    WHEN (NEW.edits_approved > OLD.edits_approved)
    EXECUTE FUNCTION check_tier_promotion();

-- ============================================================================
-- From 003_edit_proposals.sql
-- ============================================================================

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_edit_proposals_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS edit_proposals_updated_at ON edit_proposals;
CREATE TRIGGER edit_proposals_updated_at
    BEFORE UPDATE ON edit_proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_edit_proposals_timestamp();

-- Function to set approval threshold based on edit type
CREATE OR REPLACE FUNCTION set_approval_threshold()
RETURNS TRIGGER AS $$
BEGIN
    NEW.approval_threshold = CASE NEW.edit_type
        WHEN 'typo' THEN 3
        WHEN 'formatting' THEN 3
        WHEN 'citation' THEN 5
        WHEN 'content' THEN 5
        WHEN 'major-rewrite' THEN 10
        ELSE 5
    END;

    -- Increase threshold if facts section is changed
    IF NEW.validation_results ? 'facts_section_changed'
       AND (NEW.validation_results->>'facts_section_changed')::boolean = true THEN
        NEW.approval_threshold = NEW.approval_threshold + 5;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS edit_proposals_set_threshold ON edit_proposals;
CREATE TRIGGER edit_proposals_set_threshold
    BEFORE INSERT ON edit_proposals
    FOR EACH ROW
    EXECUTE FUNCTION set_approval_threshold();

-- Function to check if proposal should auto-approve or auto-reject
CREATE OR REPLACE FUNCTION check_proposal_resolution()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-approve if approval score meets threshold
    IF NEW.approval_score >= NEW.approval_threshold AND NEW.status = 'under_review' THEN
        NEW.status = 'approved';
        NEW.resolved_at = CURRENT_TIMESTAMP;
        NEW.resolution_reason = 'Auto-approved: reached approval threshold';
    -- Auto-reject if rejection score is too high
    ELSIF NEW.rejection_score >= NEW.approval_threshold AND NEW.status = 'under_review' THEN
        NEW.status = 'rejected';
        NEW.resolved_at = CURRENT_TIMESTAMP;
        NEW.resolution_reason = 'Auto-rejected: reached rejection threshold';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS edit_proposals_check_resolution ON edit_proposals;
CREATE TRIGGER edit_proposals_check_resolution
    BEFORE UPDATE ON edit_proposals
    FOR EACH ROW
    WHEN (NEW.approval_score <> OLD.approval_score OR NEW.rejection_score <> OLD.rejection_score)
    EXECUTE FUNCTION check_proposal_resolution();

-- ============================================================================
-- From 004_votes.sql
-- ============================================================================

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_votes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS votes_updated_at ON votes;
CREATE TRIGGER votes_updated_at
    BEFORE UPDATE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_votes_timestamp();

-- Function to calculate vote weight based on tier
CREATE OR REPLACE FUNCTION calculate_vote_weight()
RETURNS TRIGGER AS $$
BEGIN
    NEW.vote_weight = CASE NEW.voter_tier
        WHEN 1 THEN 0  -- Readers cannot vote
        WHEN 2 THEN 1  -- Contributors
        WHEN 3 THEN 3  -- Trusted Contributors
        WHEN 4 THEN 10 -- Moderators
        WHEN 5 THEN 100 -- Administrators
        ELSE 0
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS votes_calculate_weight ON votes;
CREATE TRIGGER votes_calculate_weight
    BEFORE INSERT OR UPDATE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION calculate_vote_weight();

-- Function to update proposal scores when votes change
CREATE OR REPLACE FUNCTION update_proposal_scores()
RETURNS TRIGGER AS $$
DECLARE
    new_approval_score INTEGER;
    new_rejection_score INTEGER;
BEGIN
    -- Calculate new scores
    SELECT
        COALESCE(SUM(CASE WHEN vote_type = 'approve' THEN vote_weight ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN vote_type = 'reject' THEN vote_weight ELSE 0 END), 0)
    INTO new_approval_score, new_rejection_score
    FROM votes
    WHERE proposal_id = COALESCE(NEW.proposal_id, OLD.proposal_id);

    -- Update the proposal
    UPDATE edit_proposals
    SET
        approval_score = new_approval_score,
        rejection_score = new_rejection_score,
        status = CASE
            WHEN status = 'pending' THEN 'under_review'
            ELSE status
        END
    WHERE id = COALESCE(NEW.proposal_id, OLD.proposal_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS votes_update_proposal ON votes;
CREATE TRIGGER votes_update_proposal
    AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_proposal_scores();

-- Function to update voter statistics
CREATE OR REPLACE FUNCTION update_voter_stats()
RETURNS TRIGGER AS $$
DECLARE
    user_id_to_update TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Get the user_id from users_extended
        SELECT "userId" INTO user_id_to_update
        FROM users_extended
        WHERE id = (SELECT id FROM users_extended WHERE "userId" = NEW.voter_id);

        UPDATE users_extended
        SET
            votes_cast = votes_cast + 1,
            daily_vote_count = daily_vote_count + 1
        WHERE "userId" = NEW.voter_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users_extended
        SET votes_cast = votes_cast - 1
        WHERE "userId" = OLD.voter_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS votes_update_voter_stats ON votes;
CREATE TRIGGER votes_update_voter_stats
    AFTER INSERT OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_voter_stats();

-- ============================================================================
-- From 005_audit_log.sql
-- ============================================================================

-- Prevent updates and deletes (immutable log)
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log entries cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_log_no_update ON audit_log;
CREATE TRIGGER audit_log_no_update
    BEFORE UPDATE ON audit_log
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();

DROP TRIGGER IF EXISTS audit_log_no_delete ON audit_log;
CREATE TRIGGER audit_log_no_delete
    BEFORE DELETE ON audit_log
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();

-- Helper function to create audit entries
CREATE OR REPLACE FUNCTION create_audit_entry(
    p_action_type VARCHAR(50),
    p_action_category VARCHAR(30),
    p_actor_id TEXT,
    p_actor_type VARCHAR(20),
    p_target_type VARCHAR(30),
    p_target_id INTEGER,
    p_target_path VARCHAR(500),
    p_description TEXT,
    p_old_value JSONB DEFAULT NULL,
    p_new_value JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_actor_ip_hash VARCHAR(64) DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    new_id BIGINT;
BEGIN
    INSERT INTO audit_log (
        action_type, action_category, actor_id, actor_type, actor_ip_hash,
        target_type, target_id, target_path, description,
        old_value, new_value, metadata
    ) VALUES (
        p_action_type, p_action_category, p_actor_id, p_actor_type, p_actor_ip_hash,
        p_target_type, p_target_id, p_target_path, p_description,
        p_old_value, p_new_value, p_metadata
    ) RETURNING id INTO new_id;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Create view for recent changes (Wikipedia-style)
CREATE OR REPLACE VIEW recent_changes AS
SELECT
    al.id,
    al.action_type,
    al.action_category,
    al.actor_id,
    ue.display_name as actor_name,
    ue.user_tier as actor_tier,
    al.target_type,
    al.target_id,
    al.target_path,
    al.description,
    al.created_at
FROM audit_log al
LEFT JOIN users_extended ue ON al.actor_id = ue."userId"
WHERE al.action_category IN ('content', 'moderation')
ORDER BY al.created_at DESC;

-- ============================================================================
-- From 006_page_events.sql
-- ============================================================================

-- Auto-update timestamp trigger for page_metrics_daily
CREATE OR REPLACE FUNCTION update_page_metrics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS page_metrics_daily_updated_at ON page_metrics_daily;
CREATE TRIGGER page_metrics_daily_updated_at
    BEFORE UPDATE ON page_metrics_daily
    FOR EACH ROW
    EXECUTE FUNCTION update_page_metrics_timestamp();

-- Function to aggregate daily metrics (called by scheduled job)
CREATE OR REPLACE FUNCTION aggregate_daily_metrics(target_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS INTEGER AS $$
DECLARE
    rows_affected INTEGER := 0;
BEGIN
    INSERT INTO page_metrics_daily (
        page_id, page_path, metric_date,
        view_count, unique_sessions, action_clicks, shares, external_clicks,
        avg_time_on_page, daily_engagement_score
    )
    SELECT
        pe.page_id,
        pe.page_path,
        pe.event_date,
        COUNT(*) FILTER (WHERE pe.event_type = 'view') as view_count,
        COUNT(DISTINCT pe.session_hash) FILTER (WHERE pe.event_type = 'view') as unique_sessions,
        COUNT(*) FILTER (WHERE pe.event_type = 'action_click') as action_clicks,
        COUNT(*) FILTER (WHERE pe.event_type = 'share') as shares,
        COUNT(*) FILTER (WHERE pe.event_type = 'external_link_click') as external_clicks,
        AVG(pe.event_value) FILTER (WHERE pe.event_type = 'time_on_page')::INTEGER as avg_time_on_page,
        (
            COUNT(*) FILTER (WHERE pe.event_type = 'view') * 1 +
            COUNT(*) FILTER (WHERE pe.event_type = 'action_click') * 5 +
            COUNT(*) FILTER (WHERE pe.event_type = 'share') * 3 +
            COUNT(DISTINCT pe.session_hash) FILTER (WHERE pe.event_type = 'view') * 0.5
        )::DECIMAL(10,2) as daily_engagement_score
    FROM page_events pe
    WHERE pe.event_date = target_date
    GROUP BY pe.page_id, pe.page_path, pe.event_date
    ON CONFLICT (page_id, metric_date)
    DO UPDATE SET
        view_count = EXCLUDED.view_count,
        unique_sessions = EXCLUDED.unique_sessions,
        action_clicks = EXCLUDED.action_clicks,
        shares = EXCLUDED.shares,
        external_clicks = EXCLUDED.external_clicks,
        avg_time_on_page = EXCLUDED.avg_time_on_page,
        daily_engagement_score = EXCLUDED.daily_engagement_score,
        updated_at = CURRENT_TIMESTAMP;

    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    RETURN rows_affected;
END;
$$ LANGUAGE plpgsql;

-- View for 7-day rolling engagement (used by scoring service)
CREATE OR REPLACE VIEW page_engagement_7day AS
SELECT
    page_id,
    page_path,
    SUM(view_count) as total_views,
    SUM(unique_sessions) as total_sessions,
    SUM(action_clicks) as total_action_clicks,
    SUM(shares) as total_shares,
    SUM(daily_engagement_score) as rolling_engagement_score,
    AVG(avg_time_on_page)::INTEGER as avg_time_on_page
FROM page_metrics_daily
WHERE metric_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY page_id, page_path;

-- Data retention: Function to clean up old events (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_page_events()
RETURNS INTEGER AS $$
DECLARE
    rows_deleted INTEGER;
BEGIN
    DELETE FROM page_events
    WHERE event_date < CURRENT_DATE - INTERVAL '90 days';

    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RETURN rows_deleted;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- From 007_pinned_pages.sql
-- ============================================================================

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_pinned_pages_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pinned_pages_updated_at ON pinned_pages;
CREATE TRIGGER pinned_pages_updated_at
    BEFORE UPDATE ON pinned_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_pinned_pages_timestamp();

-- Function to auto-deactivate expired pins
CREATE OR REPLACE FUNCTION deactivate_expired_pins()
RETURNS INTEGER AS $$
DECLARE
    rows_affected INTEGER;
BEGIN
    UPDATE pinned_pages
    SET is_active = false
    WHERE is_active = true
    AND end_time IS NOT NULL
    AND end_time < CURRENT_TIMESTAMP;

    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    RETURN rows_affected;
END;
$$ LANGUAGE plpgsql;

-- View for currently active pins
CREATE OR REPLACE VIEW active_pins AS
SELECT
    pp.id,
    pp.page_id,
    pp.page_path,
    pp.pin_position,
    pp.pin_location,
    pp.pin_label,
    pp.pin_style,
    pp.pin_reason,
    pp.start_time,
    pp.end_time,
    u.name as pinned_by_name,
    pp.created_at
FROM pinned_pages pp
LEFT JOIN users_extended ue ON pp.pinned_by = ue."userId"
LEFT JOIN "User" u ON ue."userId" = u.id
WHERE pp.is_active = true
AND pp.start_time <= CURRENT_TIMESTAMP
AND (pp.end_time IS NULL OR pp.end_time > CURRENT_TIMESTAMP)
ORDER BY pp.pin_location, pp.pin_position;

-- Function to create audit entry when pins change
CREATE OR REPLACE FUNCTION audit_pin_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM create_audit_entry(
            'page_pinned',
            'moderation',
            NEW.pinned_by,
            'admin',
            'page',
            NEW.page_id,
            NEW.page_path,
            format('Page pinned to %s position %s: %s', NEW.pin_location, NEW.pin_position, NEW.pin_reason),
            NULL,
            to_jsonb(NEW),
            '{}'::jsonb
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_active = true AND NEW.is_active = false THEN
            PERFORM create_audit_entry(
                'page_unpinned',
                'moderation',
                NEW.pinned_by,
                'admin',
                'page',
                NEW.page_id,
                NEW.page_path,
                format('Page unpinned from %s', NEW.pin_location),
                to_jsonb(OLD),
                to_jsonb(NEW),
                '{}'::jsonb
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pinned_pages_audit ON pinned_pages;
CREATE TRIGGER pinned_pages_audit
    AFTER INSERT OR UPDATE ON pinned_pages
    FOR EACH ROW
    EXECUTE FUNCTION audit_pin_changes();

-- ============================================================================
-- COMMENTS for documentation
-- ============================================================================

COMMENT ON TABLE page_metadata IS 'Extended metadata for pages, enabling scoring and categorization';
COMMENT ON TABLE users_extended IS 'Extended user profiles with reputation and tier system for collaborative editing';
COMMENT ON TABLE edit_proposals IS 'Proposed content edits pending community review and approval';
COMMENT ON TABLE votes IS 'Weighted votes on edit proposals from community reviewers';
COMMENT ON TABLE audit_log IS 'Immutable audit trail of all platform actions for transparency and security';
COMMENT ON TABLE page_events IS 'Raw analytics events for engagement tracking (privacy-focused, no PII)';
COMMENT ON TABLE page_metrics_daily IS 'Pre-aggregated daily metrics for efficient querying';
COMMENT ON TABLE pinned_pages IS 'Manual editorial pins to override algorithmic content sorting';

-- COMMENT ON FUNCTION create_audit_entry IS 'Helper function to create standardized audit log entries';
-- Note: Skipping comment due to function overloading - would need full signature
COMMENT ON FUNCTION aggregate_daily_metrics(DATE) IS 'Aggregates raw events into daily metrics (run nightly)';
