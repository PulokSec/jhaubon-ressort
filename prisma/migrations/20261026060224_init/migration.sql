-- CreateEnum
CREATE TYPE "SpaceKind" AS ENUM ('SUITE', 'LOBBY', 'POOL', 'BATH');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BKASH', 'NAGAD', 'ROCKET', 'BANK_TRANSFER', 'PAY_AT_HOTEL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'AWAITING_VERIFICATION', 'ADVANCE_PAID', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'FRONT_DESK');

-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "SpaceKind" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "nameEn" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "summaryEn" TEXT NOT NULL,
    "summaryBn" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionBn" TEXT NOT NULL,
    "facts" JSONB NOT NULL DEFAULT '[]',
    "bookable" BOOLEAN NOT NULL DEFAULT false,
    "units" INTEGER NOT NULL DEFAULT 0,
    "maxGuests" INTEGER NOT NULL DEFAULT 2,
    "nightlyRate" INTEGER NOT NULL DEFAULT 0,
    "weekendRate" INTEGER,
    "splatUrl" TEXT,
    "splatRotation" JSONB,
    "posterUrl" TEXT,
    "startPose" JSONB,
    "viewpoints" JSONB NOT NULL DEFAULT '[]',
    "credit" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "checkIn" DATE NOT NULL,
    "checkOut" DATE NOT NULL,
    "nights" INTEGER NOT NULL,
    "adults" INTEGER NOT NULL,
    "children" INTEGER NOT NULL DEFAULT 0,
    "guestName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "specialNote" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "roomTotal" INTEGER NOT NULL,
    "serviceCharge" INTEGER NOT NULL,
    "vat" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "advanceDue" INTEGER NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "transactionId" TEXT,
    "payerNumber" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "vatPercent" DECIMAL(5,2) NOT NULL DEFAULT 15,
    "serviceChargePercent" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "advancePercent" INTEGER NOT NULL DEFAULT 30,
    "weekendNights" INTEGER[] DEFAULT ARRAY[4, 5]::INTEGER[],
    "bkashNumber" TEXT,
    "nagadNumber" TEXT,
    "rocketNumber" TEXT,
    "bankDetails" TEXT,
    "hotline" TEXT NOT NULL DEFAULT '+8801700000000',
    "checkInTime" TEXT NOT NULL DEFAULT '14:00',
    "checkOutTime" TEXT NOT NULL DEFAULT '12:00',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'FRONT_DESK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Space_slug_key" ON "Space"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_reference_key" ON "Booking"("reference");

-- CreateIndex
CREATE INDEX "Booking_spaceId_checkIn_checkOut_idx" ON "Booking"("spaceId", "checkIn", "checkOut");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_phone_idx" ON "Booking"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
