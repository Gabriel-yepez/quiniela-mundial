/**
 * Normaliza un correo para que registro, login y reset usen siempre la
 * misma forma canónica (sin espacios y en minúsculas).
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Valida el formato de un correo. Misma forma que el `pattern` del input HTML
 * en la pantalla de autenticacion, para que cliente y servidor coincidan.
 */
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}
