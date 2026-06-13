/**
 * Глобальный стор состояния замка.
 *
 * status:
 *   'pending'   — ещё не решили (до hydrate)
 *   'locked'    — показываем LockScreen
 *   'unlocked'  — приложение доступно
 *
 * Решение «блокировать ли» зависит от того, авторизован ли юзер — поэтому
 * методы принимают isAuthed (стор авторизации читаем в местах вызова, чтобы
 * не создавать жёсткую связь между сторами).
 */
import { create } from 'zustand'
import * as storage from './storage'
import { shouldLockOnResume } from './config'

type LockStatus = 'pending' | 'locked' | 'unlocked'

interface AppLockState {
  status: LockStatus
  enabled: boolean
  biometricEnabled: boolean
  backgroundedAt: number | null

  /** Старт приложения: загрузить конфиг и решить начальный статус. */
  hydrate: (isAuthed: boolean) => Promise<void>
  /** Перечитать конфиг из хранилища (после изменения настроек/выхода). */
  reloadConfig: () => Promise<void>
  /** Запомнить момент ухода в фон. */
  markBackgrounded: () => void
  /** Возврат из фона: заблокировать, если прошло >30с. */
  handleResume: (isAuthed: boolean) => void
  /** Принудительно заблокировать (если замок включён). */
  lock: () => void
  /** Разблокировать и сбросить счётчик попыток. */
  unlock: () => void
}

export const useAppLockStore = create<AppLockState>((set, get) => ({
  status: 'pending',
  enabled: false,
  biometricEnabled: false,
  backgroundedAt: null,

  hydrate: async (isAuthed) => {
    const cfg = await storage.loadConfig()
    set({
      enabled: cfg.enabled,
      biometricEnabled: cfg.biometricEnabled,
      status: cfg.enabled && isAuthed ? 'locked' : 'unlocked',
    })
  },

  reloadConfig: async () => {
    const cfg = await storage.loadConfig()
    set({ enabled: cfg.enabled, biometricEnabled: cfg.biometricEnabled })
  },

  markBackgrounded: () => set({ backgroundedAt: Date.now() }),

  handleResume: (isAuthed) => {
    const { enabled, backgroundedAt } = get()
    if (enabled && isAuthed && shouldLockOnResume(backgroundedAt, Date.now())) {
      set({ status: 'locked' })
    }
  },

  lock: () => {
    if (get().enabled) set({ status: 'locked' })
  },

  unlock: () => {
    void storage.setFailedAttempts(0)
    set({ status: 'unlocked', backgroundedAt: null })
  },
}))
