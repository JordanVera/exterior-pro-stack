/**
 * Applies the Houston launch plan mix to an existing database without reseeding.
 *
 *   npm run sync:launch-plans --workspace @repo/api
 *
 * Safe to re-run. Updates plan descriptions and PlanService rows; keeps Stripe
 * price IDs. If STRIPE_SECRET_KEY is set, also refreshes Stripe product copy.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { db } from '@repo/db';
import { syncLaunchPlans } from '../../db/prisma/launch-plans';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
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
  loadEnvFile(resolve(ROOT, 'packages/db/.env'));
  loadEnvFile(resolve(ROOT, 'apps/web/.env'));
  loadEnvFile(resolve(ROOT, '.env'));

  console.log(chalk.cyan('Syncing Houston launch plan mix…'));
  const plans = await syncLaunchPlans(db);

  for (const plan of plans) {
    const visits = plan.services
      .map((row) => `${row.service.name} (${row.frequency.toLowerCase()})`)
      .join(', ');
    console.log(chalk.green(`  ✔ ${plan.name} — $${plan.monthlyPrice}/mo`));
    console.log(chalk.gray(`    ${visits}`));
  }

  if (process.env.STRIPE_SECRET_KEY) {
    const { syncAllPlanStripePrices } = await import('../src/lib/payments');
    await syncAllPlanStripePrices();
    console.log(chalk.green('  ✔ Stripe product copy refreshed'));
  } else {
    console.log(
      chalk.yellow(
        '  ⚠ STRIPE_SECRET_KEY not set — skipped Stripe product update',
      ),
    );
  }
}

main()
  .catch((error) => {
    console.error(chalk.red('Launch plan sync failed:'), error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
