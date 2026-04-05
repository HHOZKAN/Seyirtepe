/**
 * Lightweight input validation helpers — no external deps.
 */

export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function validUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

export function sanitize(s: string, max = 500): string {
  return s.trim().slice(0, max)
}

export function validDate(s: string): boolean {
  const d = new Date(s)
  return !isNaN(d.getTime())
}

export function validRole(rol: string): boolean {
  return ['baskan', 'sayman', 'sekreter', 'admin', 'arazi_sahibi'].includes(rol)
}

export function assertInput(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message)
}
