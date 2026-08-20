import { z } from "zod";

export const US_ZIP = /^\d{5}$/;
export const US_ZIP_OR_PLUS4 = /^\d{5}(?:-\d{4})?$/;
export const MAX_SERVICE_ZIPS = 80;

/** Split typed/pasted ZIP input into 5-digit codes, preserving order. */
export function parseZipCodes(raw: string): { zips: string[]; invalid: string[] } {
  const tokens = raw
    .split(/[\s,;]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const zips: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    if (!US_ZIP_OR_PLUS4.test(token)) {
      invalid.push(token);
      continue;
    }
    const zip = token.slice(0, 5);
    if (seen.has(zip)) continue;
    seen.add(zip);
    zips.push(zip);
  }

  return { zips, invalid };
}

export function serializeZipCodes(zips: string[]): string {
  return parseZipCodes(zips.join(",")).zips.join(",");
}

function zipListSchema(opts: { required: boolean }) {
  return z
    .string()
    .max(1000)
    .transform((val, ctx) => {
      const trimmed = val.trim();
      if (!trimmed) {
        if (opts.required) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Add at least one ZIP code",
          });
          return z.NEVER;
        }
        return "";
      }

      const { zips, invalid } = parseZipCodes(trimmed);
      if (invalid.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid ZIP code${invalid.length === 1 ? "" : "s"}: ${invalid.join(", ")}`,
        });
        return z.NEVER;
      }
      if (opts.required && zips.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Add at least one ZIP code",
        });
        return z.NEVER;
      }
      if (zips.length > MAX_SERVICE_ZIPS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `You can add up to ${MAX_SERVICE_ZIPS} ZIP codes`,
        });
        return z.NEVER;
      }
      return zips.join(",");
    });
}

export const requiredServiceAreaZipsSchema = zipListSchema({ required: true });
export const optionalServiceAreaZipsSchema = zipListSchema({ required: false });
