const {
  PrismaClient,
  Position,
  ContractStatus,
  TransactionType
} = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.anchorScenario.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();

  const teams = await Promise.all([
    prisma.team.create({
      data: {
        name: "Toronto Maple Leafs",
        slug: "toronto-maple-leafs",
        abbreviation: "TOR",
        league: "NHL"
      }
    }),
    prisma.team.create({
      data: {
        name: "Colorado Avalanche",
        slug: "colorado-avalanche",
        abbreviation: "COL",
        league: "NHL"
      }
    }),
    prisma.team.create({
      data: {
        name: "Tampa Bay Lightning",
        slug: "tampa-bay-lightning",
        abbreviation: "TBL",
        league: "NHL"
      }
    })
  ]);

  const teamByAbbreviation = Object.fromEntries(
    teams.map((team) => [team.abbreviation, team])
  );

  const players = await Promise.all([
    prisma.player.create({
      data: {
        fullName: "Auston Matthews",
        slug: "auston-matthews",
        position: Position.C,
        shoots: "R",
        currentTeamId: teamByAbbreviation.TOR.id
      }
    }),
    prisma.player.create({
      data: {
        fullName: "Nathan MacKinnon",
        slug: "nathan-mackinnon",
        position: Position.C,
        shoots: "R",
        currentTeamId: teamByAbbreviation.COL.id
      }
    }),
    prisma.player.create({
      data: {
        fullName: "Nikita Kucherov",
        slug: "nikita-kucherov",
        position: Position.RW,
        shoots: "L",
        currentTeamId: teamByAbbreviation.TBL.id
      }
    })
  ]);

  const playerBySlug = Object.fromEntries(players.map((player) => [player.slug, player]));

  await prisma.contract.createMany({
    data: [
      {
        playerId: playerBySlug["auston-matthews"].id,
        teamId: teamByAbbreviation.TOR.id,
        status: ContractStatus.ACTIVE,
        startSeason: 2024,
        endSeason: 2027,
        totalValueUsd: 53000000,
        capHitUsd: 13250000,
        capPercentage: 15.03,
        normalizedSeason: "2024-25",
        isHistorical: false,
        sourceLabel: "Local sample contract"
      },
      {
        playerId: playerBySlug["nathan-mackinnon"].id,
        teamId: teamByAbbreviation.COL.id,
        status: ContractStatus.ACTIVE,
        startSeason: 2023,
        endSeason: 2030,
        totalValueUsd: 100800000,
        capHitUsd: 12600000,
        capPercentage: 14.29,
        normalizedSeason: "2024-25",
        isHistorical: false,
        sourceLabel: "Local sample contract"
      },
      {
        playerId: playerBySlug["nikita-kucherov"].id,
        teamId: teamByAbbreviation.TBL.id,
        status: ContractStatus.ACTIVE,
        startSeason: 2019,
        endSeason: 2026,
        totalValueUsd: 76000000,
        capHitUsd: 9500000,
        capPercentage: 11.20,
        normalizedSeason: "2024-25",
        isHistorical: true,
        sourceLabel: "Local sample contract"
      }
    ]
  });

  await prisma.transaction.create({
    data: {
      type: TransactionType.EXTENSION,
      title: "Sample extension marker",
      description: "Local seeded transaction for early product wiring.",
      playerId: playerBySlug["auston-matthews"].id,
      fromTeamId: teamByAbbreviation.TOR.id,
      toTeamId: teamByAbbreviation.TOR.id,
      effectiveDate: new Date("2023-08-23T00:00:00.000Z")
    }
  });

  await prisma.anchorScenario.create({
    data: {
      name: "Matthews market anchor",
      slug: "matthews-market-anchor",
      description:
        "Sample scenario exploring how a top-end center contract can anchor market comparisons.",
      anchorPlayerId: playerBySlug["auston-matthews"].id,
      anchorTeamId: teamByAbbreviation.TOR.id,
      baselineSeason: 2024,
      assumptionsJson: {
        targetMetric: "cap_percentage",
        mode: "single-anchor"
      }
    }
  });
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
