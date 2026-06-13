/**
 * «Предстоящие визиты» на дашборде — RN-порт features/home/
 * UpcomingVisitsSection.tsx. До 3 активных записей; пусто → не рендерим.
 */
import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useServiceBookQuery } from '@/features/service-book/queries'
import { Card } from '@/shared/ui/Card'
import { formatDateTime } from '@/shared/lib/format'
import type { Appointment } from '@/features/service-book/types'

export function UpcomingVisitsSection() {
  const router = useRouter()
  const { data } = useServiceBookQuery({ status: 'active', period: 'upcoming', limit: 5, offset: 0 })
  if (!data) return null

  const upcoming = data.appointments.filter((a) => a.is_active && !a.is_cancelled)
  const all = data.next_appointment
    ? [data.next_appointment, ...upcoming.filter((a) => a.id !== data.next_appointment?.id)]
    : upcoming
  const items = all.slice(0, 3)
  if (items.length === 0) return null

  return (
    <View className="gap-3">
      <View className="flex-row items-end justify-between">
        <View className="flex-1">
          <Text style={{ fontFamily: 'Inter_900Black' }} className="text-xl uppercase text-textPrimary">
            Предстоящие визиты
          </Text>
          <Text className="mt-1 text-[12px] text-textSecondary">Ваши активные записи на обслуживание</Text>
        </View>
        <Pressable onPress={() => router.push('/service-book')}>
          <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[11px] uppercase tracking-widest text-brandBlue">
            Записи →
          </Text>
        </Pressable>
      </View>

      {items.map((a, idx) => (
        <VisitRow key={a.id} appointment={a} highlighted={idx === 0} onPress={() => router.push(`/bookings/${a.id}`)} />
      ))}
    </View>
  )
}

function VisitRow({
  appointment,
  highlighted,
  onPress,
}: {
  appointment: Appointment
  highlighted: boolean
  onPress: () => void
}) {
  const dt = appointment.final_datetime ?? appointment.scheduled_datetime ?? appointment.preferred_datetime
  const title = appointment.service?.title ?? appointment.service_package?.title ?? 'Услуга'

  return (
    <Pressable onPress={onPress}>
      <Card className={`p-4 ${highlighted ? 'border-brandBlue/30 bg-blue-50' : ''}`}>
        {highlighted ? (
          <View className="mb-1 self-start rounded-md bg-brandBlue px-2 py-0.5">
            <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[9px] uppercase tracking-widest text-white">
              Ближайший визит
            </Text>
          </View>
        ) : null}
        <Text style={{ fontFamily: 'Inter_900Black' }} numberOfLines={1} className="text-base uppercase text-textPrimary">
          {title}
        </Text>
        <Text style={{ fontFamily: 'Inter_700Bold' }} className="mt-1 text-[11px] uppercase tracking-wide text-textSecondary">
          {dt ? formatDateTime(dt) : '—'}
          {appointment.car?.title ? ` · ${appointment.car.title}` : ''}
        </Text>
      </Card>
    </Pressable>
  )
}
