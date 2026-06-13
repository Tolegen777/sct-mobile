/**
 * Хранилище JWT-токенов клиента для React Native.
 *
 * Веб-версия читала localStorage СИНХРОННО. В RN SecureStore асинхронный,
 * поэтому держим in-memory зеркало:
 *   - чтение (getAccess/getRefresh/hasSession) — синхронное из памяти,
 *     благодаря чему http.ts и features/auth/store.ts переносятся БЕЗ правок;
 *   - запись (setTokens/setAccess/clear) — сразу в память + fire-and-forget
 *     persist в SecureStore.
 *
 * ⚠️ На старте приложения нужно ОДИН раз вызвать `hydrateTokens()` (в корневом
 * layout, до первого защищённого запроса и до authStore.hydrate()), чтобы
 * поднять токены из SecureStore в память.
 *
 * Только клиентский scope — staff-сессия в мобильном приложении не нужна.
 */
import * as SecureStore from 'expo-secure-store'

const KEYS = {
  access: 'sct_client_access',
  refresh: 'sct_client_refresh',
} as const

let accessMem: string | null = null
let refreshMem: string | null = null

function persist(key: string, value: string | null): void {
  // fire-and-forget — UI не ждёт записи на диск
  if (value === null) void SecureStore.deleteItemAsync(key)
  else void SecureStore.setItemAsync(key, value)
}

export const tokenStorage = {
  getAccess(): string | null {
    return accessMem
  },
  getRefresh(): string | null {
    return refreshMem
  },
  setTokens(access: string, refresh: string): void {
    accessMem = access
    refreshMem = refresh
    persist(KEYS.access, access)
    persist(KEYS.refresh, refresh)
  },
  setAccess(value: string): void {
    accessMem = value
    persist(KEYS.access, value)
  },
  clear(): void {
    accessMem = null
    refreshMem = null
    persist(KEYS.access, null)
    persist(KEYS.refresh, null)
  },
  hasSession(): boolean {
    return Boolean(accessMem)
  },
}

/**
 * Поднимает токены из SecureStore в память. Вызвать один раз на старте
 * приложения (см. app/_layout.tsx) до рендера защищённого контента.
 */
export async function hydrateTokens(): Promise<void> {
  const [access, refresh] = await Promise.all([
    SecureStore.getItemAsync(KEYS.access),
    SecureStore.getItemAsync(KEYS.refresh),
  ])
  accessMem = access
  refreshMem = refresh
}

// Совместимость с именами из веба.
export const clientTokens = tokenStorage
