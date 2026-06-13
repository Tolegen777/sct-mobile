/**
 * «Мой гараж» на дашборде — RN-порт features/home/MyGarageColumn.tsx.
 * Неактивные авто (активное показано в ActiveCarBlock) + «Сделать активным» +
 * CTA «Добавить автомобиль». Данные: useCarsQuery / useSetDefaultCarMutation.
 */
import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCarsQuery, useSetDefaultCarMutation } from '@/features/garage/queries'
import { Card } from '@/shared/ui/Card'
import { SafeImage } from '@/shared/ui/SafeImage'
import { Skeleton } from '@/shared/ui/Skeleton'
import { getCarPhoto, getCarTitle } from '@/features/garage/lib'
import type { ClientGarageCar } from '@/shared/api/types'

export function MyGarageColumn() {
  const router = useRouter()
  const { data: cars, isLoading } = useCarsQuery()
  const setDefault = useSetDefaultCarMutation()
  const others = (cars ?? []).filter((c) => !c.is_default)

  return (
    <Card className="p-5">
      <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[12px] uppercase tracking-widest text-textSecondary">
        Мой гараж
      </Text>
      <View className="mt-5 gap-3">
        {isLoading ? (
          <>
            <Skeleton.Row />
            <Skeleton.Row />
          </>
        ) : (
          <>
            {others.map((car) => (
              <CarRow
                key={car.id}
                car={car}
                onSetDefault={() => setDefault.mutate(car.id)}
                isPending={setDefault.isPending && setDefault.variables === car.id}
              />
            ))}
            <Pressable
              onPress={() => router.push('/garage/add')}
              className="items-center gap-2 rounded-sct border-2 border-dashed border-borderLight bg-surfaceLight py-6 active:opacity-90"
            >
              <View className="h-8 w-8 items-center justify-center rounded-full bg-white">
                <Ionicons name="add" size={18} color="#1F5FAF" />
              </View>
              <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[10px] uppercase tracking-widest text-textSecondary">
                Добавить автомобиль
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </Card>
  )
}

function CarRow({
  car,
  onSetDefault,
  isPending,
}: {
  car: ClientGarageCar
  onSetDefault: () => void
  isPending: boolean
}) {
  const title = getCarTitle(car)
  const photo = getCarPhoto(car)
  return (
    <View className="rounded-sct border border-borderLight bg-white p-3">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-16 items-center justify-center overflow-hidden rounded-lg border border-borderLight bg-surfaceLight">
          <SafeImage
            uri={photo}
            resizeMode="cover"
            className="h-full w-full"
            fallback={
              <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[10px] uppercase text-borderLight">
                {title.slice(0, 2)}
              </Text>
            }
          />
        </View>
        <View className="flex-1">
          <Text style={{ fontFamily: 'Inter_900Black' }} numberOfLines={1} className="text-sm uppercase text-textPrimary">
            {title}
          </Text>
          {car.license_plate ? (
            <Text className="mt-1 text-[10px] uppercase tracking-wide text-textSecondary">{car.license_plate}</Text>
          ) : null}
        </View>
      </View>
      <Pressable
        onPress={onSetDefault}
        disabled={isPending}
        className="mt-3 flex-row items-center justify-center gap-1.5 rounded-md bg-brandBlue px-3 py-2 active:opacity-90"
      >
        <Ionicons name="checkmark" size={12} color="#ffffff" />
        <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[10px] uppercase tracking-widest text-white">
          {isPending ? 'Сохраняем…' : 'Сделать активным'}
        </Text>
      </Pressable>
    </View>
  )
}
