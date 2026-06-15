CREATE SEQUENCE "players_player_number_id_seq";

ALTER TABLE "players"
ADD COLUMN "player_number_id" INTEGER;

UPDATE "players" AS p
SET "player_number_id" = numbered.row_number
FROM (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "created_at", "full_name", "id") AS row_number
  FROM "players"
) AS numbered
WHERE p."id" = numbered."id";

ALTER TABLE "players"
ALTER COLUMN "player_number_id" SET DEFAULT nextval('"players_player_number_id_seq"'),
ALTER COLUMN "player_number_id" SET NOT NULL;

SELECT setval(
  '"players_player_number_id_seq"',
  COALESCE((SELECT MAX("player_number_id") FROM "players"), 0) + 1,
  false
);

ALTER SEQUENCE "players_player_number_id_seq" OWNED BY "players"."player_number_id";

CREATE UNIQUE INDEX "players_player_number_id_key" ON "players"("player_number_id");
