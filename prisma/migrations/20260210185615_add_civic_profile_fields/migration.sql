-- AlterTable
ALTER TABLE "users_extended" ADD COLUMN     "civic_profile_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "first_name" VARCHAR(100),
ADD COLUMN     "last_name" VARCHAR(100),
ADD COLUMN     "phone_number" VARCHAR(20),
ADD COLUMN     "zip_code" VARCHAR(10);

-- CreateIndex
CREATE INDEX "users_extended_civic_profile_completed_idx" ON "users_extended"("civic_profile_completed");
