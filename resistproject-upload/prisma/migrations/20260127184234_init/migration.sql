-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "users_extended" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" VARCHAR(100),
    "user_tier" INTEGER NOT NULL DEFAULT 1,
    "reputation_score" INTEGER NOT NULL DEFAULT 0,
    "edits_proposed" INTEGER NOT NULL DEFAULT 0,
    "edits_approved" INTEGER NOT NULL DEFAULT 0,
    "edits_rejected" INTEGER NOT NULL DEFAULT 0,
    "edits_reverted" INTEGER NOT NULL DEFAULT 0,
    "votes_cast" INTEGER NOT NULL DEFAULT 0,
    "votes_received_positive" INTEGER NOT NULL DEFAULT 0,
    "votes_received_negative" INTEGER NOT NULL DEFAULT 0,
    "reviews_completed" INTEGER NOT NULL DEFAULT 0,
    "account_status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "suspension_reason" TEXT,
    "suspension_expires" TIMESTAMP(3),
    "daily_edit_count" INTEGER NOT NULL DEFAULT 0,
    "daily_vote_count" INTEGER NOT NULL DEFAULT 0,
    "last_activity_reset" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "badges" JSONB NOT NULL DEFAULT '[]',
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "weekly_digest" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_failed_login" TIMESTAMP(3),
    "registration_ip_hash" VARCHAR(64),
    "last_known_ip_hash" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_extended_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_metadata" (
    "id" SERIAL NOT NULL,
    "page_id" INTEGER NOT NULL,
    "page_path" VARCHAR(500) NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 3,
    "content_type" VARCHAR(50) NOT NULL DEFAULT 'info',
    "issue_tags" JSONB NOT NULL DEFAULT '[]',
    "deadline" TIMESTAMPTZ,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "current_score" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "base_score" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "urgency_factor" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "freshness_factor" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "engagement_boost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "score_breakdown" JSONB NOT NULL DEFAULT '{}',
    "last_score_update" TIMESTAMPTZ,
    "impact_level" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "page_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edit_proposals" (
    "id" SERIAL NOT NULL,
    "page_id" INTEGER NOT NULL,
    "page_path" VARCHAR(500) NOT NULL,
    "proposer_id" TEXT NOT NULL,
    "proposer_tier" INTEGER NOT NULL,
    "original_content" TEXT NOT NULL,
    "proposed_content" TEXT NOT NULL,
    "diff_content" TEXT,
    "edit_summary" VARCHAR(500) NOT NULL,
    "edit_type" VARCHAR(30) NOT NULL DEFAULT 'content',
    "sections_affected" JSONB NOT NULL DEFAULT '[]',
    "validation_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "validation_results" JSONB NOT NULL DEFAULT '{}',
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "approval_score" INTEGER NOT NULL DEFAULT 0,
    "rejection_score" INTEGER NOT NULL DEFAULT 0,
    "approval_threshold" INTEGER NOT NULL DEFAULT 5,
    "resolved_by" TEXT,
    "resolution_reason" TEXT,
    "resolved_at" TIMESTAMPTZ,
    "base_revision" INTEGER,
    "has_conflict" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "edit_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" SERIAL NOT NULL,
    "proposal_id" INTEGER NOT NULL,
    "voter_id" TEXT NOT NULL,
    "voter_tier" INTEGER NOT NULL,
    "vote_type" VARCHAR(10) NOT NULL,
    "vote_weight" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" BIGSERIAL NOT NULL,
    "action_type" VARCHAR(50) NOT NULL,
    "action_category" VARCHAR(30) NOT NULL,
    "actor_id" TEXT,
    "actor_type" VARCHAR(20) NOT NULL DEFAULT 'user',
    "actor_ip_hash" VARCHAR(64),
    "target_type" VARCHAR(30),
    "target_id" INTEGER,
    "target_path" VARCHAR(500),
    "description" TEXT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "is_suspicious" BOOLEAN NOT NULL DEFAULT false,
    "security_notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_events" (
    "id" BIGSERIAL NOT NULL,
    "page_id" INTEGER NOT NULL,
    "page_path" VARCHAR(500) NOT NULL,
    "event_type" VARCHAR(30) NOT NULL,
    "event_target" VARCHAR(100),
    "session_hash" VARCHAR(64),
    "referrer_domain" VARCHAR(255),
    "user_agent_category" VARCHAR(30),
    "event_value" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_metrics_daily" (
    "id" SERIAL NOT NULL,
    "page_id" INTEGER NOT NULL,
    "page_path" VARCHAR(500) NOT NULL,
    "metric_date" DATE NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "unique_sessions" INTEGER NOT NULL DEFAULT 0,
    "action_clicks" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "external_clicks" INTEGER NOT NULL DEFAULT 0,
    "avg_time_on_page" INTEGER,
    "bounce_rate" DECIMAL(5,2),
    "daily_engagement_score" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "page_metrics_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pinned_pages" (
    "id" SERIAL NOT NULL,
    "page_id" INTEGER NOT NULL,
    "page_path" VARCHAR(500) NOT NULL,
    "pin_position" INTEGER NOT NULL DEFAULT 1,
    "pin_location" VARCHAR(50) NOT NULL DEFAULT 'homepage',
    "pin_label" VARCHAR(50),
    "pin_style" VARCHAR(30) NOT NULL DEFAULT 'standard',
    "start_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMPTZ,
    "pinned_by" TEXT NOT NULL,
    "pin_reason" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "pinned_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "users_extended_userId_key" ON "users_extended"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_extended_email_key" ON "users_extended"("email");

-- CreateIndex
CREATE INDEX "users_extended_user_tier_idx" ON "users_extended"("user_tier");

-- CreateIndex
CREATE INDEX "users_extended_reputation_score_idx" ON "users_extended"("reputation_score" DESC);

-- CreateIndex
CREATE INDEX "users_extended_account_status_idx" ON "users_extended"("account_status");

-- CreateIndex
CREATE INDEX "users_extended_registration_ip_hash_idx" ON "users_extended"("registration_ip_hash");

-- CreateIndex
CREATE UNIQUE INDEX "page_metadata_page_id_key" ON "page_metadata"("page_id");

-- CreateIndex
CREATE INDEX "page_metadata_page_id_idx" ON "page_metadata"("page_id");

-- CreateIndex
CREATE INDEX "page_metadata_page_path_idx" ON "page_metadata"("page_path");

-- CreateIndex
CREATE INDEX "page_metadata_tier_idx" ON "page_metadata"("tier");

-- CreateIndex
CREATE INDEX "page_metadata_content_type_idx" ON "page_metadata"("content_type");

-- CreateIndex
CREATE INDEX "page_metadata_status_idx" ON "page_metadata"("status");

-- CreateIndex
CREATE INDEX "page_metadata_deadline_idx" ON "page_metadata"("deadline");

-- CreateIndex
CREATE INDEX "page_metadata_current_score_idx" ON "page_metadata"("current_score" DESC);

-- CreateIndex
CREATE INDEX "idx_page_metadata_trending" ON "page_metadata"("status", "current_score" DESC);

-- CreateIndex
CREATE INDEX "edit_proposals_page_id_idx" ON "edit_proposals"("page_id");

-- CreateIndex
CREATE INDEX "edit_proposals_page_path_idx" ON "edit_proposals"("page_path");

-- CreateIndex
CREATE INDEX "edit_proposals_proposer_id_idx" ON "edit_proposals"("proposer_id");

-- CreateIndex
CREATE INDEX "edit_proposals_status_idx" ON "edit_proposals"("status");

-- CreateIndex
CREATE INDEX "edit_proposals_validation_status_idx" ON "edit_proposals"("validation_status");

-- CreateIndex
CREATE INDEX "edit_proposals_created_at_idx" ON "edit_proposals"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_edit_proposals_review_queue" ON "edit_proposals"("status", "validation_status", "created_at");

-- CreateIndex
CREATE INDEX "votes_proposal_id_idx" ON "votes"("proposal_id");

-- CreateIndex
CREATE INDEX "votes_voter_id_idx" ON "votes"("voter_id");

-- CreateIndex
CREATE INDEX "votes_vote_type_idx" ON "votes"("vote_type");

-- CreateIndex
CREATE INDEX "votes_created_at_idx" ON "votes"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "votes_proposal_id_voter_id_key" ON "votes"("proposal_id", "voter_id");

-- CreateIndex
CREATE INDEX "audit_log_action_type_idx" ON "audit_log"("action_type");

-- CreateIndex
CREATE INDEX "audit_log_action_category_idx" ON "audit_log"("action_category");

-- CreateIndex
CREATE INDEX "audit_log_actor_id_idx" ON "audit_log"("actor_id");

-- CreateIndex
CREATE INDEX "audit_log_target_type_target_id_idx" ON "audit_log"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "audit_log_target_path_idx" ON "audit_log"("target_path");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_log_is_suspicious_idx" ON "audit_log"("is_suspicious");

-- CreateIndex
CREATE INDEX "idx_audit_log_actor_activity" ON "audit_log"("actor_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_log_page_history" ON "audit_log"("target_path", "created_at" DESC);

-- CreateIndex
CREATE INDEX "page_events_page_id_idx" ON "page_events"("page_id");

-- CreateIndex
CREATE INDEX "page_events_page_path_idx" ON "page_events"("page_path");

-- CreateIndex
CREATE INDEX "page_events_event_type_idx" ON "page_events"("event_type");

-- CreateIndex
CREATE INDEX "page_events_event_date_idx" ON "page_events"("event_date");

-- CreateIndex
CREATE INDEX "page_events_created_at_idx" ON "page_events"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_page_events_engagement" ON "page_events"("page_id", "event_type", "event_date");

-- CreateIndex
CREATE INDEX "idx_page_events_session" ON "page_events"("page_id", "session_hash", "event_type", "event_date");

-- CreateIndex
CREATE INDEX "page_metrics_daily_page_id_idx" ON "page_metrics_daily"("page_id");

-- CreateIndex
CREATE INDEX "page_metrics_daily_metric_date_idx" ON "page_metrics_daily"("metric_date" DESC);

-- CreateIndex
CREATE INDEX "page_metrics_daily_daily_engagement_score_idx" ON "page_metrics_daily"("daily_engagement_score" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "page_metrics_daily_page_id_metric_date_key" ON "page_metrics_daily"("page_id", "metric_date");

-- CreateIndex
CREATE INDEX "pinned_pages_page_id_idx" ON "pinned_pages"("page_id");

-- CreateIndex
CREATE INDEX "pinned_pages_pin_location_idx" ON "pinned_pages"("pin_location");

-- CreateIndex
CREATE INDEX "pinned_pages_is_active_idx" ON "pinned_pages"("is_active");

-- CreateIndex
CREATE INDEX "pinned_pages_start_time_end_time_idx" ON "pinned_pages"("start_time", "end_time");

-- CreateIndex
CREATE INDEX "idx_pinned_pages_active_location" ON "pinned_pages"("pin_location", "pin_position");

-- CreateIndex
CREATE UNIQUE INDEX "pinned_pages_pin_location_pin_position_key" ON "pinned_pages"("pin_location", "pin_position");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_extended" ADD CONSTRAINT "users_extended_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edit_proposals" ADD CONSTRAINT "edit_proposals_proposer_id_fkey" FOREIGN KEY ("proposer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edit_proposals" ADD CONSTRAINT "edit_proposals_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "edit_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinned_pages" ADD CONSTRAINT "pinned_pages_pinned_by_fkey" FOREIGN KEY ("pinned_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
