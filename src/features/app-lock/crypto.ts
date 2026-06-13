/**
 * Криптопримитивы для пина. Пин НЕ хранится в открытом виде — только
 * соль + SHA-256(соль:пин). Соль уникальна на устройство.
 */
import * as Crypto from 'expo-crypto'

/** Случайная 16-байтовая соль в hex. */
export async function generateSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** SHA-256 от "<salt>:<pin>" в hex. Детерминирована при одинаковых входах. */
export async function hashPin(pin: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${pin}`,
  )
}
