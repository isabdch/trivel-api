/*
  Warnings:

  - Added the required column `user_id` to the `itineraries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "itineraries" ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
