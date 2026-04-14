-- CreateTable
CREATE TABLE "club_invite_links" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_invite_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "club_invite_links_token_key" ON "club_invite_links"("token");

-- AddForeignKey
ALTER TABLE "club_invite_links" ADD CONSTRAINT "club_invite_links_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
