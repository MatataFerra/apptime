-- Employers: state, province or region (QLD, Buenos Aires, Bayern…).
-- Australian forms ask for it and the ABN Lookup returns it.
ALTER TABLE "Employer" ADD COLUMN "region" TEXT;
