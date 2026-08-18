import { queryClient } from './query';

export function invalidateCrews() {
  return queryClient.invalidateQueries({ queryKey: ['crews'] });
}

/** Display a stored E.164 number as +1 (555) 123-4567 when possible. */
export function formatPhoneDisplay(phone?: string | null) {
  if (!phone) return 'No phone';
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return phone;
  return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function digitsToE164(digits: string) {
  return `+1${digits.replace(/\D/g, '').slice(0, 10)}`;
}

export function phoneToDigits(phone?: string | null) {
  return phone?.replace(/\D/g, '').slice(-10) ?? '';
}
