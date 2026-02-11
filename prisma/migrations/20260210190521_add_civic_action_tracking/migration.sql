-- CreateTable
CREATE TABLE "civic_actions" (
    "id" BIGSERIAL NOT NULL,
    "actionType" VARCHAR(50) NOT NULL,
    "repOffice" VARCHAR(100),
    "repName" VARCHAR(200),
    "sourcePage" VARCHAR(500) NOT NULL,
    "action_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "civic_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "civic_actions_actionType_idx" ON "civic_actions"("actionType");

-- CreateIndex
CREATE INDEX "civic_actions_action_date_idx" ON "civic_actions"("action_date");

-- CreateIndex
CREATE INDEX "civic_actions_actionType_action_date_idx" ON "civic_actions"("actionType", "action_date");

-- CreateIndex
CREATE INDEX "civic_actions_sourcePage_action_date_idx" ON "civic_actions"("sourcePage", "action_date");
