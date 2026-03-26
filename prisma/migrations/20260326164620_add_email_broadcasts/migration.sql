-- CreateTable
CREATE TABLE "email_broadcasts" (
    "id" SERIAL NOT NULL,
    "subject" VARCHAR(200) NOT NULL,
    "intro_text" TEXT NOT NULL,
    "featured_pages" JSONB NOT NULL DEFAULT '[]',
    "recipient_count" INTEGER NOT NULL DEFAULT 0,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "sent_by" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_broadcasts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_broadcasts_status_idx" ON "email_broadcasts"("status");

-- CreateIndex
CREATE INDEX "email_broadcasts_sent_at_idx" ON "email_broadcasts"("sent_at" DESC);

-- AddForeignKey
ALTER TABLE "email_broadcasts" ADD CONSTRAINT "email_broadcasts_sent_by_fkey" FOREIGN KEY ("sent_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
