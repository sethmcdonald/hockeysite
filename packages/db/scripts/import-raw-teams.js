const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const packageRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(packageRoot, "..", "..");

function getArgValue(flag) {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function parseCsv(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error("CSV file must include a header row and at least one data row.");
  }

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });

  return rows;
}

function normalizeNullable(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeInteger(value) {
  const normalized = normalizeNullable(value);

  if (!normalized) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid integer value: ${normalized}`);
  }

  return parsed;
}

function normalizeDate(value) {
  const normalized = normalizeNullable(value);

  if (!normalized) {
    return null;
  }

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${normalized}`);
  }

  return date;
}

function validateRow(row, index) {
  if (!normalizeNullable(row.source_record_id)) {
    throw new Error(`Row ${index + 2} is missing source_record_id.`);
  }

  if (!normalizeNullable(row.name)) {
    throw new Error(`Row ${index + 2} is missing name.`);
  }

  if (!normalizeNullable(row.abbreviation)) {
    throw new Error(`Row ${index + 2} is missing abbreviation.`);
  }
}

async function main() {
  const fileArg = getArgValue("--file");

  if (!fileArg) {
    throw new Error("Missing required flag: --file <relative-or-absolute-path-to-csv>");
  }

  const sourceSystem = getArgValue("--source-system") ?? "local_csv";
  const sourceLabel = getArgValue("--source-label") ?? "Manual team CSV import";
  const notes =
    getArgValue("--notes") ??
    "Local team CSV import. No scraping or live website ingestion.";

  const resolvedFilePath = path.resolve(packageRoot, fileArg);

  if (!fs.existsSync(resolvedFilePath)) {
    throw new Error(`CSV file not found: ${resolvedFilePath}`);
  }

  const content = fs.readFileSync(resolvedFilePath, "utf8");
  const rows = parseCsv(content);

  rows.forEach(validateRow);

  const batch = await prisma.rawImportBatch.create({
    data: {
      source_system: sourceSystem,
      source_entity: "teams",
      source_label: sourceLabel,
      import_status: "loaded",
      row_count: rows.length,
      started_at: new Date(),
      notes
    }
  });

  const rawTeams = rows.map((row) => ({
    import_batch_id: batch.id,
    source_system: sourceSystem,
    source_record_id: normalizeNullable(row.source_record_id),
    external_nhl_id: normalizeInteger(row.external_nhl_id),
    name: normalizeNullable(row.name),
    abbreviation: normalizeNullable(row.abbreviation),
    city: normalizeNullable(row.city),
    conference: normalizeNullable(row.conference),
    division: normalizeNullable(row.division),
    source_updated_at: normalizeDate(row.source_updated_at),
    payload: {
      import_type: "local_team_csv",
      imported_from: path.relative(workspaceRoot, resolvedFilePath),
      raw_row: row
    }
  }));

  const result = await prisma.rawTeam.createMany({
    data: rawTeams,
    skipDuplicates: true
  });

  await prisma.rawImportBatch.update({
    where: { id: batch.id },
    data: {
      completed_at: new Date(),
      notes: `${notes} Inserted ${result.count} new raw team rows from ${path.basename(
        resolvedFilePath
      )}.`
    }
  });

  console.log(`Imported ${result.count} raw team rows into batch ${batch.id}.`);
  console.log(`Source file: ${resolvedFilePath}`);
  console.log(`Open http://localhost:3000/raw-imports/${batch.id} to inspect the batch.`);
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
