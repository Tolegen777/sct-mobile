/**
 * Гард для защищённых экранов — аналог app/RequireAuth.tsx из веба.
 * Пока идёт bootstrap (idle/loading) — спиннер; гость — редирект на /login.
 */
import { type ReactNode } from 'react'
import { Redirect } from 'expo-router'
import { View } from 'react-native'
import { useAuthStore } from '@/features/auth/store'
import { Spinner } from './Spinner'

export function RequireAuth({ children }: { children: ReactNode }) {
  const phase = useAuthStore((s) => s.phase)

  if (phase === 'idle' || phase === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Spinner />
      </View>
    )
  }

  if (phase !== 'authed') return <Redirect href="/login" />

  return <>{children}</>
}
