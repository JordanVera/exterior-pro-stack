export type AuthIntent = 'customer' | 'provider';

export function isAuthIntent(
  value: string | null | undefined,
): value is AuthIntent {
  return value === 'customer' || value === 'provider';
}

export function loginPath(intent?: AuthIntent | null) {
  return intent ? `/login?intent=${intent}` : '/login';
}

export function rolePath(intent?: AuthIntent | null) {
  return intent ? `/onboarding/role?intent=${intent}` : '/onboarding/role';
}
