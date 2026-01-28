-- Fix for the two views that had column name errors
-- Run this to fix the recent_changes and active_pins views

-- Drop and recreate recent_changes view with correct column references
DROP VIEW IF EXISTS recent_changes;
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

-- Drop and recreate active_pins view with correct column references
DROP VIEW IF EXISTS active_pins;
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
