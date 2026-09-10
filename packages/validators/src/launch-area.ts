import { HOUSTON_ZIP_SET } from "./houston-zips";

export const LAUNCH_AREA_NAME = "Greater Houston";

export const LAUNCH_ZIP_MESSAGE =
  "Exterior Pro currently serves Greater Houston only. Use a Houston-area ZIP, or email support@exteriorpro.app to join the waitlist.";

export function normalizeZip(zip: string): string {
  return zip.trim().slice(0, 5);
}

export function isLaunchZip(zip: string): boolean {
  return HOUSTON_ZIP_SET.has(normalizeZip(zip));
}

export function launchZipsOutside(zips: string[]): string[] {
  return zips.filter((zip) => !isLaunchZip(zip));
}
