/**
 * Гараж — список авто клиента (порт pages/GaragePage.tsx). Источник —
 * useCarsQuery / useSetDefaultCarMutation. Пусто → EmptyGarage. Активное авто
 * сортируется первым. Удаление — на странице редактирования (как в вебе).
 */
import { Pressable, ScrollView, Text, View } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCarsQuery, useSetDefaultCarMutation } from '@/features/garage/queries'
import { CarCard } from '@/features/garage/CarCard'
import { EmptyGarage } from '@/features/garage/EmptyGarage'
import { RequireAuth } from '@/shared/ui/RequireAuth'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Button } from '@/shared/ui/Button'
import { parseApiError } from '@/features/auth/errors'

export default function GarageScreen() {
  return (
    <RequireAuth>
      <GarageInner />
    </RequireAuth>
  )
}

function GarageInner() {
  const router = useRouter()
  const { data: cars, isLoading, isError, error, refetch } = useCarsQuery()
  const setDefault = useSetDefaultCarMutation()

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-surfaceLight" contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Stack.Screen options={{ headerShown: true, title: 'Гараж' }} />
        <Skeleton.Card className="h-48" />
        <Skeleton.Card className="h-48" />
      </ScrollView>
    )
  }

  if (isError) {
    const message = parseApiError(error, 'Не удалось загрузить гараж.').general
    return (
      <View className="flex-1 items-center justify-center bg-surfaceLight p-6">
        <Stack.Screen options={{ headerShown: true, title: 'Гараж' }} />
        <View className="w-full items-center rounded-sct border border-red-200 bg-red-50 p-6">
          <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-center text-red-700">{message}</Text>
          <View className="mt-4">
            <Button variant="secondary" size="sm" onPress={() => refetch()}>
              Повторить
            </Button>
          </View>
        </View>
      </View>
    )
  }

  const sorted = [...(cars ?? [])].sort((a, b) => Number(b.is_default) - Number(a.is_default))

  if (sorted.length === 0) {
    return (
      <View className="flex-1 bg-surfaceLight p-4">
        <Stack.Screen options={{ headerShown: true, title: 'Гараж' }} />
        <EmptyGarage />
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-surfaceLight" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Stack.Screen options={{ headerShown: true, title: 'Мой гараж' }} />
      <Text className="text-sm text-textSecondary">
        Управляйте автопарком и выбирайте активный автомобиль для работы.
      </Text>

      {sorted.map((car) => (
        <CarCard
          key={car.id}
          car={car}
          onSetDefault={(id) => setDefault.mutate(id)}
          isSettingDefault={setDefault.isPending && setDefault.variables === car.id}
        />
      ))}

      <Pressable
        onPress={() => router.push('/garage/add')}
        className="items-center gap-3 rounded-sct-lg border-2 border-dashed border-borderLight bg-surfaceLight p-10 active:opacity-90"
      >
        <View className="h-14 w-14 items-center justify-center rounded-full bg-white">
          <Ionicons name="add" size={24} color="#4B5968" />
        </View>
        <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[11px] uppercase tracking-widest text-textSecondary">
          Добавить авто
        </Text>
      </Pressable>
    </ScrollView>
  )
}
