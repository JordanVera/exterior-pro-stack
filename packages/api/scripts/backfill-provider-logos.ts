/**
 * Uploads seed example logos to Vercel Blob and points each provider at them.
 *
 *   npm run backfill:provider-logos --workspace @repo/api
 *
 * Requires BLOB_READ_WRITE_TOKEN. Safe to re-run; existing logos for a
 * provider are replaced.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { db } from "@repo/db";
import { uploadProviderLogo } from "../src/lib/provider-logo";
import { PROVIDER_LOGO_FILES } from "../../db/prisma/seed-assets/logos";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const LOGO_DIR = resolve(ROOT, "packages/db/prisma/seed-assets/logos");

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    if (process.env[key]) continue;
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

async function main() {
  loadEnvFile(resolve(ROOT, "packages/db/.env"));
  loadEnvFile(resolve(ROOT, "apps/web/.env"));
  loadEnvFile(resolve(ROOT, ".env"));

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error(chalk.red("BLOB_READ_WRITE_TOKEN is not set."));
    process.exitCode = 1;
    return;
  }

  const providers = await db.providerProfile.findMany({
    select: { businessName: true, userId: true, logoUrl: true },
    orderBy: { businessName: "asc" },
  });

  if (providers.length === 0) {
    console.log(chalk.yellow("No provider profiles found."));
    return;
  }

  console.log(chalk.cyan(`Uploading logos for ${providers.length} providers…`));

  let uploaded = 0;
  for (const provider of providers) {
    const filename = PROVIDER_LOGO_FILES[provider.businessName];
    if (!filename) {
      console.log(chalk.yellow(`  – ${provider.businessName} (no seed logo)`));
      continue;
    }
    const filePath = resolve(LOGO_DIR, filename);
    if (!existsSync(filePath)) {
      console.log(chalk.yellow(`  – ${provider.businessName} (missing ${filename})`));
      continue;
    }

    const file = readFileSync(filePath);
    const logo = await uploadProviderLogo({
      db,
      userId: provider.userId,
      file,
      contentType: "image/png",
    });
    uploaded += 1;
    console.log(chalk.green(`  ✓ ${provider.businessName}`));
    console.log(chalk.gray(`    ${logo.url}`));
  }

  console.log(chalk.cyan(`\nDone. ${uploaded}/${providers.length} logos uploaded.`));
}

main()
  .catch((error) => {
    console.error(chalk.red("Logo backfill failed:"), error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
