/**
 * Шаг «Выбор филиала» (RN-порт features/booking-wizard/BranchStep.tsx).
 *
 * Карточки филиалов одной колонкой: иконка → название → адрес → «ближайшее
 * окно» (из расписания). Тап по карточке выбирает филиал и ведёт дальше.
 */
import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useServiceStationsQuery } from '@/features/service-stations/queries'
import type { ServiceStation } from '@/features/service-stations/types'
import { Spinner } from '@/shared/ui/Spinner'
import { cn } from '@/shared/lib/cn'

interface BranchStepProps {
  selectedId: number | null
  onSelect: (station: ServiceStation) => void
}

export function BranchStep({ selectedId, onSelect }: BranchStepProps) {
  const { data, isLoading, isError } = useServiceStationsQuery({ days: 14 })

  if (isLoading) {
    return (
      <View className="min-h-[260px] items-center justify-center">
        <Spinner />
      </View>
    )
  }

  if (isError || !data || data.results.length === 0) {
    return (
      <View className="rounded-sct border border-red-200 bg-red-50 p-4">
        <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-sm text-red-700">
          Не удалось загрузить список филиалов. Попробуйте обновить позже.
        </Text>
      </View>
    )
  }

  return (
    <View className="gap-3">
      <View className="mb-1">
        <Text style={{ fontFamily: 'Inter_900Black' }} className="text-xl uppercase text-textPrimary">
          Выберите филиал
        </Text>
        <Text className="mt-1 text-sm text-textSecondary">
          Укажите, в каком филиале вам удобнее пройти обслуживание.
        </Text>
      </View>

      {data.results.map((station) => (
        <BranchCard
          key={station.id}
          station={station}
          isSelected={station.id === selectedId}
          onSelect={() => onSelect(station)}
        />
      ))}
    </View>
  )
}

function BranchCard({
  station,
  isSelected,
  onSelect,
}: {
  station: ServiceStation
  isSelected: boolean
  onSelect: () => void
}) {
  const nearestSlot = getNearestOpenLabel(station)

  return (
    <Pressable
      onPress={onSelect}
      className={cn(
        'flex-row items-center justify-between gap-4 rounded-sct border bg-white p-4',
        isSelected ? 'border-brandBlue' : 'border-borderLight',
      )}
    >
      <View className="flex-1 flex-row items-center gap-4">
        <View
          className={cn(
            'h-12 w-12 items-center justify-center rounded-sct border',
            isSelected ? 'border-brandBlue bg-brandBlue' : 'border-borderLight bg-surfaceLight',
          )}
        >
          <Ionicons name="location" size={22} color={isSelected ? '#fff' : '#1F5FAF'} />
        </View>
        <View className="flex-1">
          <Text
            style={{ fontFamily: 'Inter_900Black' }}
            numberOfLines={1}
            className="text-base uppercase text-textPrimary"
          >
            {station.name}
          </Text>
          <Text numberOfLines={1} className="mt-0.5 text-sm text-textSecondary">
            {station.address}
          </Text>
          {nearestSlot ? (
            <Text
              style={{ fontFamily: 'Inter_700Bold' }}
              className="mt-1 text-[10px] uppercase tracking-widest text-brandBlue"
            >
              Ближайшее окно: {nearestSlot}
            </Text>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={isSelected ? '#1F5FAF' : '#D9DEE5'} />
    </Pressable>
  )
}

function getNearestOpenLabel(station: ServiceStation): string | null {
  const today = station.schedule.find((d) => d.is_today)
  if (today && !today.is_closed && today.available) {
    return `Сегодня · ${today.label}`
  }
  const next = station.schedule.find((d) => !d.is_today && !d.is_closed && d.available)
  if (!next) return null
  return `${next.weekday_label} · ${next.label}`
}
