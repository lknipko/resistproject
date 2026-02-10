-- CreateTable
CREATE TABLE "external_link_clicks" (
    "id" BIGSERIAL NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "label" VARCHAR(200),
    "sourcePage" VARCHAR(500) NOT NULL,
    "sourceSection" VARCHAR(20) NOT NULL,
    "clicked_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "click_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "external_link_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "external_link_clicks_category_idx" ON "external_link_clicks"("category");

-- CreateIndex
CREATE INDEX "external_link_clicks_sourcePage_idx" ON "external_link_clicks"("sourcePage");

-- CreateIndex
CREATE INDEX "external_link_clicks_click_date_idx" ON "external_link_clicks"("click_date");

-- CreateIndex
CREATE INDEX "external_link_clicks_category_click_date_idx" ON "external_link_clicks"("category", "click_date");

-- CreateIndex
CREATE INDEX "external_link_clicks_sourcePage_click_date_idx" ON "external_link_clicks"("sourcePage", "click_date");
