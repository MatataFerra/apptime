-- Shift lists filter by the user's Shift container (shiftId). SQLite doesn't
-- index foreign keys on its own, so without these every list read scanned
-- the whole Hourly / Production table, every user's rows included.
CREATE INDEX "Hourly_shiftId_idx" ON "Hourly"("shiftId");

-- CreateIndex
CREATE INDEX "Production_shiftId_idx" ON "Production"("shiftId");
