/**
 * Узкая плашка активного авто над списком услуг — RN-порт features/packages/
 * ActiveCarStrip.tsx. Фото авто во вебе было заглушкой (src=undefined), здесь
 * тоже плейсхолдер «авто».
 */
import { Text, View } from 'react-native'
import { Card } from '@/shared/ui/Card'
import type { ClientActiveCar } from '@/shared/api/types'

export function ActiveCarStrip({ activeCar }: { activeCar: ClientActiveCar }) {
  return (
    <Card className="flex-row items-center gap-4 p-4">
      <View className="h-14 w-20 items-center justify-center rounded-sct border border-borderLight bg-surfaceLight">
        <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[10px] uppercase text-borderLight">
          авто
        </Text>
      </View>
      <View className="flex-1">
        <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[10px] uppercase tracking-widest text-brandBlue">
          ● Активное авто
        </Text>
        <Text
          style={{ fontFamily: 'Inter_900Black' }}
          numberOfLines={2}
          className="mt-1 text-base uppercase leading-tight text-textPrimary"
        >
          Услуги для {activeCar.car_title}
        </Text>
      </View>
      {activeCar.license_plate ? (
        <View className="rounded-md bg-textPrimary px-3 py-1">
          <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[12px] uppercase tracking-widest text-white">
            {activeCar.license_plate}
          </Text>
        </View>
      ) : null}
    </Card>
  )
}
