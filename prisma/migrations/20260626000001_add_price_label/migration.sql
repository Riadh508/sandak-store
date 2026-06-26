-- Add priceLabel column to Product
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "priceLabel" TEXT NOT NULL DEFAULT '';
