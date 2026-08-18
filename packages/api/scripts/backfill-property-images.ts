/**
 * Fetches cached exterior photos for properties created before the feature
 * existed, or for any whose earlier lookup failed.
 *
 *   npm run backfill:property-images --workspace @repo/api
 *
 * Safe to re-run: properties that already have a photo are skipped, and
 * addresses with no coverage are skipped once imageCheckedAt is stamped.
 * Requires GOOGLE_MAPS_API_KEY and BLOB_READ_WRITE_TOKEN.
 */
import { db } from "@repo/db";
import chalk from "chalk";
import {
  propertyImagesEnabled,
  refreshPropertyImage,
} from "../src/lib/property-image";

/** Google tolerates generous burst rates, but stay polite on large backfills. */
const DELAY_MS = 150;

async function main() {
  if (!propertyImagesEnabled()) {
    console.error(
      chalk.red("GOOGLE_MAPS_API_KEY is not set — nothing to backfill."),
    );
    process.exitCode = 1;
    return;
  }

  const properties = await db.property.findMany({
    where: { imageUrl: null, imageCheckedAt: null },
    orderBy: { createdAt: "asc" },
  });

  if (properties.length === 0) {
    console.log(chalk.green("Every property already has a cached photo."));
    return;
  }

  const label = properties.length === 1 ? "property" : "properties";
  console.log(chalk.cyan(`Fetching photos for ${properties.length} ${label}…`));

  let found = 0;
  for (const property of properties) {
    const updated = await refreshPropertyImage({ db, property });
    if (updated.imageUrl) {
      found += 1;
      console.log(chalk.green(`  ✓ ${property.address} (${updated.imageSource})`));
    } else {
      console.log(chalk.yellow(`  – ${property.address} (no coverage)`));
    }
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  }

  console.log(chalk.cyan(`\nDone. ${found}/${properties.length} got a photo.`));
}

main()
  .catch((error) => {
    console.error(chalk.red("Backfill failed:"), error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
