-- CreateTable
CREATE TABLE "raw_import_batches" (
    "id" TEXT NOT NULL,
    "source_system" TEXT NOT NULL,
    "source_entity" TEXT NOT NULL,
    "source_label" TEXT,
    "import_status" TEXT NOT NULL,
    "row_count" INTEGER,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_players" (
    "id" TEXT NOT NULL,
    "import_batch_id" TEXT NOT NULL,
    "source_system" TEXT NOT NULL,
    "source_record_id" TEXT NOT NULL,
    "external_nhl_id" INTEGER,
    "full_name" TEXT,
    "birth_date" TIMESTAMP(3),
    "position_raw" TEXT,
    "shoots_catches_raw" TEXT,
    "payload" JSONB NOT NULL,
    "source_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_teams" (
    "id" TEXT NOT NULL,
    "import_batch_id" TEXT NOT NULL,
    "source_system" TEXT NOT NULL,
    "source_record_id" TEXT NOT NULL,
    "external_nhl_id" INTEGER,
    "name" TEXT,
    "abbreviation" TEXT,
    "city" TEXT,
    "conference" TEXT,
    "division" TEXT,
    "payload" JSONB NOT NULL,
    "source_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_seasons" (
    "id" TEXT NOT NULL,
    "import_batch_id" TEXT NOT NULL,
    "source_system" TEXT NOT NULL,
    "source_record_id" TEXT NOT NULL,
    "season_code" TEXT,
    "start_year" INTEGER,
    "end_year" INTEGER,
    "salary_cap" DECIMAL(12,2),
    "payload" JSONB NOT NULL,
    "source_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_player_seasons" (
    "id" TEXT NOT NULL,
    "import_batch_id" TEXT NOT NULL,
    "source_system" TEXT NOT NULL,
    "source_record_id" TEXT NOT NULL,
    "source_player_id" TEXT,
    "source_team_id" TEXT,
    "external_nhl_player_id" INTEGER,
    "external_nhl_team_id" INTEGER,
    "season_code" TEXT,
    "games_played" INTEGER,
    "goals" INTEGER,
    "assists" INTEGER,
    "points" INTEGER,
    "time_on_ice_seconds" INTEGER,
    "payload" JSONB NOT NULL,
    "source_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_player_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_contracts" (
    "id" TEXT NOT NULL,
    "import_batch_id" TEXT NOT NULL,
    "source_system" TEXT NOT NULL,
    "source_record_id" TEXT NOT NULL,
    "source_player_id" TEXT,
    "source_team_id" TEXT,
    "external_nhl_player_id" INTEGER,
    "external_nhl_team_id" INTEGER,
    "sign_date" TIMESTAMP(3),
    "start_season_code" TEXT,
    "end_season_code" TEXT,
    "term_years" INTEGER,
    "total_value" DECIMAL(14,2),
    "average_annual_value" DECIMAL(14,2),
    "contract_type" TEXT,
    "signing_status" TEXT,
    "payload" JSONB NOT NULL,
    "source_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_contract_years" (
    "id" TEXT NOT NULL,
    "import_batch_id" TEXT NOT NULL,
    "source_system" TEXT NOT NULL,
    "source_record_id" TEXT NOT NULL,
    "source_contract_id" TEXT,
    "source_team_id" TEXT,
    "season_code" TEXT,
    "external_nhl_team_id" INTEGER,
    "cap_hit" DECIMAL(14,2),
    "base_salary" DECIMAL(14,2),
    "signing_bonus" DECIMAL(14,2),
    "performance_bonus" DECIMAL(14,2),
    "total_salary" DECIMAL(14,2),
    "payload" JSONB NOT NULL,
    "source_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_contract_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_transactions" (
    "id" TEXT NOT NULL,
    "import_batch_id" TEXT NOT NULL,
    "source_system" TEXT NOT NULL,
    "source_record_id" TEXT NOT NULL,
    "source_player_id" TEXT,
    "source_from_team_id" TEXT,
    "source_to_team_id" TEXT,
    "transaction_date" TIMESTAMP(3),
    "transaction_type" TEXT,
    "description" TEXT,
    "payload" JSONB NOT NULL,
    "source_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_roster_snapshots" (
    "id" TEXT NOT NULL,
    "import_batch_id" TEXT NOT NULL,
    "source_system" TEXT NOT NULL,
    "source_record_id" TEXT NOT NULL,
    "source_player_id" TEXT,
    "source_team_id" TEXT,
    "season_code" TEXT,
    "snapshot_date" TIMESTAMP(3),
    "roster_status" TEXT,
    "payload" JSONB NOT NULL,
    "source_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_roster_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "raw_import_batches_source_system_source_entity_idx" ON "raw_import_batches"("source_system", "source_entity");

-- CreateIndex
CREATE INDEX "raw_import_batches_import_status_idx" ON "raw_import_batches"("import_status");

-- CreateIndex
CREATE INDEX "raw_players_external_nhl_id_idx" ON "raw_players"("external_nhl_id");

-- CreateIndex
CREATE INDEX "raw_players_import_batch_id_idx" ON "raw_players"("import_batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "raw_players_source_system_source_record_id_key" ON "raw_players"("source_system", "source_record_id");

-- CreateIndex
CREATE INDEX "raw_teams_external_nhl_id_idx" ON "raw_teams"("external_nhl_id");

-- CreateIndex
CREATE INDEX "raw_teams_import_batch_id_idx" ON "raw_teams"("import_batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "raw_teams_source_system_source_record_id_key" ON "raw_teams"("source_system", "source_record_id");

-- CreateIndex
CREATE INDEX "raw_seasons_import_batch_id_idx" ON "raw_seasons"("import_batch_id");

-- CreateIndex
CREATE INDEX "raw_seasons_season_code_idx" ON "raw_seasons"("season_code");

-- CreateIndex
CREATE UNIQUE INDEX "raw_seasons_source_system_source_record_id_key" ON "raw_seasons"("source_system", "source_record_id");

-- CreateIndex
CREATE INDEX "raw_player_seasons_external_nhl_player_id_idx" ON "raw_player_seasons"("external_nhl_player_id");

-- CreateIndex
CREATE INDEX "raw_player_seasons_external_nhl_team_id_idx" ON "raw_player_seasons"("external_nhl_team_id");

-- CreateIndex
CREATE INDEX "raw_player_seasons_import_batch_id_idx" ON "raw_player_seasons"("import_batch_id");

-- CreateIndex
CREATE INDEX "raw_player_seasons_season_code_idx" ON "raw_player_seasons"("season_code");

-- CreateIndex
CREATE UNIQUE INDEX "raw_player_seasons_source_system_source_record_id_key" ON "raw_player_seasons"("source_system", "source_record_id");

-- CreateIndex
CREATE INDEX "raw_contracts_external_nhl_player_id_idx" ON "raw_contracts"("external_nhl_player_id");

-- CreateIndex
CREATE INDEX "raw_contracts_external_nhl_team_id_idx" ON "raw_contracts"("external_nhl_team_id");

-- CreateIndex
CREATE INDEX "raw_contracts_import_batch_id_idx" ON "raw_contracts"("import_batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "raw_contracts_source_system_source_record_id_key" ON "raw_contracts"("source_system", "source_record_id");

-- CreateIndex
CREATE INDEX "raw_contract_years_external_nhl_team_id_idx" ON "raw_contract_years"("external_nhl_team_id");

-- CreateIndex
CREATE INDEX "raw_contract_years_import_batch_id_idx" ON "raw_contract_years"("import_batch_id");

-- CreateIndex
CREATE INDEX "raw_contract_years_season_code_idx" ON "raw_contract_years"("season_code");

-- CreateIndex
CREATE UNIQUE INDEX "raw_contract_years_source_system_source_record_id_key" ON "raw_contract_years"("source_system", "source_record_id");

-- CreateIndex
CREATE INDEX "raw_transactions_import_batch_id_idx" ON "raw_transactions"("import_batch_id");

-- CreateIndex
CREATE INDEX "raw_transactions_transaction_date_idx" ON "raw_transactions"("transaction_date");

-- CreateIndex
CREATE UNIQUE INDEX "raw_transactions_source_system_source_record_id_key" ON "raw_transactions"("source_system", "source_record_id");

-- CreateIndex
CREATE INDEX "raw_roster_snapshots_import_batch_id_idx" ON "raw_roster_snapshots"("import_batch_id");

-- CreateIndex
CREATE INDEX "raw_roster_snapshots_season_code_idx" ON "raw_roster_snapshots"("season_code");

-- CreateIndex
CREATE INDEX "raw_roster_snapshots_snapshot_date_idx" ON "raw_roster_snapshots"("snapshot_date");

-- CreateIndex
CREATE UNIQUE INDEX "raw_roster_snapshots_source_system_source_record_id_key" ON "raw_roster_snapshots"("source_system", "source_record_id");

-- AddForeignKey
ALTER TABLE "raw_players" ADD CONSTRAINT "raw_players_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "raw_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_teams" ADD CONSTRAINT "raw_teams_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "raw_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_seasons" ADD CONSTRAINT "raw_seasons_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "raw_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_player_seasons" ADD CONSTRAINT "raw_player_seasons_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "raw_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_contracts" ADD CONSTRAINT "raw_contracts_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "raw_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_contract_years" ADD CONSTRAINT "raw_contract_years_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "raw_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_transactions" ADD CONSTRAINT "raw_transactions_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "raw_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_roster_snapshots" ADD CONSTRAINT "raw_roster_snapshots_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "raw_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
