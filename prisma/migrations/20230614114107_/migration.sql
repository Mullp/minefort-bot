/*
  Warnings:

  - The primary key for the `DiscordUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `DiscordUser` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "DiscordUser" DROP CONSTRAINT "DiscordUser_pkey",
ADD COLUMN     "minefortUserId" INTEGER,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "DiscordUser_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "MinefortUser" (
    "id" SERIAL NOT NULL,
    "minefortId" TEXT NOT NULL,
    "email" TEXT,
    "sessionToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MinefortUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MinefortServer" (
    "id" SERIAL NOT NULL,
    "serverId" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "motd" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MinefortServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerHistory" (
    "id" SERIAL NOT NULL,
    "serverId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServerHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PlayerToServerHistory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MinefortUser_minefortId_key" ON "MinefortUser"("minefortId");

-- CreateIndex
CREATE UNIQUE INDEX "MinefortServer_serverId_key" ON "MinefortServer"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_uuid_key" ON "Player"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "_PlayerToServerHistory_AB_unique" ON "_PlayerToServerHistory"("A", "B");

-- CreateIndex
CREATE INDEX "_PlayerToServerHistory_B_index" ON "_PlayerToServerHistory"("B");

-- AddForeignKey
ALTER TABLE "DiscordUser" ADD CONSTRAINT "DiscordUser_minefortUserId_fkey" FOREIGN KEY ("minefortUserId") REFERENCES "MinefortUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinefortServer" ADD CONSTRAINT "MinefortServer_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "MinefortUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerHistory" ADD CONSTRAINT "ServerHistory_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "MinefortServer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerToServerHistory" ADD CONSTRAINT "_PlayerToServerHistory_A_fkey" FOREIGN KEY ("A") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerToServerHistory" ADD CONSTRAINT "_PlayerToServerHistory_B_fkey" FOREIGN KEY ("B") REFERENCES "ServerHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
