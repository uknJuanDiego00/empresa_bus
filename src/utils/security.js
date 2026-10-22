/**
 * Utilidades de seguridad para hashing de contraseñas y validación
 * Utiliza la API nativa Web Crypto (SHA-256) sin dependencias externas
 */

export async function hashPassword(password) {
  if (!password) return ''
  const encoder = new TextEncoder()
  const data = encoder.encode(String(password).trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false
  const calculatedHash = await hashPassword(password)
  return calculatedHash.toLowerCase() === String(storedHash).trim().toLowerCase()
}

export function validarEmail(email) {
  if (!email || typeof email !== 'string') return false
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email.trim())
}

export function validarUsername(username) {
  if (!username || typeof username !== 'string') return false
  const re = /^[a-zA-Z0-9_]{3,30}$/
  return re.test(username.trim())
}
