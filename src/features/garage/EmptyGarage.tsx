/**
 * Empty-state пустого гаража — RN-порт features/garage/EmptyGarage.tsx.
 * Фон-баннер (фото-заглушка веба) → navy-подложка + белая карточка с CTA.
 */
import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

export function EmptyGarage() {
  const router = useRouter()
  return (
    <View className="flex-1 items-center justify-center overflow-hidden rounded-sct-lg bg-navy p-5">
      <View className="w-full max-w-md items-center rounded-sct-lg border-2 border-dashed border-borderLight bg-white px-6 py-10">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-surfaceLight">
          <Text style={{ fontFamily: 'Inter_900Black' }} className="text-3xl text-textPrimary">+</Text>
        </View>
        <Text style={{ fontFamily: 'Inter_900Black' }} className="mt-6 text-2xl uppercase text-textPrimary">
          Гараж пуст
        </Text>
        <Text className="mt-3 text-center text-sm text-textSecondary">
          Добавьте ваш автомобиль, чтобы SCT Service сохранял историю обслуживания.
        </Text>
        <Pressable
          onPress={() => router.push('/garage/add')}
          className="mt-8 h-14 items-center justify-center rounded-sct bg-brandBlue px-8 active:opacity-90"
        >
          <Text style={{ fontFamily: 'Inter_900Black' }} className="text-sm uppercase tracking-widest text-white">
            Добавить автомобиль
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
