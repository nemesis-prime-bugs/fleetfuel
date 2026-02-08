/*
  Warnings:

  - You are about to drop the column `driverNote` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `occurredAt` on the `Trip` table. All the data in the column will be lost.
  - You are about to alter the column `distance` on the `Trip` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - Added the required column `driverId` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endedAt` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `odometerEnd` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `odometerStart` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startedAt` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "endedAt" DATETIME NOT NULL,
    "odometerStart" INTEGER NOT NULL,
    "odometerEnd" INTEGER NOT NULL,
    "distance" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Trip" ("createdAt", "distance", "id", "notes", "updatedAt", "vehicleId") SELECT "createdAt", "distance", "id", "notes", "updatedAt", "vehicleId" FROM "Trip";
DROP TABLE "Trip";
ALTER TABLE "new_Trip" RENAME TO "Trip";
CREATE INDEX "Trip_vehicleId_startedAt_idx" ON "Trip"("vehicleId", "startedAt");
CREATE INDEX "Trip_driverId_startedAt_idx" ON "Trip"("driverId", "startedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Driver_userId_idx" ON "Driver"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_name_key" ON "Driver"("userId", "name");
