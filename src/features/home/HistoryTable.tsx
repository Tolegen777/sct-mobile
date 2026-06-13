/**
 * «История обслуживания» на дашборде — RN-порт features/home/HistoryTable.tsx.
 * Завершённые записи (status=completed). Пусто → не рендерим.
 */
import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useServiceBookQuery } from '@/features/service-book/queries'
import { Card } from '@/shared/ui/Card'
import { formatDateTime } from '@/shared/lib/format'
import type { Appointment } from '@/features/service-book/types'

export function HistoryTable() {
  const router = useRouter()
  const { data } = useServiceBookQuery({ status: 'completed', period: 'past', limit: 5, offset: 0 })
  if (!data) return null

  const items = data.appointments.filter((a) => !a.is_active)
  if (items.length === 0) return null

  return (
    <View className="gap-3">
      <Text style={{ fontFamily: 'Inter_900Black' }} className="text-xl uppercase text-textPrimary">
        История обслуживания
      </Text>
      <Card className="overflow-hidden">
        {items.map((a) => (
          <HistoryRow key={a.id} appointment={a} onPress={() => router.push(`/bookings/${a.id}`)} />
        ))}
      </Card>
    </View>
  )
}

function HistoryRow({ appointment, onPress }: { appointment: Appointment; onPress: () => void }) {
  const dt = appointment.final_datetime ?? appointment.scheduled_datetime ?? appointment.preferred_datetime
  const title = appointment.service?.title ?? appointment.service_package?.title ?? 'Услуга'
  const price =
    appointment.service?.display_price ?? appointment.service_package?.display_price ?? ''

  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 border-b border-borderLight px-4 py-3.5 active:opacity-90">
      <View className="flex-1">
        <Text style={{ fontFamily: 'Inter_700Bold' }} numberOfLines={1} className="text-sm text-textPrimary">
          {title}
        </Text>
        <Text className="mt-0.5 text-[11px] uppercase tracking-wide text-textSecondary">
          {dt ? formatDateTime(dt) : '—'} · {appointment.status_label}
        </Text>
      </View>
      {price ? (
        <Text style={{ fontFamily: 'Inter_900Black' }} className="text-sm text-brandBlue">
          {price}
        </Text>
      ) : null}
    </Pressable>
  )
}
