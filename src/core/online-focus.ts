/**
 * RN-специфика для TanStack Query, которой нет в вебе:
 *   - focusManager: рефетч при возврате приложения на передний план
 *     (аналог refetchOnWindowFocus в браузере);
 *   - onlineManager: online-статус через NetInfo — офлайн запросы на паузе.
 *
 * Вызвать оба setup-а один раз на старте (см. app/_layout.tsx).
 */
import { AppState, type AppStateStatus, Platform } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import { focusManager, onlineManager } from '@tanstack/react-query'

export function setupAppStateFocus(): () => void {
  const onChange = (status: AppStateStatus) => {
    if (Platform.OS !== 'web') focusManager.setFocused(status === 'active')
  }
  const sub = AppState.addEventListener('change', onChange)
  return () => sub.remove()
}

export function setupOnlineManager(): void {
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected))),
  )
}
