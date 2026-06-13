/**
 * Хранилище настроек замка в expo-secure-store (аппаратный Keychain/Keystore).
 * Булевы значения кодируем строками '1'/'0' — SecureStore хранит только строки.
 */
import * as SecureStore from 'expo-secure-store'

const KEYS = {
  enabled: 'sct_lock_enabled',
  biometric: 'sct_lock_biometric',
  salt: 'sct_lock_salt',
  hash: 'sct_lock_hash',
  attempts: 'sct_lock_attempts',
} as const

export interface AppLockConfig {
  enabled: boolean
  biometricEnabled: boolean
  salt: string | null
  hash: string | null
  failedAttempts: number
}

export async function loadConfig(): Promise<AppLockConfig> {
  const [enabled, biometric, salt, hash, attempts] = await Promise.all([
    SecureStore.getItemAsync(KEYS.enabled),
    SecureStore.getItemAsync(KEYS.biometric),
    SecureStore.getItemAsync(KEYS.salt),
    SecureStore.getItemAsync(KEYS.hash),
    SecureStore.getItemAsync(KEYS.attempts),
  ])
  return {
    enabled: enabled === '1',
    biometricEnabled: biometric === '1',
    salt: salt ?? null,
    hash: hash ?? null,
    failedAttempts: attempts ? Number(attempts) : 0,
  }
}

/** Сохранить пин (соль+хэш). */
export async function setPin(salt: string, hash: string): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(KEYS.salt, salt),
    SecureStore.setItemAsync(KEYS.hash, hash),
  ])
}

export async function setEnabled(value: boolean): Promise<void> {
  await SecureStore.setItemAsync(KEYS.enabled, value ? '1' : '0')
}

export async function setBiometric(value: boolean): Promise<void> {
  await SecureStore.setItemAsync(KEYS.biometric, value ? '1' : '0')
}

export async function getFailedAttempts(): Promise<number> {
  const v = await SecureStore.getItemAsync(KEYS.attempts)
  return v ? Number(v) : 0
}

export async function setFailedAttempts(n: number): Promise<void> {
  await SecureStore.setItemAsync(KEYS.attempts, String(n))
}

/** Полностью стереть замок (при выключении/выходе из сессии). */
export async function clear(): Promise<void> {
  await Promise.all(
    Object.values(KEYS).map((k) => SecureStore.deleteItemAsync(k)),
  )
}
