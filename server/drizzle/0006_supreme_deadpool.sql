-- Remove duplicate words, keeping the earliest inserted copy of each simplified form.
-- Cascades to user_progress rows referencing the deleted duplicate word IDs.
DELETE FROM "words" WHERE id NOT IN (
  SELECT MIN(id) FROM "words" GROUP BY simplified
);

ALTER TABLE "words" ADD CONSTRAINT "words_simplified_unique" UNIQUE("simplified");