/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Track` table. All the data in the column will be lost.
  - The `createdAt` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedAt` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "User_login_key";

-- AlterTable
ALTER TABLE "Album" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "version";

-- AlterTable
ALTER TABLE "Artist" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "version",
ALTER COLUMN "grammy" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "version";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" SERIAL NOT NULL,
DROP COLUMN "updatedAt",
ADD COLUMN     "updatedAt" SERIAL NOT NULL;
