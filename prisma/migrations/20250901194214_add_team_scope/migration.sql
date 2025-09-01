/*
  Warnings:

  - You are about to drop the column `projectId` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the `Invitation` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,scope]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `targetType` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `action` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `teamId` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `roleId` on table `ProjectMember` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."RoleScope" AS ENUM ('TEAM', 'PROJECT');

-- CreateEnum
CREATE TYPE "public"."AuditAction" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'ASSIGNED', 'UNASSIGNED', 'STATUS_CHANGED', 'COMMENTED', 'FILE_UPLOADED', 'FILE_DELETED', 'INVITED', 'JOINED', 'LEFT', 'ROLE_CHANGED');

-- CreateEnum
CREATE TYPE "public"."AuditTarget" AS ENUM ('TEAM', 'PROJECT', 'MILESTONE', 'TASK', 'COMMENT', 'ATTACHMENT', 'USER');

-- DropForeignKey
ALTER TABLE "public"."Invitation" DROP CONSTRAINT "Invitation_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Invitation" DROP CONSTRAINT "Invitation_roleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Project" DROP CONSTRAINT "Project_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProjectMember" DROP CONSTRAINT "ProjectMember_roleId_fkey";

-- DropIndex
DROP INDEX "public"."Role_name_projectId_key";

-- AlterTable
ALTER TABLE "public"."AuditLog" ADD COLUMN     "targetId" TEXT,
ADD COLUMN     "targetType" "public"."AuditTarget" NOT NULL,
DROP COLUMN "action",
ADD COLUMN     "action" "public"."AuditAction" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Project" ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "teamId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."ProjectMember" ALTER COLUMN "roleId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Role" DROP COLUMN "projectId",
ADD COLUMN     "scope" "public"."RoleScope" NOT NULL DEFAULT 'PROJECT';

-- DropTable
DROP TABLE "public"."Invitation";

-- CreateTable
CREATE TABLE "public"."TeamInvitation" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT,

    CONSTRAINT "TeamInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_scope_key" ON "public"."Role"("name", "scope");

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectMember" ADD CONSTRAINT "ProjectMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamInvitation" ADD CONSTRAINT "TeamInvitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamInvitation" ADD CONSTRAINT "TeamInvitation_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamInvitation" ADD CONSTRAINT "TeamInvitation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
