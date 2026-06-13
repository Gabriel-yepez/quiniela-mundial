/**
 * Normaliza un correo para que registro, login y reset usen siempre la
 * misma forma canónica (sin espacios y en minúsculas).
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
