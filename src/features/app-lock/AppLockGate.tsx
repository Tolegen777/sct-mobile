/**
 * Обёртка приложения. Делает три вещи:
 *  1) Рисует LockScreen поверх детей, когда status==='locked' и юзер авторизован.
 *  2) Слушает AppState: фон → запоминаем время; возврат → блокируем при >30с.
 *  3) При выходе из сессии (phase→'guest') стирает пин и снимает замок —
 *     единая точка очистки для всех путей logout (ручной, 5 попыток, истёкший токен).
 */
import { useEffect, type ReactNode } from 'react'
import { AppState } from 'react-native'
import { useAuthStore } from '@/features/auth/store'
import { useAppLockStore } from './store'
import { LockScreen } from './LockScreen'
import * as storage from './storage'

export function AppLockGate({ children }: { children: ReactNode }) {
  const status = useAppLockStore((s) => s.status)
  const phase = useAuthStore((s) => s.phase)

  // AppState: фон/возврат
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const store = useAppLockStore.getState()
      if (next === 'background' || next === 'inactive') {
        store.markBackgrounded()
      } else if (next === 'active') {
        store.handleResume(useAuthStore.getState().phase === 'authed')
      }
    })
    return () => sub.remove()
  }, [])

  // Очистка при выходе из сессии
  useEffect(() => {
    if (phase === 'guest') {
      void (async () => {
        await storage.clear()
        await useAppLockStore.getState().reloadConfig()
        useAppLockStore.getState().unlock()
      })()
    }
  }, [phase])

  return (
    <>
      {children}
      {status === 'locked' && phase === 'authed' ? <LockScreen /> : null}
    </>
  )
}
