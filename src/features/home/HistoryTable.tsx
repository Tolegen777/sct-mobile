/**
 * «История обслуживания» на дашборде — RN-порт features/home/HistoryTable.tsx.
 * Завершённые/отменённые/просроченные записи. Пусто → не рендерим.
 *
 * Список берём из `/service-book/bookings/` (не из `page-data`, где
 * `appointments` сейчас всегда приходит пустым) — см. `splitBookings`.
 */
import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useBookingsQuery } from '@/features/bookings/queries'
import { splitBookings } from '@/features/bookings/lib'
import type { Booking } from '@/features/bookings/types'
import { Card } from '@/shared/ui/Card'
import { formatDateTime } from '@/shared/lib/format'

export function HistoryTable() {
  const router = useRouter()
  const { data } = useBookingsQuery({ status: 'all', period: 'all', limit: 20, offset: 0 })
  if (!data) return null

  const { history } = splitBookings(data)
  const items = history.slice(0, 5)
  if (items.length === 0) return null

  return (
    <View className="gap-3">
      <Text style={{ fontFamily: 'Inter_900Black' }} className="text-xl uppercase text-textPrimary">
        История обслуживания
      </Text>
      <Card className="overflow-hidden">
        {items.map((booking) => (
          <HistoryRow key={booking.id} booking={booking} onPress={() => router.push(`/bookings/${booking.id}`)} />
        ))}
      </Card>
    </View>
  )
}

function HistoryRow({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  const dt = booking.final_datetime ?? booking.scheduled_datetime ?? booking.preferred_datetime
  const title =
    booking.service_data?.title ||
    booking.service_package_data?.title ||
    booking.default_service_page_data?.title ||
    'Услуга'
  const price = booking.price?.display || booking.service_data?.price?.display || ''

  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 border-b border-borderLight px-4 py-3.5 active:opacity-90">
      <View className="flex-1">
        <Text style={{ fontFamily: 'Inter_700Bold' }} numberOfLines={1} className="text-sm text-textPrimary">
          {title}
        </Text>
        <Text className="mt-0.5 text-[11px] uppercase tracking-wide text-textSecondary">
          {dt ? formatDateTime(dt) : '—'} · {booking.status_label}
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
