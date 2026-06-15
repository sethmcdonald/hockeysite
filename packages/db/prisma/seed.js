const { PrismaClient, Position, ShootsCatches, Prisma } = require("@prisma/client");

const prisma = new PrismaClient();

const seasonIds = {
  "2022-2023": "season-2022-2023",
  "2023-2024": "season-2023-2024",
  "2024-2025": "season-2024-2025"
};

const teamIds = {
  TOR: "team-toronto-maple-leafs",
  COL: "team-colorado-avalanche",
  TBL: "team-tampa-bay-lightning"
};

const playerIds = {
  matthews: "player-auston-matthews",
  mackinnon: "player-nathan-mackinnon",
  kucherov: "player-nikita-kucherov"
};

const contractIds = {
  matthews: "contract-matthews-sample",
  mackinnon: "contract-mackinnon-sample",
  kucherov: "contract-kucherov-sample"
};

const rawImportBatchIds = {
  identities: "raw-batch-sample-identities",
  performance: "raw-batch-sample-performance",
  contracts: "raw-batch-sample-contracts",
  roster: "raw-batch-sample-roster",
  transactions: "raw-batch-sample-transactions"
};

function money(value) {
  return new Prisma.Decimal(value);
}

async function resetDatabase() {
  await prisma.rawTransaction.deleteMany();
  await prisma.rawRosterSnapshot.deleteMany();
  await prisma.rawContractYear.deleteMany();
  await prisma.rawContract.deleteMany();
  await prisma.rawPlayerSeason.deleteMany();
  await prisma.rawSeason.deleteMany();
  await prisma.rawTeam.deleteMany();
  await prisma.rawPlayer.deleteMany();
  await prisma.rawImportBatch.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.playerFeature.deleteMany();
  await prisma.playerTrackingSeason.deleteMany();
  await prisma.playerAdvancedSeason.deleteMany();
  await prisma.rosterSnapshot.deleteMany();
  await prisma.contractYear.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.teamSeason.deleteMany();
  await prisma.playerSeason.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.season.deleteMany();
}

async function seedSeasons() {
  await prisma.season.createMany({
    data: [
      {
        id: seasonIds["2022-2023"],
        season_code: "2022-23",
        start_year: 2022,
        end_year: 2023,
        salary_cap: money("82500000")
      },
      {
        id: seasonIds["2023-2024"],
        season_code: "2023-24",
        start_year: 2023,
        end_year: 2024,
        salary_cap: money("83500000")
      },
      {
        id: seasonIds["2024-2025"],
        season_code: "2024-25",
        start_year: 2024,
        end_year: 2025,
        salary_cap: money("88000000")
      }
    ]
  });
}

async function seedTeams() {
  await prisma.team.createMany({
    data: [
      {
        id: teamIds.TOR,
        external_nhl_id: 10,
        name: "Maple Leafs",
        abbreviation: "TOR",
        city: "Toronto",
        conference: "Eastern",
        division: "Atlantic"
      },
      {
        id: teamIds.COL,
        external_nhl_id: 21,
        name: "Avalanche",
        abbreviation: "COL",
        city: "Colorado",
        conference: "Western",
        division: "Central"
      },
      {
        id: teamIds.TBL,
        external_nhl_id: 14,
        name: "Lightning",
        abbreviation: "TBL",
        city: "Tampa Bay",
        conference: "Eastern",
        division: "Atlantic"
      }
    ]
  });
}

async function seedPlayers() {
  await prisma.player.createMany({
    data: [
      {
        id: playerIds.matthews,
        player_number_id: 1,
        external_nhl_id: 8479318,
        full_name: "Auston Matthews",
        birth_date: new Date("1997-09-17T00:00:00.000Z"),
        position: Position.C,
        shoots_catches: ShootsCatches.R,
        height_inches: 75,
        weight_lbs: 215,
        draft_year: 2016,
        draft_round: 1,
        draft_pick: 1
      },
      {
        id: playerIds.mackinnon,
        player_number_id: 2,
        external_nhl_id: 8477492,
        full_name: "Nathan MacKinnon",
        birth_date: new Date("1995-09-01T00:00:00.000Z"),
        position: Position.C,
        shoots_catches: ShootsCatches.R,
        height_inches: 72,
        weight_lbs: 200,
        draft_year: 2013,
        draft_round: 1,
        draft_pick: 1
      },
      {
        id: playerIds.kucherov,
        player_number_id: 3,
        external_nhl_id: 8476453,
        full_name: "Nikita Kucherov",
        birth_date: new Date("1993-06-17T00:00:00.000Z"),
        position: Position.RW,
        shoots_catches: ShootsCatches.L,
        height_inches: 71,
        weight_lbs: 180,
        draft_year: 2011,
        draft_round: 2,
        draft_pick: 58
      }
    ]
  });
}

async function seedPlayerSeasons() {
  await prisma.playerSeason.createMany({
    data: [
      {
        id: "player-season-matthews-2023-2024",
        player_id: playerIds.matthews,
        season_id: seasonIds["2023-2024"],
        team_id: teamIds.TOR,
        games_played: 81,
        time_on_ice_seconds: 157080,
        goals: 69,
        assists: 38,
        points: 107,
        shots: 315,
        plus_minus: 31,
        penalty_minutes: 20,
        power_play_goals: 27,
        power_play_points: 31,
        short_handed_goals: 1,
        short_handed_points: 1
      },
      {
        id: "player-season-mackinnon-2023-2024",
        player_id: playerIds.mackinnon,
        season_id: seasonIds["2023-2024"],
        team_id: teamIds.COL,
        games_played: 82,
        time_on_ice_seconds: 184500,
        goals: 51,
        assists: 89,
        points: 140,
        shots: 405,
        plus_minus: 35,
        penalty_minutes: 42,
        power_play_goals: 16,
        power_play_points: 50,
        short_handed_goals: 2,
        short_handed_points: 4
      },
      {
        id: "player-season-kucherov-2023-2024",
        player_id: playerIds.kucherov,
        season_id: seasonIds["2023-2024"],
        team_id: teamIds.TBL,
        games_played: 81,
        time_on_ice_seconds: 166320,
        goals: 44,
        assists: 100,
        points: 144,
        shots: 294,
        plus_minus: 8,
        penalty_minutes: 24,
        power_play_goals: 15,
        power_play_points: 53,
        short_handed_goals: 0,
        short_handed_points: 1
      }
    ]
  });
}

async function seedTeamSeasons() {
  await prisma.teamSeason.createMany({
    data: [
      {
        id: "team-season-tor-2023-2024",
        team_id: teamIds.TOR,
        season_id: seasonIds["2023-2024"],
        wins: 46,
        losses: 26,
        overtime_losses: 10,
        points: 102,
        goals_for: 303,
        goals_against: 263,
        goal_differential: 40,
        playoff_result: "Round 1"
      },
      {
        id: "team-season-col-2023-2024",
        team_id: teamIds.COL,
        season_id: seasonIds["2023-2024"],
        wins: 50,
        losses: 25,
        overtime_losses: 7,
        points: 107,
        goals_for: 304,
        goals_against: 252,
        goal_differential: 52,
        playoff_result: "Round 2"
      },
      {
        id: "team-season-tbl-2023-2024",
        team_id: teamIds.TBL,
        season_id: seasonIds["2023-2024"],
        wins: 45,
        losses: 29,
        overtime_losses: 8,
        points: 98,
        goals_for: 291,
        goals_against: 268,
        goal_differential: 23,
        playoff_result: "Round 1"
      }
    ]
  });
}

async function seedContracts() {
  await prisma.contract.createMany({
    data: [
      {
        id: contractIds.matthews,
        player_id: playerIds.matthews,
        signing_team_id: teamIds.TOR,
        sign_date: new Date("2022-07-13T00:00:00.000Z"),
        start_season_id: seasonIds["2022-2023"],
        end_season_id: seasonIds["2024-2025"],
        term_years: 3,
        total_value: money("34500000"),
        average_annual_value: money("11500000"),
        contract_type: "Standard Player Contract",
        signing_status: "Active"
      },
      {
        id: contractIds.mackinnon,
        player_id: playerIds.mackinnon,
        signing_team_id: teamIds.COL,
        sign_date: new Date("2022-09-20T00:00:00.000Z"),
        start_season_id: seasonIds["2022-2023"],
        end_season_id: seasonIds["2024-2025"],
        term_years: 3,
        total_value: money("37800000"),
        average_annual_value: money("12600000"),
        contract_type: "Standard Player Contract",
        signing_status: "Active"
      },
      {
        id: contractIds.kucherov,
        player_id: playerIds.kucherov,
        signing_team_id: teamIds.TBL,
        sign_date: new Date("2022-07-01T00:00:00.000Z"),
        start_season_id: seasonIds["2022-2023"],
        end_season_id: seasonIds["2024-2025"],
        term_years: 3,
        total_value: money("28500000"),
        average_annual_value: money("9500000"),
        contract_type: "Standard Player Contract",
        signing_status: "Active"
      }
    ]
  });
}

async function seedContractYears() {
  await prisma.contractYear.createMany({
    data: [
      {
        id: "contract-year-matthews-2022-2023",
        contract_id: contractIds.matthews,
        season_id: seasonIds["2022-2023"],
        team_id: teamIds.TOR,
        cap_hit: money("11500000"),
        base_salary: money("9000000"),
        signing_bonus: money("2000000"),
        performance_bonus: money("500000"),
        total_salary: money("11500000")
      },
      {
        id: "contract-year-matthews-2023-2024",
        contract_id: contractIds.matthews,
        season_id: seasonIds["2023-2024"],
        team_id: teamIds.TOR,
        cap_hit: money("11500000"),
        base_salary: money("9000000"),
        signing_bonus: money("2000000"),
        performance_bonus: money("500000"),
        total_salary: money("11500000")
      },
      {
        id: "contract-year-matthews-2024-2025",
        contract_id: contractIds.matthews,
        season_id: seasonIds["2024-2025"],
        team_id: teamIds.TOR,
        cap_hit: money("11500000"),
        base_salary: money("9000000"),
        signing_bonus: money("2000000"),
        performance_bonus: money("500000"),
        total_salary: money("11500000")
      },
      {
        id: "contract-year-mackinnon-2022-2023",
        contract_id: contractIds.mackinnon,
        season_id: seasonIds["2022-2023"],
        team_id: teamIds.COL,
        cap_hit: money("12600000"),
        base_salary: money("10000000"),
        signing_bonus: money("2500000"),
        performance_bonus: money("100000"),
        total_salary: money("12600000")
      },
      {
        id: "contract-year-mackinnon-2023-2024",
        contract_id: contractIds.mackinnon,
        season_id: seasonIds["2023-2024"],
        team_id: teamIds.COL,
        cap_hit: money("12600000"),
        base_salary: money("10000000"),
        signing_bonus: money("2500000"),
        performance_bonus: money("100000"),
        total_salary: money("12600000")
      },
      {
        id: "contract-year-mackinnon-2024-2025",
        contract_id: contractIds.mackinnon,
        season_id: seasonIds["2024-2025"],
        team_id: teamIds.COL,
        cap_hit: money("12600000"),
        base_salary: money("10000000"),
        signing_bonus: money("2500000"),
        performance_bonus: money("100000"),
        total_salary: money("12600000")
      },
      {
        id: "contract-year-kucherov-2022-2023",
        contract_id: contractIds.kucherov,
        season_id: seasonIds["2022-2023"],
        team_id: teamIds.TBL,
        cap_hit: money("9500000"),
        base_salary: money("7000000"),
        signing_bonus: money("2000000"),
        performance_bonus: money("500000"),
        total_salary: money("9500000")
      },
      {
        id: "contract-year-kucherov-2023-2024",
        contract_id: contractIds.kucherov,
        season_id: seasonIds["2023-2024"],
        team_id: teamIds.TBL,
        cap_hit: money("9500000"),
        base_salary: money("7000000"),
        signing_bonus: money("2000000"),
        performance_bonus: money("500000"),
        total_salary: money("9500000")
      },
      {
        id: "contract-year-kucherov-2024-2025",
        contract_id: contractIds.kucherov,
        season_id: seasonIds["2024-2025"],
        team_id: teamIds.TBL,
        cap_hit: money("9500000"),
        base_salary: money("7000000"),
        signing_bonus: money("2000000"),
        performance_bonus: money("500000"),
        total_salary: money("9500000")
      }
    ]
  });
}

async function seedTransactions() {
  await prisma.transaction.createMany({
    data: [
      {
        id: "transaction-matthews-signing",
        transaction_date: new Date("2022-07-13T00:00:00.000Z"),
        transaction_type: "Signing",
        player_id: playerIds.matthews,
        from_team_id: null,
        to_team_id: teamIds.TOR,
        contract_id: contractIds.matthews,
        description: "Sample signing transaction for phase 1 warehouse validation."
      },
      {
        id: "transaction-mackinnon-extension",
        transaction_date: new Date("2022-09-20T00:00:00.000Z"),
        transaction_type: "Extension",
        player_id: playerIds.mackinnon,
        from_team_id: teamIds.COL,
        to_team_id: teamIds.COL,
        contract_id: contractIds.mackinnon,
        description: "Sample extension transaction tied to a full contract record."
      },
      {
        id: "transaction-kucherov-roster-lock",
        transaction_date: new Date("2022-10-10T00:00:00.000Z"),
        transaction_type: "Roster",
        player_id: playerIds.kucherov,
        from_team_id: teamIds.TBL,
        to_team_id: teamIds.TBL,
        contract_id: contractIds.kucherov,
        description: "Sample roster carry-forward transaction for local history wiring."
      }
    ]
  });
}

async function seedRosterSnapshots() {
  await prisma.rosterSnapshot.createMany({
    data: [
      {
        id: "roster-snapshot-tor-matthews-2024-10-01",
        snapshot_date: new Date("2024-10-01T00:00:00.000Z"),
        team_id: teamIds.TOR,
        player_id: playerIds.matthews,
        season_id: seasonIds["2024-2025"],
        roster_status: "Active"
      },
      {
        id: "roster-snapshot-col-mackinnon-2024-10-01",
        snapshot_date: new Date("2024-10-01T00:00:00.000Z"),
        team_id: teamIds.COL,
        player_id: playerIds.mackinnon,
        season_id: seasonIds["2024-2025"],
        roster_status: "Active"
      },
      {
        id: "roster-snapshot-tbl-kucherov-2024-10-01",
        snapshot_date: new Date("2024-10-01T00:00:00.000Z"),
        team_id: teamIds.TBL,
        player_id: playerIds.kucherov,
        season_id: seasonIds["2024-2025"],
        roster_status: "Active"
      }
    ]
  });
}

async function seedAdvancedMetrics() {
  await prisma.playerAdvancedSeason.createMany({
    data: [
      {
        id: "advanced-matthews-2023-2024",
        player_id: playerIds.matthews,
        season_id: seasonIds["2023-2024"],
        team_id: teamIds.TOR,
        source: "sample-public-model",
        corsi_for_pct: 56.2,
        fenwick_for_pct: 55.4,
        expected_goals_for_pct: 57.1,
        individual_expected_goals: 32.4,
        goals_above_replacement: 21.8,
        wins_above_replacement: 4.3,
        offensive_rapm: 1.75,
        defensive_rapm: 0.48
      },
      {
        id: "advanced-mackinnon-2023-2024",
        player_id: playerIds.mackinnon,
        season_id: seasonIds["2023-2024"],
        team_id: teamIds.COL,
        source: "sample-public-model",
        corsi_for_pct: 58.9,
        fenwick_for_pct: 58.1,
        expected_goals_for_pct: 59.2,
        individual_expected_goals: 34.1,
        goals_above_replacement: 24.7,
        wins_above_replacement: 4.9,
        offensive_rapm: 2.11,
        defensive_rapm: 0.36
      },
      {
        id: "advanced-kucherov-2023-2024",
        player_id: playerIds.kucherov,
        season_id: seasonIds["2023-2024"],
        team_id: teamIds.TBL,
        source: "sample-public-model",
        corsi_for_pct: 54.7,
        fenwick_for_pct: 54.1,
        expected_goals_for_pct: 55.6,
        individual_expected_goals: 27.8,
        goals_above_replacement: 19.4,
        wins_above_replacement: 4.0,
        offensive_rapm: 1.98,
        defensive_rapm: -0.12
      }
    ]
  });
}

async function seedTrackingMetrics() {
  await prisma.playerTrackingSeason.createMany({
    data: [
      {
        id: "tracking-matthews-2023-2024",
        player_id: playerIds.matthews,
        season_id: seasonIds["2023-2024"],
        team_id: teamIds.TOR,
        source: "sample-tracking-feed",
        top_speed_mph: 22.4,
        avg_speed_mph: 14.8,
        speed_bursts_20_plus: 96,
        zone_entries: 274,
        zone_exits: 181,
        puck_possession_seconds: 3680
      },
      {
        id: "tracking-mackinnon-2023-2024",
        player_id: playerIds.mackinnon,
        season_id: seasonIds["2023-2024"],
        team_id: teamIds.COL,
        source: "sample-tracking-feed",
        top_speed_mph: 23.1,
        avg_speed_mph: 15.3,
        speed_bursts_20_plus: 128,
        zone_entries: 341,
        zone_exits: 205,
        puck_possession_seconds: 4015
      },
      {
        id: "tracking-kucherov-2023-2024",
        player_id: playerIds.kucherov,
        season_id: seasonIds["2023-2024"],
        team_id: teamIds.TBL,
        source: "sample-tracking-feed",
        top_speed_mph: 21.7,
        avg_speed_mph: 14.4,
        speed_bursts_20_plus: 82,
        zone_entries: 299,
        zone_exits: 169,
        puck_possession_seconds: 3894
      }
    ]
  });
}

async function seedFeatures() {
  await prisma.playerFeature.createMany({
    data: [
      {
        id: "feature-matthews-2023-2024",
        player_id: playerIds.matthews,
        season_id: seasonIds["2023-2024"],
        team_id: teamIds.TOR,
        offensive_creation: 92.4,
        finishing: 97.1,
        playmaking: 84.3,
        transition_value: 81.5,
        defensive_value: 76.9,
        power_play_value: 95.2,
        penalty_kill_value: 38.4,
        durability: 88.0,
        usage_difficulty: 84.8
      },
      {
        id: "feature-mackinnon-2023-2024",
        player_id: playerIds.mackinnon,
        season_id: seasonIds["2023-2024"],
        team_id: teamIds.COL,
        offensive_creation: 96.0,
        finishing: 90.8,
        playmaking: 95.7,
        transition_value: 97.5,
        defensive_value: 73.2,
        power_play_value: 94.1,
        penalty_kill_value: 29.4,
        durability: 89.7,
        usage_difficulty: 91.0
      },
      {
        id: "feature-kucherov-2023-2024",
        player_id: playerIds.kucherov,
        season_id: seasonIds["2023-2024"],
        team_id: teamIds.TBL,
        offensive_creation: 95.5,
        finishing: 87.6,
        playmaking: 98.2,
        transition_value: 79.1,
        defensive_value: 61.0,
        power_play_value: 98.6,
        penalty_kill_value: 14.5,
        durability: 86.1,
        usage_difficulty: 83.4
      }
    ]
  });
}

async function seedRawImportBatches() {
  await prisma.rawImportBatch.createMany({
    data: [
      {
        id: rawImportBatchIds.identities,
        source_system: "sample_seed",
        source_entity: "identities",
        source_label: "Sample raw identity import",
        import_status: "loaded",
        row_count: 9,
        started_at: new Date("2026-06-14T00:00:00.000Z"),
        completed_at: new Date("2026-06-14T00:01:00.000Z"),
        notes: "Local sample raw identity rows for phase 1 ingestion scaffolding."
      },
      {
        id: rawImportBatchIds.performance,
        source_system: "sample_seed",
        source_entity: "player_seasons",
        source_label: "Sample raw season import",
        import_status: "loaded",
        row_count: 3,
        started_at: new Date("2026-06-14T00:02:00.000Z"),
        completed_at: new Date("2026-06-14T00:03:00.000Z")
      },
      {
        id: rawImportBatchIds.contracts,
        source_system: "sample_seed",
        source_entity: "contracts",
        source_label: "Sample raw contract import",
        import_status: "loaded",
        row_count: 12,
        started_at: new Date("2026-06-14T00:04:00.000Z"),
        completed_at: new Date("2026-06-14T00:05:00.000Z")
      },
      {
        id: rawImportBatchIds.roster,
        source_system: "sample_seed",
        source_entity: "roster_snapshots",
        source_label: "Sample raw roster import",
        import_status: "loaded",
        row_count: 3,
        started_at: new Date("2026-06-14T00:06:00.000Z"),
        completed_at: new Date("2026-06-14T00:07:00.000Z")
      },
      {
        id: rawImportBatchIds.transactions,
        source_system: "sample_seed",
        source_entity: "transactions",
        source_label: "Sample raw transaction import",
        import_status: "loaded",
        row_count: 3,
        started_at: new Date("2026-06-14T00:08:00.000Z"),
        completed_at: new Date("2026-06-14T00:09:00.000Z")
      }
    ]
  });
}

async function seedRawIdentityRows() {
  await prisma.rawPlayer.createMany({
    data: [
      {
        import_batch_id: rawImportBatchIds.identities,
        source_system: "sample_seed",
        source_record_id: "raw-player-matthews",
        external_nhl_id: 8479318,
        full_name: "Auston Matthews",
        birth_date: new Date("1997-09-17T00:00:00.000Z"),
        position_raw: "C",
        shoots_catches_raw: "R",
        payload: {
          sample: true,
          player: "Auston Matthews"
        }
      },
      {
        import_batch_id: rawImportBatchIds.identities,
        source_system: "sample_seed",
        source_record_id: "raw-player-mackinnon",
        external_nhl_id: 8477492,
        full_name: "Nathan MacKinnon",
        birth_date: new Date("1995-09-01T00:00:00.000Z"),
        position_raw: "C",
        shoots_catches_raw: "R",
        payload: {
          sample: true,
          player: "Nathan MacKinnon"
        }
      },
      {
        import_batch_id: rawImportBatchIds.identities,
        source_system: "sample_seed",
        source_record_id: "raw-player-kucherov",
        external_nhl_id: 8476453,
        full_name: "Nikita Kucherov",
        birth_date: new Date("1993-06-17T00:00:00.000Z"),
        position_raw: "RW",
        shoots_catches_raw: "L",
        payload: {
          sample: true,
          player: "Nikita Kucherov"
        }
      }
    ]
  });

  await prisma.rawTeam.createMany({
    data: [
      {
        import_batch_id: rawImportBatchIds.identities,
        source_system: "sample_seed",
        source_record_id: "raw-team-tor",
        external_nhl_id: 10,
        name: "Maple Leafs",
        abbreviation: "TOR",
        city: "Toronto",
        conference: "Eastern",
        division: "Atlantic",
        payload: {
          sample: true,
          team: "Toronto Maple Leafs"
        }
      },
      {
        import_batch_id: rawImportBatchIds.identities,
        source_system: "sample_seed",
        source_record_id: "raw-team-col",
        external_nhl_id: 21,
        name: "Avalanche",
        abbreviation: "COL",
        city: "Colorado",
        conference: "Western",
        division: "Central",
        payload: {
          sample: true,
          team: "Colorado Avalanche"
        }
      },
      {
        import_batch_id: rawImportBatchIds.identities,
        source_system: "sample_seed",
        source_record_id: "raw-team-tbl",
        external_nhl_id: 14,
        name: "Lightning",
        abbreviation: "TBL",
        city: "Tampa Bay",
        conference: "Eastern",
        division: "Atlantic",
        payload: {
          sample: true,
          team: "Tampa Bay Lightning"
        }
      }
    ]
  });

  await prisma.rawSeason.createMany({
    data: [
      {
        import_batch_id: rawImportBatchIds.identities,
        source_system: "sample_seed",
        source_record_id: "raw-season-2022-23",
        season_code: "2022-23",
        start_year: 2022,
        end_year: 2023,
        salary_cap: money("82500000"),
        payload: {
          sample: true,
          season: "2022-23"
        }
      },
      {
        import_batch_id: rawImportBatchIds.identities,
        source_system: "sample_seed",
        source_record_id: "raw-season-2023-24",
        season_code: "2023-24",
        start_year: 2023,
        end_year: 2024,
        salary_cap: money("83500000"),
        payload: {
          sample: true,
          season: "2023-24"
        }
      },
      {
        import_batch_id: rawImportBatchIds.identities,
        source_system: "sample_seed",
        source_record_id: "raw-season-2024-25",
        season_code: "2024-25",
        start_year: 2024,
        end_year: 2025,
        salary_cap: money("88000000"),
        payload: {
          sample: true,
          season: "2024-25"
        }
      }
    ]
  });
}

async function seedRawPerformanceRows() {
  await prisma.rawPlayerSeason.createMany({
    data: [
      {
        import_batch_id: rawImportBatchIds.performance,
        source_system: "sample_seed",
        source_record_id: "raw-player-season-matthews-2023-24",
        source_player_id: "raw-player-matthews",
        source_team_id: "raw-team-tor",
        external_nhl_player_id: 8479318,
        external_nhl_team_id: 10,
        season_code: "2023-24",
        games_played: 81,
        goals: 69,
        assists: 38,
        points: 107,
        time_on_ice_seconds: 157080,
        payload: {
          sample: true
        }
      },
      {
        import_batch_id: rawImportBatchIds.performance,
        source_system: "sample_seed",
        source_record_id: "raw-player-season-mackinnon-2023-24",
        source_player_id: "raw-player-mackinnon",
        source_team_id: "raw-team-col",
        external_nhl_player_id: 8477492,
        external_nhl_team_id: 21,
        season_code: "2023-24",
        games_played: 82,
        goals: 51,
        assists: 89,
        points: 140,
        time_on_ice_seconds: 184500,
        payload: {
          sample: true
        }
      },
      {
        import_batch_id: rawImportBatchIds.performance,
        source_system: "sample_seed",
        source_record_id: "raw-player-season-kucherov-2023-24",
        source_player_id: "raw-player-kucherov",
        source_team_id: "raw-team-tbl",
        external_nhl_player_id: 8476453,
        external_nhl_team_id: 14,
        season_code: "2023-24",
        games_played: 81,
        goals: 44,
        assists: 100,
        points: 144,
        time_on_ice_seconds: 166320,
        payload: {
          sample: true
        }
      }
    ]
  });
}

async function seedRawContractRows() {
  await prisma.rawContract.createMany({
    data: [
      {
        import_batch_id: rawImportBatchIds.contracts,
        source_system: "sample_seed",
        source_record_id: "raw-contract-matthews",
        source_player_id: "raw-player-matthews",
        source_team_id: "raw-team-tor",
        external_nhl_player_id: 8479318,
        external_nhl_team_id: 10,
        sign_date: new Date("2022-07-13T00:00:00.000Z"),
        start_season_code: "2022-23",
        end_season_code: "2024-25",
        term_years: 3,
        total_value: money("34500000"),
        average_annual_value: money("11500000"),
        contract_type: "Standard Player Contract",
        signing_status: "Active",
        payload: {
          sample: true
        }
      },
      {
        import_batch_id: rawImportBatchIds.contracts,
        source_system: "sample_seed",
        source_record_id: "raw-contract-mackinnon",
        source_player_id: "raw-player-mackinnon",
        source_team_id: "raw-team-col",
        external_nhl_player_id: 8477492,
        external_nhl_team_id: 21,
        sign_date: new Date("2022-09-20T00:00:00.000Z"),
        start_season_code: "2022-23",
        end_season_code: "2024-25",
        term_years: 3,
        total_value: money("37800000"),
        average_annual_value: money("12600000"),
        contract_type: "Standard Player Contract",
        signing_status: "Active",
        payload: {
          sample: true
        }
      },
      {
        import_batch_id: rawImportBatchIds.contracts,
        source_system: "sample_seed",
        source_record_id: "raw-contract-kucherov",
        source_player_id: "raw-player-kucherov",
        source_team_id: "raw-team-tbl",
        external_nhl_player_id: 8476453,
        external_nhl_team_id: 14,
        sign_date: new Date("2022-07-01T00:00:00.000Z"),
        start_season_code: "2022-23",
        end_season_code: "2024-25",
        term_years: 3,
        total_value: money("28500000"),
        average_annual_value: money("9500000"),
        contract_type: "Standard Player Contract",
        signing_status: "Active",
        payload: {
          sample: true
        }
      }
    ]
  });

  await prisma.rawContractYear.createMany({
    data: [
      {
        import_batch_id: rawImportBatchIds.contracts,
        source_system: "sample_seed",
        source_record_id: "raw-contract-year-matthews-2022-23",
        source_contract_id: "raw-contract-matthews",
        source_team_id: "raw-team-tor",
        season_code: "2022-23",
        external_nhl_team_id: 10,
        cap_hit: money("11500000"),
        base_salary: money("9000000"),
        signing_bonus: money("2000000"),
        performance_bonus: money("500000"),
        total_salary: money("11500000"),
        payload: { sample: true }
      },
      {
        import_batch_id: rawImportBatchIds.contracts,
        source_system: "sample_seed",
        source_record_id: "raw-contract-year-matthews-2023-24",
        source_contract_id: "raw-contract-matthews",
        source_team_id: "raw-team-tor",
        season_code: "2023-24",
        external_nhl_team_id: 10,
        cap_hit: money("11500000"),
        base_salary: money("9000000"),
        signing_bonus: money("2000000"),
        performance_bonus: money("500000"),
        total_salary: money("11500000"),
        payload: { sample: true }
      },
      {
        import_batch_id: rawImportBatchIds.contracts,
        source_system: "sample_seed",
        source_record_id: "raw-contract-year-matthews-2024-25",
        source_contract_id: "raw-contract-matthews",
        source_team_id: "raw-team-tor",
        season_code: "2024-25",
        external_nhl_team_id: 10,
        cap_hit: money("11500000"),
        base_salary: money("9000000"),
        signing_bonus: money("2000000"),
        performance_bonus: money("500000"),
        total_salary: money("11500000"),
        payload: { sample: true }
      },
      {
        import_batch_id: rawImportBatchIds.contracts,
        source_system: "sample_seed",
        source_record_id: "raw-contract-year-mackinnon-2022-23",
        source_contract_id: "raw-contract-mackinnon",
        source_team_id: "raw-team-col",
        season_code: "2022-23",
        external_nhl_team_id: 21,
        cap_hit: money("12600000"),
        base_salary: money("10000000"),
        signing_bonus: money("2500000"),
        performance_bonus: money("100000"),
        total_salary: money("12600000"),
        payload: { sample: true }
      },
      {
        import_batch_id: rawImportBatchIds.contracts,
        source_system: "sample_seed",
        source_record_id: "raw-contract-year-mackinnon-2023-24",
        source_contract_id: "raw-contract-mackinnon",
        source_team_id: "raw-team-col",
        season_code: "2023-24",
        external_nhl_team_id: 21,
        cap_hit: money("12600000"),
        base_salary: money("10000000"),
        signing_bonus: money("2500000"),
        performance_bonus: money("100000"),
        total_salary: money("12600000"),
        payload: { sample: true }
      },
      {
        import_batch_id: rawImportBatchIds.contracts,
        source_system: "sample_seed",
        source_record_id: "raw-contract-year-mackinnon-2024-25",
        source_contract_id: "raw-contract-mackinnon",
        source_team_id: "raw-team-col",
        season_code: "2024-25",
        external_nhl_team_id: 21,
        cap_hit: money("12600000"),
        base_salary: money("10000000"),
        signing_bonus: money("2500000"),
        performance_bonus: money("100000"),
        total_salary: money("12600000"),
        payload: { sample: true }
      },
      {
        import_batch_id: rawImportBatchIds.contracts,
        source_system: "sample_seed",
        source_record_id: "raw-contract-year-kucherov-2022-23",
        source_contract_id: "raw-contract-kucherov",
        source_team_id: "raw-team-tbl",
        season_code: "2022-23",
        external_nhl_team_id: 14,
        cap_hit: money("9500000"),
        base_salary: money("7000000"),
        signing_bonus: money("2000000"),
        performance_bonus: money("500000"),
        total_salary: money("9500000"),
        payload: { sample: true }
      },
      {
        import_batch_id: rawImportBatchIds.contracts,
        source_system: "sample_seed",
        source_record_id: "raw-contract-year-kucherov-2023-24",
        source_contract_id: "raw-contract-kucherov",
        source_team_id: "raw-team-tbl",
        season_code: "2023-24",
        external_nhl_team_id: 14,
        cap_hit: money("9500000"),
        base_salary: money("7000000"),
        signing_bonus: money("2000000"),
        performance_bonus: money("500000"),
        total_salary: money("9500000"),
        payload: { sample: true }
      },
      {
        import_batch_id: rawImportBatchIds.contracts,
        source_system: "sample_seed",
        source_record_id: "raw-contract-year-kucherov-2024-25",
        source_contract_id: "raw-contract-kucherov",
        source_team_id: "raw-team-tbl",
        season_code: "2024-25",
        external_nhl_team_id: 14,
        cap_hit: money("9500000"),
        base_salary: money("7000000"),
        signing_bonus: money("2000000"),
        performance_bonus: money("500000"),
        total_salary: money("9500000"),
        payload: { sample: true }
      }
    ]
  });
}

async function seedRawRosterAndTransactions() {
  await prisma.rawRosterSnapshot.createMany({
    data: [
      {
        import_batch_id: rawImportBatchIds.roster,
        source_system: "sample_seed",
        source_record_id: "raw-roster-matthews-2024-10-01",
        source_player_id: "raw-player-matthews",
        source_team_id: "raw-team-tor",
        season_code: "2024-25",
        snapshot_date: new Date("2024-10-01T00:00:00.000Z"),
        roster_status: "Active",
        payload: { sample: true }
      },
      {
        import_batch_id: rawImportBatchIds.roster,
        source_system: "sample_seed",
        source_record_id: "raw-roster-mackinnon-2024-10-01",
        source_player_id: "raw-player-mackinnon",
        source_team_id: "raw-team-col",
        season_code: "2024-25",
        snapshot_date: new Date("2024-10-01T00:00:00.000Z"),
        roster_status: "Active",
        payload: { sample: true }
      },
      {
        import_batch_id: rawImportBatchIds.roster,
        source_system: "sample_seed",
        source_record_id: "raw-roster-kucherov-2024-10-01",
        source_player_id: "raw-player-kucherov",
        source_team_id: "raw-team-tbl",
        season_code: "2024-25",
        snapshot_date: new Date("2024-10-01T00:00:00.000Z"),
        roster_status: "Active",
        payload: { sample: true }
      }
    ]
  });

  await prisma.rawTransaction.createMany({
    data: [
      {
        import_batch_id: rawImportBatchIds.transactions,
        source_system: "sample_seed",
        source_record_id: "raw-transaction-matthews-signing",
        source_player_id: "raw-player-matthews",
        source_to_team_id: "raw-team-tor",
        transaction_date: new Date("2022-07-13T00:00:00.000Z"),
        transaction_type: "Signing",
        description: "Sample raw signing transaction.",
        payload: { sample: true }
      },
      {
        import_batch_id: rawImportBatchIds.transactions,
        source_system: "sample_seed",
        source_record_id: "raw-transaction-mackinnon-extension",
        source_player_id: "raw-player-mackinnon",
        source_from_team_id: "raw-team-col",
        source_to_team_id: "raw-team-col",
        transaction_date: new Date("2022-09-20T00:00:00.000Z"),
        transaction_type: "Extension",
        description: "Sample raw extension transaction.",
        payload: { sample: true }
      },
      {
        import_batch_id: rawImportBatchIds.transactions,
        source_system: "sample_seed",
        source_record_id: "raw-transaction-kucherov-roster-lock",
        source_player_id: "raw-player-kucherov",
        source_from_team_id: "raw-team-tbl",
        source_to_team_id: "raw-team-tbl",
        transaction_date: new Date("2022-10-10T00:00:00.000Z"),
        transaction_type: "Roster",
        description: "Sample raw roster transaction.",
        payload: { sample: true }
      }
    ]
  });
}

async function main() {
  await resetDatabase();
  await seedRawImportBatches();
  await seedRawIdentityRows();
  await seedSeasons();
  await seedTeams();
  await seedPlayers();
  await seedRawPerformanceRows();
  await seedPlayerSeasons();
  await seedTeamSeasons();
  await seedRawContractRows();
  await seedContracts();
  await seedContractYears();
  await seedRawRosterAndTransactions();
  await seedTransactions();
  await seedRosterSnapshots();
  await seedAdvancedMetrics();
  await seedTrackingMetrics();
  await seedFeatures();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
