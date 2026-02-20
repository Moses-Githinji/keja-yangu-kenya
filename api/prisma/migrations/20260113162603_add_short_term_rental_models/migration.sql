-- CreateTable
CREATE TABLE "short_term_bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "guests" INTEGER NOT NULL DEFAULT 1,
    "totalAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bookingCode" TEXT NOT NULL,
    "specialRequests" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "confirmedAt" DATETIME,
    "cancelledAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "short_term_bookings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "short_term_bookings_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "short_term_bookings_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "booking_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reference" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "booking_payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "short_term_bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "booking_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "booking_reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "short_term_bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "booking_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "booking_reviews_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "property_calendar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "price" REAL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "minStay" INTEGER NOT NULL DEFAULT 1,
    "maxStay" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "property_calendar_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "short_term_bookings_bookingCode_key" ON "short_term_bookings"("bookingCode");

-- CreateIndex
CREATE INDEX "short_term_bookings_propertyId_idx" ON "short_term_bookings"("propertyId");

-- CreateIndex
CREATE INDEX "short_term_bookings_guestId_idx" ON "short_term_bookings"("guestId");

-- CreateIndex
CREATE INDEX "short_term_bookings_hostId_idx" ON "short_term_bookings"("hostId");

-- CreateIndex
CREATE INDEX "short_term_bookings_status_idx" ON "short_term_bookings"("status");

-- CreateIndex
CREATE INDEX "short_term_bookings_checkIn_checkOut_idx" ON "short_term_bookings"("checkIn", "checkOut");

-- CreateIndex
CREATE UNIQUE INDEX "booking_payments_reference_key" ON "booking_payments"("reference");

-- CreateIndex
CREATE INDEX "booking_reviews_bookingId_idx" ON "booking_reviews"("bookingId");

-- CreateIndex
CREATE INDEX "booking_reviews_reviewerId_idx" ON "booking_reviews"("reviewerId");

-- CreateIndex
CREATE INDEX "booking_reviews_revieweeId_idx" ON "booking_reviews"("revieweeId");

-- CreateIndex
CREATE INDEX "property_calendar_propertyId_idx" ON "property_calendar"("propertyId");

-- CreateIndex
CREATE INDEX "property_calendar_date_idx" ON "property_calendar"("date");

-- CreateIndex
CREATE UNIQUE INDEX "property_calendar_propertyId_date_key" ON "property_calendar"("propertyId", "date");
