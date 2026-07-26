-- Weekly reports now retain category summaries and source IDs directly in JSON.
-- Existing weekly report rows remain intact; only the redundant normalized
-- theme projection is removed.
DROP TABLE IF EXISTS feedback_theme_memberships;
DROP TABLE IF EXISTS feedback_themes;
