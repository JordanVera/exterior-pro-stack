/** Shared with Tailwind in tailwind.config.js — keep hex values in sync. */
export const colors = {
  lime: '#C8F542',
  navy: '#0B1F33',
  ink: '#0A1208',
  night: '#070B12',
  mist: '#F4F6F0',
  elevated: '#163552',
  muted: '#94a3b8',
  surface: '#101F30',
  surfaceRaised: '#17293D',
} as const;

/**
 * Font families for APIs that take a style object rather than a className
 * (navigation headers, tab bar labels). Mirrors the fontFamily block in
 * tailwind.config.js.
 */
export const fonts = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
} as const;
