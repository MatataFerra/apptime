-- Employers: which public register the details came from and when, shown
-- as "Data sourced from the …" (MBIE's API agreement requires it for NZBN).
ALTER TABLE "Employer" ADD COLUMN "sourceRegistry" TEXT;
ALTER TABLE "Employer" ADD COLUMN "sourcedAt" DATETIME;
