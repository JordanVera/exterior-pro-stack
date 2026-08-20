export function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function dollarsWhole(cents: number) {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

export function displayName(user: {
  email: string;
  customerProfile?: { firstName: string; lastName: string } | null;
  providerProfile?: { businessName: string } | null;
}) {
  if (user.customerProfile) {
    return `${user.customerProfile.firstName} ${user.customerProfile.lastName}`.trim();
  }
  if (user.providerProfile?.businessName) return user.providerProfile.businessName;
  return user.email;
}
