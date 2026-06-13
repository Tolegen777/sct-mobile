/**
 * Блок активного авто на дашборде — компактный порт features/home/
 * ActiveCarBlock.tsx. Источник — service-book/page-data (selected_car +
 * рекомендация по маслу + ближайший визит). CTA «Записаться».
 */
import { type ReactNode } from 'react'
import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useServiceBookQuery } from '@/features/service-book/queries'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Skeleton } from '@/shared/ui/Skeleton'
import { formatDateTime } from '@/shared/lib/format'

export function ActiveCarBlock() {
  const router = useRouter()
  const { data, isLoading } = useServiceBookQuery({ status: 'all', period: 'upcoming', limit: 1, offset: 0 })

  if (isLoading) return <Skeleton.Card className="h-40" />

  const car = data?.selected_car
  if (!car) return null

  const oil = data?.service_recommendations?.engine_oil
  const next = data?.next_appointment
  const nextDt = next?.final_datetime ?? next?.scheduled_datetime ?? next?.preferred_datetime

  return (
    <Card className="p-5">
      <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[10px] uppercase tracking-widest text-brandBlue">
        ● Активное авто
      </Text>
      <Text style={{ fontFamily: 'Inter_900Black' }} className="mt-1 text-lg uppercase text-textPrimary">
        {car.full_car_title || car.display_name}
      </Text>

      <View className="mt-2 flex-row flex-wrap gap-2">
        {car.license_plate ? <Badge>{car.license_plate}</Badge> : null}
        {typeof car.latest_mileage_km === 'number' ? <Badge>{car.latest_mileage_km} км</Badge> : null}
        {car.status_label ? <Badge>{car.status_label}</Badge> : null}
      </View>

      {oil?.message ? (
        <View className="mt-4 rounded-sct border border-borderLight bg-surfaceLight p-3">
          <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[10px] uppercase tracking-widest text-textSecondary">
            Рекомендация
          </Text>
          <Text className="mt-1 text-sm text-textPrimary">{oil.message}</Text>
        </View>
      ) : null}

      {next ? (
        <View className="mt-3 rounded-sct border border-brandBlue/30 bg-blue-50 p-3">
          <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[10px] uppercase tracking-widest text-brandBlue">
            Ближайший визит
          </Text>
          <Text style={{ fontFamily: 'Inter_700Bold' }} className="mt-1 text-sm text-textPrimary">
            {next.service?.title ?? next.service_package?.title ?? 'Услуга'}
          </Text>
          <Text className="mt-0.5 text-[11px] uppercase tracking-wide text-textSecondary">
            {nextDt ? formatDateTime(nextDt) : '—'}
          </Text>
        </View>
      ) : null}

      <View className="mt-4">
        <Button fullWidth onPress={() => router.push('/services')}>
          Записаться на сервис
        </Button>
      </View>
    </Card>
  )
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <View className="rounded bg-surfaceMuted px-2 py-1">
      <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-[10px] uppercase tracking-wide text-textSecondary">
        {children}
      </Text>
    </View>
  )
}
