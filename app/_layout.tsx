import '../global.css'
import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClientProvider } from '@tanstack/react-query'
import * as SplashScreen from 'expo-splash-screen'
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  Inter_900Black,
} from '@expo-google-fonts/inter'
import { queryClient } from '@/core/query-client'
import { setupAppStateFocus, setupOnlineManager } from '@/core/online-focus'
import { hydrateTokens } from '@/shared/api/token-storage'
import { useAuthStore } from '@/features/auth/store'
import { useAppLockStore } from '@/features/app-lock/store'
import { AppLockGate } from '@/features/app-lock/AppLockGate'
import { ToastViewport } from '@/shared/ui/Toast'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [bootstrapped, setBootstrapped] = useState(false)
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_900Black,
  })

  // RN-аналоги refetchOnWindowFocus + online-aware (см. src/core/online-focus.ts)
  useEffect(() => {
    setupOnlineManager()
    return setupAppStateFocus()
  }, [])

  // Бутстрап: поднять токены из SecureStore в память, затем подтянуть профиль.
  // Аналог app/AuthBootstrap.tsx из веба.
  useEffect(() => {
    void (async () => {
      await hydrateTokens()
      await useAuthStore.getState().hydrate()
      const isAuthed = useAuthStore.getState().phase === 'authed'
      await useAppLockStore.getState().hydrate(isAuthed)
      setBootstrapped(true)
    })()
  }, [])

  useEffect(() => {
    if (fontsLoaded && bootstrapped) void SplashScreen.hideAsync()
  }, [fontsLoaded, bootstrapped])

  if (!fontsLoaded || !bootstrapped) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <AppLockGate>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#fff' },
                // Когда экран включает шапку (гараж, услуги, модалки) — navy,
                // заголовок по центру белым, у кнопки «назад» убираем подпись
                // «(tabs)» (оставляем только шеврон).
                headerStyle: { backgroundColor: '#0A1B3D' },
                headerTintColor: '#FFFFFF',
                headerTitleAlign: 'center',
                headerTitleStyle: { fontFamily: 'Inter_900Black', color: '#FFFFFF' },
                headerBackButtonDisplayMode: 'minimal',
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="login" options={{ presentation: 'modal', headerShown: true, title: 'Вход' }} />
              <Stack.Screen name="register" options={{ presentation: 'modal', headerShown: true, title: 'Регистрация' }} />
              <Stack.Screen name="forgot-password" options={{ presentation: 'modal', headerShown: true, title: 'Восстановление пароля' }} />
              <Stack.Screen name="app-lock/setup" options={{ presentation: 'modal', headerShown: true, title: 'Код-пароль' }} />
              <Stack.Screen name="app-lock/intro" options={{ headerShown: false }} />
            </Stack>
          </AppLockGate>
          <ToastViewport />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
