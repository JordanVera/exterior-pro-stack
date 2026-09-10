import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

config({ path: resolve(packageDir, ".env"), quiet: true });
config({ path: resolve(packageDir, "../../.env"), quiet: true });
