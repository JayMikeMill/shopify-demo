/*
  Warnings:

  - Made the column `productId` on table `QRCode` required. This step will fail if there are existing NULL values in that column.
  - Made the column `productHandle` on table `QRCode` required. This step will fail if there are existing NULL values in that column.
  - Made the column `productVariantId` on table `QRCode` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "QRCode" ALTER COLUMN "productId" SET NOT NULL,
ALTER COLUMN "productHandle" SET NOT NULL,
ALTER COLUMN "productVariantId" SET NOT NULL;
