/**
 * Карточка авто в гараже — RN-порт features/garage/CarCard.tsx.
 * Активное: жёлтый бейдж + подсветка + одна кнопка «Редактировать».
 * Неактивное: «Сделать активным» + «Редактировать». set-default — через колбэк.
 */
import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import type { ClientGarageCar } from '@/shared/api/types'
import { Button } from '@/shared/ui/Button'
import { SafeImage } from '@/shared/ui/SafeImage'
import { cn } from '@/shared/lib/cn'
import { getCarPhoto, getCarSubtitle, getCarTitle } from './lib'

interface CarCardProps {
  car: ClientGarageCar
  onSetDefault: (id: number) => void
  isSettingDefault?: boolean
}

export function CarCard({ car, onSetDefault, isSettingDefault }: CarCardProps) {
  const router = useRouter()
  const photo = getCarPhoto(car)
  const title = getCarTitle(car)
  const subtitle = getCarSubtitle(car)
  const isActive = Boolean(car.is_default)

  return (
    <View className={cn('rounded-sct-lg border bg-white p-5', isActive ? 'border-brandBlue bg-blue-50' : 'border-borderLight')}>
      <View className="flex-row items-start gap-4">
        <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-borderLight bg-surfaceLight">
          <SafeImage
            uri={photo}
            resizeMode="cover"
            className="h-full w-full"
            fallback={<Ionicons name="car-outline" size={30} color="#D9DEE5" />}
          />
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <Text style={{ fontFamily: 'Inter_900Black' }} numberOfLines={1} className="flex-1 text-lg uppercase text-textPrimary">
              {car.nickname || title}
            </Text>
            {isActive ? (
              <View className="flex-row items-center gap-1.5 rounded-lg bg-brandYellow px-2.5 py-1">
                <View className="h-1.5 w-1.5 rounded-full bg-textPrimary/70" />
                <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[10px] uppercase tracking-widest text-textPrimary">
                  Активен
                </Text>
              </View>
            ) : null}
          </View>
          {subtitle ? (
            <Text
              style={{ fontFamily: 'Inter_700Bold' }}
              numberOfLines={1}
              className={cn('mt-1 text-[12px] uppercase', isActive ? 'text-brandBlue' : 'text-textSecondary')}
            >
              {subtitle}
            </Text>
          ) : null}
          {car.license_plate ? (
            <View className="mt-2 self-start rounded bg-textPrimary px-2 py-0.5">
              <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-[10px] uppercase text-white">{car.license_plate}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View className="mt-5 flex-row gap-2 border-t border-borderLight pt-4">
        {!isActive ? (
          <View className="flex-1">
            <Button variant="primary" size="sm" fullWidth loading={isSettingDefault} onPress={() => onSetDefault(car.id)}>
              Сделать активным
            </Button>
          </View>
        ) : null}
        <View className="flex-1">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            leftIcon={<Ionicons name="create-outline" size={14} color="#18202A" />}
            onPress={() => router.push(`/garage/edit/${car.id}`)}
          >
            Редактировать
          </Button>
        </View>
      </View>
    </View>
  )
}
