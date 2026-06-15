-- CreateEnum
CREATE TYPE "Position" AS ENUM ('C', 'LW', 'RW', 'D', 'G');

-- CreateEnum
CREATE TYPE "ShootsCatches" AS ENUM ('L', 'R');

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "external_nhl_id" INTEGER,
    "full_name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3),
    "position" "Position",
    "shoots_catches" "ShootsCatches",
    "height_inches" INTEGER,
    "weight_lbs" INTEGER,
    "draft_year" INTEGER,
    "draft_round" INTEGER,
    "draft_pick" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "external_nhl_id" INTEGER,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "conference" TEXT,
    "division" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasons" (
    "id" TEXT NOT NULL,
    "season_code" TEXT NOT NULL,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER NOT NULL,
    "salary_cap" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_seasons" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "games_played" INTEGER,
    "time_on_ice_seconds" INTEGER,
    "goals" INTEGER,
    "assists" INTEGER,
    "points" INTEGER,
    "shots" INTEGER,
    "plus_minus" INTEGER,
    "penalty_minutes" INTEGER,
    "power_play_goals" INTEGER,
    "power_play_points" INTEGER,
    "short_handed_goals" INTEGER,
    "short_handed_points" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_seasons" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "wins" INTEGER,
    "losses" INTEGER,
    "overtime_losses" INTEGER,
    "points" INTEGER,
    "goals_for" INTEGER,
    "goals_against" INTEGER,
    "goal_differential" INTEGER,
    "playoff_result" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "signing_team_id" TEXT NOT NULL,
    "sign_date" TIMESTAMP(3),
    "start_season_id" TEXT NOT NULL,
    "end_season_id" TEXT NOT NULL,
    "term_years" INTEGER NOT NULL,
    "total_value" DECIMAL(14,2),
    "average_annual_value" DECIMAL(14,2),
    "contract_type" TEXT,
    "signing_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_years" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "cap_hit" DECIMAL(14,2),
    "base_salary" DECIMAL(14,2),
    "signing_bonus" DECIMAL(14,2),
    "performance_bonus" DECIMAL(14,2),
    "total_salary" DECIMAL(14,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "player_id" TEXT,
    "from_team_id" TEXT,
    "to_team_id" TEXT,
    "contract_id" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roster_snapshots" (
    "id" TEXT NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL,
    "team_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "roster_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roster_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_advanced_seasons" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "corsi_for_pct" DOUBLE PRECISION,
    "fenwick_for_pct" DOUBLE PRECISION,
    "expected_goals_for_pct" DOUBLE PRECISION,
    "individual_expected_goals" DOUBLE PRECISION,
    "goals_above_replacement" DOUBLE PRECISION,
    "wins_above_replacement" DOUBLE PRECISION,
    "offensive_rapm" DOUBLE PRECISION,
    "defensive_rapm" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_advanced_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_tracking_seasons" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "top_speed_mph" DOUBLE PRECISION,
    "avg_speed_mph" DOUBLE PRECISION,
    "speed_bursts_20_plus" INTEGER,
    "zone_entries" INTEGER,
    "zone_exits" INTEGER,
    "puck_possession_seconds" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_tracking_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_features" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "offensive_creation" DOUBLE PRECISION,
    "finishing" DOUBLE PRECISION,
    "playmaking" DOUBLE PRECISION,
    "transition_value" DOUBLE PRECISION,
    "defensive_value" DOUBLE PRECISION,
    "power_play_value" DOUBLE PRECISION,
    "penalty_kill_value" DOUBLE PRECISION,
    "durability" DOUBLE PRECISION,
    "usage_difficulty" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_external_nhl_id_key" ON "players"("external_nhl_id");

-- CreateIndex
CREATE INDEX "players_full_name_idx" ON "players"("full_name");

-- CreateIndex
CREATE UNIQUE INDEX "teams_external_nhl_id_key" ON "teams"("external_nhl_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_abbreviation_key" ON "teams"("abbreviation");

-- CreateIndex
CREATE INDEX "teams_name_idx" ON "teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "seasons_season_code_key" ON "seasons"("season_code");

-- CreateIndex
CREATE UNIQUE INDEX "seasons_start_year_end_year_key" ON "seasons"("start_year", "end_year");

-- CreateIndex
CREATE INDEX "player_seasons_player_id_idx" ON "player_seasons"("player_id");

-- CreateIndex
CREATE INDEX "player_seasons_season_id_idx" ON "player_seasons"("season_id");

-- CreateIndex
CREATE INDEX "player_seasons_team_id_idx" ON "player_seasons"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_seasons_player_id_season_id_team_id_key" ON "player_seasons"("player_id", "season_id", "team_id");

-- CreateIndex
CREATE INDEX "team_seasons_team_id_idx" ON "team_seasons"("team_id");

-- CreateIndex
CREATE INDEX "team_seasons_season_id_idx" ON "team_seasons"("season_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_seasons_team_id_season_id_key" ON "team_seasons"("team_id", "season_id");

-- CreateIndex
CREATE INDEX "contracts_player_id_idx" ON "contracts"("player_id");

-- CreateIndex
CREATE INDEX "contracts_signing_team_id_idx" ON "contracts"("signing_team_id");

-- CreateIndex
CREATE INDEX "contracts_start_season_id_idx" ON "contracts"("start_season_id");

-- CreateIndex
CREATE INDEX "contracts_end_season_id_idx" ON "contracts"("end_season_id");

-- CreateIndex
CREATE INDEX "contract_years_contract_id_idx" ON "contract_years"("contract_id");

-- CreateIndex
CREATE INDEX "contract_years_season_id_idx" ON "contract_years"("season_id");

-- CreateIndex
CREATE INDEX "contract_years_team_id_idx" ON "contract_years"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "contract_years_contract_id_season_id_key" ON "contract_years"("contract_id", "season_id");

-- CreateIndex
CREATE INDEX "transactions_contract_id_idx" ON "transactions"("contract_id");

-- CreateIndex
CREATE INDEX "transactions_from_team_id_idx" ON "transactions"("from_team_id");

-- CreateIndex
CREATE INDEX "transactions_player_id_idx" ON "transactions"("player_id");

-- CreateIndex
CREATE INDEX "transactions_to_team_id_idx" ON "transactions"("to_team_id");

-- CreateIndex
CREATE INDEX "transactions_transaction_date_idx" ON "transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "roster_snapshots_player_id_idx" ON "roster_snapshots"("player_id");

-- CreateIndex
CREATE INDEX "roster_snapshots_season_id_idx" ON "roster_snapshots"("season_id");

-- CreateIndex
CREATE INDEX "roster_snapshots_snapshot_date_idx" ON "roster_snapshots"("snapshot_date");

-- CreateIndex
CREATE INDEX "roster_snapshots_team_id_idx" ON "roster_snapshots"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "roster_snapshots_snapshot_date_team_id_player_id_key" ON "roster_snapshots"("snapshot_date", "team_id", "player_id");

-- CreateIndex
CREATE INDEX "player_advanced_seasons_player_id_idx" ON "player_advanced_seasons"("player_id");

-- CreateIndex
CREATE INDEX "player_advanced_seasons_season_id_idx" ON "player_advanced_seasons"("season_id");

-- CreateIndex
CREATE INDEX "player_advanced_seasons_team_id_idx" ON "player_advanced_seasons"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_advanced_seasons_player_id_season_id_team_id_source_key" ON "player_advanced_seasons"("player_id", "season_id", "team_id", "source");

-- CreateIndex
CREATE INDEX "player_tracking_seasons_player_id_idx" ON "player_tracking_seasons"("player_id");

-- CreateIndex
CREATE INDEX "player_tracking_seasons_season_id_idx" ON "player_tracking_seasons"("season_id");

-- CreateIndex
CREATE INDEX "player_tracking_seasons_team_id_idx" ON "player_tracking_seasons"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_tracking_seasons_player_id_season_id_team_id_source_key" ON "player_tracking_seasons"("player_id", "season_id", "team_id", "source");

-- CreateIndex
CREATE INDEX "player_features_player_id_idx" ON "player_features"("player_id");

-- CreateIndex
CREATE INDEX "player_features_season_id_idx" ON "player_features"("season_id");

-- CreateIndex
CREATE INDEX "player_features_team_id_idx" ON "player_features"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_features_player_id_season_id_team_id_key" ON "player_features"("player_id", "season_id", "team_id");

-- AddForeignKey
ALTER TABLE "player_seasons" ADD CONSTRAINT "player_seasons_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_seasons" ADD CONSTRAINT "player_seasons_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_seasons" ADD CONSTRAINT "player_seasons_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_seasons" ADD CONSTRAINT "team_seasons_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_seasons" ADD CONSTRAINT "team_seasons_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_end_season_id_fkey" FOREIGN KEY ("end_season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_signing_team_id_fkey" FOREIGN KEY ("signing_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_start_season_id_fkey" FOREIGN KEY ("start_season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_years" ADD CONSTRAINT "contract_years_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_years" ADD CONSTRAINT "contract_years_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_years" ADD CONSTRAINT "contract_years_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_from_team_id_fkey" FOREIGN KEY ("from_team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_team_id_fkey" FOREIGN KEY ("to_team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roster_snapshots" ADD CONSTRAINT "roster_snapshots_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roster_snapshots" ADD CONSTRAINT "roster_snapshots_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roster_snapshots" ADD CONSTRAINT "roster_snapshots_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_advanced_seasons" ADD CONSTRAINT "player_advanced_seasons_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_advanced_seasons" ADD CONSTRAINT "player_advanced_seasons_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_advanced_seasons" ADD CONSTRAINT "player_advanced_seasons_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_tracking_seasons" ADD CONSTRAINT "player_tracking_seasons_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_tracking_seasons" ADD CONSTRAINT "player_tracking_seasons_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_tracking_seasons" ADD CONSTRAINT "player_tracking_seasons_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_features" ADD CONSTRAINT "player_features_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_features" ADD CONSTRAINT "player_features_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_features" ADD CONSTRAINT "player_features_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

