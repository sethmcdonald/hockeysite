const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function decimalToNumber(value) {
  return value === null || value === undefined ? null : Number(value);
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

async function validatePlayerSeasons() {
  const totalRows = await prisma.playerSeason.count();
  const result = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count
    FROM player_seasons ps
    INNER JOIN players p ON p.id = ps.player_id
    INNER JOIN teams t ON t.id = ps.team_id
    INNER JOIN seasons s ON s.id = ps.season_id
  `;
  const validRelationCount = result[0]?.count ?? 0;

  if (totalRows !== validRelationCount) {
    throw new Error(
      `Found player_seasons with missing player/team/season references. Total rows: ${totalRows}, valid rows: ${validRelationCount}.`
    );
  }
}

async function validateContractYears() {
  const totalRows = await prisma.contractYear.count();
  const result = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count
    FROM contract_years cy
    INNER JOIN contracts c ON c.id = cy.contract_id
  `;
  const validRows = result[0]?.count ?? 0;

  if (totalRows !== validRows) {
    throw new Error(
      `Found contract_years without a parent contract. Total rows: ${totalRows}, valid rows: ${validRows}.`
    );
  }
}

async function validateContractsHaveYears() {
  const contracts = await prisma.contract.findMany({
    select: {
      id: true,
      contract_years: {
        select: { id: true }
      }
    }
  });

  const missingYears = contracts.filter(
    (contract) => contract.contract_years.length === 0
  );

  if (missingYears.length > 0) {
    throw new Error(
      `Found contracts without contract_years: ${missingYears
        .map((contract) => contract.id)
        .join(", ")}`
    );
  }
}

async function validateContractTotals() {
  const contracts = await prisma.contract.findMany({
    select: {
      id: true,
      total_value: true,
      contract_years: {
        select: {
          total_salary: true
        }
      }
    }
  });

  const mismatches = contracts
    .map((contract) => {
      const totalValue = decimalToNumber(contract.total_value);
      const summedYears = contract.contract_years.reduce((sum, year) => {
        return sum + (decimalToNumber(year.total_salary) ?? 0);
      }, 0);

      if (totalValue === null) {
        return null;
      }

      const delta = Math.abs(totalValue - summedYears);

      if (delta > 1) {
        return {
          id: contract.id,
          totalValue,
          summedYears,
          delta
        };
      }

      return null;
    })
    .filter(Boolean);

  if (mismatches.length > 0) {
    const details = mismatches
      .map(
        (entry) =>
          `${entry.id}: contract=${formatMoney(entry.totalValue)}, years=${formatMoney(entry.summedYears)}, delta=${formatMoney(entry.delta)}`
      )
      .join("; ");

    throw new Error(`Contract year reconciliation failed: ${details}`);
  }
}

async function main() {
  await validatePlayerSeasons();
  await validateContractYears();
  await validateContractsHaveYears();
  await validateContractTotals();

  const contractCount = await prisma.contract.count();
  const contractYearCount = await prisma.contractYear.count();
  const playerSeasonCount = await prisma.playerSeason.count();

  console.log(
    `Validation passed for ${playerSeasonCount} player_seasons, ${contractCount} contracts, and ${contractYearCount} contract_years.`
  );
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
