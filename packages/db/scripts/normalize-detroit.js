const { PrismaClient, Position, ShootsCatches, Prisma } = require("@prisma/client");

const prisma = new PrismaClient();

const DETROIT_TEAM_ID = "team-detroit-red-wings";
const DETROIT_SEASON_ID = "season-2026-2027";
const DETROIT_TEAM_SEASON_ID = "team-season-det-2026-2027";
const DETROIT_SNAPSHOT_DATE = new Date("2026-06-15T00:00:00.000Z");
const DETROIT_CONTRACT_SIGN_DATE = new Date("2026-06-15T00:00:00.000Z");

const DETROIT_CONTRACTS = {
  "Dylan Larkin": 8700000,
  "Lucas Raymond": 8075000,
  "Alex DeBrincat": 7875000,
  "Andrew Copp": 5625000,
  "J.T. Compher": 5100000,
  "Michael Rasmussen": 3200000,
  "Mason Appleton": 2900000,
  "Michael Brandsegg-Nygard": 953750,
  "Emmitt Finnie": 921667,
  "Marco Kasper": 886666,
  "Sheldon Dries": 875000,
  "Dominik Shine": 875000,
  "Moritz Seider": 8550000,
  "Justin Faulk": 6500000,
  "Ben Chiarot": 3850000,
  "Jacob Bernard-Docker": 1600000,
  "Albert Johansson": 1125000,
  "Axel Sandin Pellikka": 940833,
  "John Gibson": 6400000
};

function money(value) {
  return new Prisma.Decimal(value);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapPosition(positionRaw) {
  if (!positionRaw) {
    return null;
  }

  const tokens = positionRaw.split(",").map((token) => token.trim().toUpperCase());

  for (const token of tokens) {
    if (token === "C") return Position.C;
    if (token === "LW" || token === "W") return Position.LW;
    if (token === "RW") return Position.RW;
    if (token === "LD" || token === "RD" || token === "D") return Position.D;
    if (token === "G") return Position.G;
  }

  return null;
}

function mapShootsCatches(value) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toUpperCase();

  if (normalized === "L") {
    return ShootsCatches.L;
  }

  if (normalized === "R") {
    return ShootsCatches.R;
  }

  return null;
}

async function upsertDetroitSeason() {
  await prisma.season.upsert({
    where: { id: DETROIT_SEASON_ID },
    update: {
      season_code: "2026-27",
      start_year: 2026,
      end_year: 2027,
      salary_cap: money("104000000")
    },
    create: {
      id: DETROIT_SEASON_ID,
      season_code: "2026-27",
      start_year: 2026,
      end_year: 2027,
      salary_cap: money("104000000")
    }
  });
}

async function upsertDetroitTeam() {
  await prisma.team.upsert({
    where: { id: DETROIT_TEAM_ID },
    update: {
      name: "Red Wings",
      abbreviation: "DET",
      city: "Detroit",
      conference: "Eastern",
      division: "Atlantic"
    },
    create: {
      id: DETROIT_TEAM_ID,
      name: "Red Wings",
      abbreviation: "DET",
      city: "Detroit",
      conference: "Eastern",
      division: "Atlantic"
    }
  });

  await prisma.teamSeason.upsert({
    where: { id: DETROIT_TEAM_SEASON_ID },
    update: {
      team_id: DETROIT_TEAM_ID,
      season_id: DETROIT_SEASON_ID,
      playoff_result: "Projected roster snapshot"
    },
    create: {
      id: DETROIT_TEAM_SEASON_ID,
      team_id: DETROIT_TEAM_ID,
      season_id: DETROIT_SEASON_ID,
      playoff_result: "Projected roster snapshot"
    }
  });
}

async function loadRawDetroitPlayers() {
  return prisma.rawPlayer.findMany({
    where: {
      source_system: "detroit_manual"
    },
    orderBy: [{ full_name: "asc" }]
  });
}

async function upsertDetroitPlayers(rawPlayers) {
  const normalizedPlayers = [];

  for (const rawPlayer of rawPlayers) {
    const fullName = rawPlayer.full_name;

    if (!fullName) {
      continue;
    }

    const position = mapPosition(rawPlayer.position_raw);
    const shootsCatches = mapShootsCatches(rawPlayer.shoots_catches_raw);
    const playerId = `player-${slugify(fullName)}`;

    const player = await prisma.player.upsert({
      where: { id: playerId },
      update: {
        full_name: fullName,
        position,
        shoots_catches: shootsCatches,
        birth_date: rawPlayer.birth_date ?? undefined
      },
      create: {
        id: playerId,
        external_nhl_id: rawPlayer.external_nhl_id ?? undefined,
        full_name: fullName,
        birth_date: rawPlayer.birth_date ?? undefined,
        position,
        shoots_catches: shootsCatches
      }
    });

    await prisma.rosterSnapshot.upsert({
      where: {
        snapshot_date_team_id_player_id: {
          snapshot_date: DETROIT_SNAPSHOT_DATE,
          team_id: DETROIT_TEAM_ID,
          player_id: player.id
        }
      },
      update: {
        season_id: DETROIT_SEASON_ID,
        roster_status: DETROIT_CONTRACTS[fullName] ? "Projected active" : "Projected reserve"
      },
      create: {
        id: `roster-snapshot-det-${slugify(fullName)}-2026-06-15`,
        snapshot_date: DETROIT_SNAPSHOT_DATE,
        team_id: DETROIT_TEAM_ID,
        player_id: player.id,
        season_id: DETROIT_SEASON_ID,
        roster_status: DETROIT_CONTRACTS[fullName] ? "Projected active" : "Projected reserve"
      }
    });

    normalizedPlayers.push(player);
  }

  return normalizedPlayers;
}

async function upsertDetroitContracts(players) {
  let contractCount = 0;

  for (const player of players) {
    const capHit = DETROIT_CONTRACTS[player.full_name];

    if (!capHit) {
      continue;
    }

    const contractId = `contract-det-${slugify(player.full_name)}-2026-projection`;
    const contractYearId = `contract-year-det-${slugify(player.full_name)}-2026-2027-projection`;

    await prisma.contract.upsert({
      where: { id: contractId },
      update: {
        player_id: player.id,
        signing_team_id: DETROIT_TEAM_ID,
        sign_date: DETROIT_CONTRACT_SIGN_DATE,
        start_season_id: DETROIT_SEASON_ID,
        end_season_id: DETROIT_SEASON_ID,
        term_years: 1,
        total_value: money(capHit),
        average_annual_value: money(capHit),
        contract_type: "Projected cap snapshot",
        signing_status: "Projected"
      },
      create: {
        id: contractId,
        player_id: player.id,
        signing_team_id: DETROIT_TEAM_ID,
        sign_date: DETROIT_CONTRACT_SIGN_DATE,
        start_season_id: DETROIT_SEASON_ID,
        end_season_id: DETROIT_SEASON_ID,
        term_years: 1,
        total_value: money(capHit),
        average_annual_value: money(capHit),
        contract_type: "Projected cap snapshot",
        signing_status: "Projected"
      }
    });

    await prisma.contractYear.upsert({
      where: {
        contract_id_season_id: {
          contract_id: contractId,
          season_id: DETROIT_SEASON_ID
        }
      },
      update: {
        team_id: DETROIT_TEAM_ID,
        cap_hit: money(capHit),
        base_salary: money(capHit),
        signing_bonus: money("0"),
        performance_bonus: money("0"),
        total_salary: money(capHit)
      },
      create: {
        id: contractYearId,
        contract_id: contractId,
        season_id: DETROIT_SEASON_ID,
        team_id: DETROIT_TEAM_ID,
        cap_hit: money(capHit),
        base_salary: money(capHit),
        signing_bonus: money("0"),
        performance_bonus: money("0"),
        total_salary: money(capHit)
      }
    });

    contractCount += 1;
  }

  return contractCount;
}

async function main() {
  await upsertDetroitSeason();
  await upsertDetroitTeam();

  const rawPlayers = await loadRawDetroitPlayers();

  if (rawPlayers.length === 0) {
    throw new Error(
      "No Detroit raw players found. Import the Detroit player CSV before normalizing."
    );
  }

  const players = await upsertDetroitPlayers(rawPlayers);
  const contractCount = await upsertDetroitContracts(players);

  console.log(`Normalized ${players.length} Detroit players into canonical tables.`);
  console.log(`Normalized ${contractCount} Detroit projected contracts into canonical tables.`);
  console.log("Detroit should now appear in /players, /teams, and /contracts.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error.message ?? error);
    await prisma.$disconnect();
    process.exit(1);
  });
