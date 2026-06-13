/**
 * Константы и чистая логика модуля app-lock.
 * Вынесено отдельно, чтобы решение «блокировать ли» было тестируемым и без
 * зависимостей от native-модулей.
 */

/** Длина пин-кода (см. спеку: 4 цифры). */
export const PIN_LENGTH = 4

/** Сколько неверных попыток до выхода из сессии. */
export const MAX_ATTEMPTS = 5

/** Сколько приложение может пробыть в фоне без перезапроса пина (мс). */
export const BACKGROUND_GRACE_MS = 30_000

/**
 * Нужно ли блокировать при возврате из фона.
 * @param backgroundedAt момент ухода в фон (мс) или null, если не уходили
 * @param now текущий момент (мс)
 */
export function shouldLockOnResume(
  backgroundedAt: number | null,
  now: number,
): boolean {
  if (backgroundedAt === null) return false
  return now - backgroundedAt > BACKGROUND_GRACE_MS
}
