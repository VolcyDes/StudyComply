BEGIN;

TRUNCATE TABLE "StudyPurpose" RESTART IDENTITY CASCADE;

INSERT INTO "StudyPurpose" ("key","label") VALUES
  ('exchange',  'Exchange (semester)'),
  ('internship','Internship'),
  ('degree',    'Full degree'),
  ('phd',       'PhD / Research'),
  ('language',  'Language program');

COMMIT;
