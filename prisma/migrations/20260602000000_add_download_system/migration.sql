-- Add fileUrl and fileSize to Product (replaces downloadUrl)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "fileUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "fileSize" INTEGER NOT NULL DEFAULT 0;

-- Remove old downloadUrl column if it exists
ALTER TABLE "Product" DROP COLUMN IF EXISTS "downloadUrl";

-- Create DownloadToken table for order-based downloads
CREATE TABLE IF NOT EXISTS "DownloadToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL DEFAULT '',
    "downloaded" BOOLEAN NOT NULL DEFAULT false,
    "downloadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DownloadToken_pkey" PRIMARY KEY ("id")
);

-- Unique index for token lookup
CREATE UNIQUE INDEX IF NOT EXISTS "DownloadToken_token_key" ON "DownloadToken"("token");

-- Index for token-based queries
CREATE INDEX IF NOT EXISTS "DownloadToken_token_idx" ON "DownloadToken"("token");

-- Foreign keys with cascade delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DownloadToken_orderId_fkey'
  ) THEN
    ALTER TABLE "DownloadToken" ADD CONSTRAINT "DownloadToken_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DownloadToken_productId_fkey'
  ) THEN
    ALTER TABLE "DownloadToken" ADD CONSTRAINT "DownloadToken_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
