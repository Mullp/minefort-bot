-- CreateTable
CREATE TABLE "Follow" (
    "id" SERIAL NOT NULL,
    "discordUserId" INTEGER NOT NULL,
    "minefortServerId" INTEGER NOT NULL,
    "webhookUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_discordUserId_fkey" FOREIGN KEY ("discordUserId") REFERENCES "DiscordUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_minefortServerId_fkey" FOREIGN KEY ("minefortServerId") REFERENCES "MinefortServer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
