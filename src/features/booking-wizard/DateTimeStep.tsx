/**
 * Шаг «Дата и время» (RN-порт features/booking-wizard/DateTimeStep.tsx).
 *
 * Сверху — горизонтальная лента дней из расписания выбранного филиала
 * (14 дней). Выходные/закрытые — disabled. Под ней — слоты с разделением
 * «Утро / День / Вечер». Для сегодняшнего дня прошедшие слоты заблокированы.
 */
import { useMemo } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useServiceStationQuery } from '@/features/service-stations/queries'
import { Spinner } from '@/shared/ui/Spinner'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'
import { buildTimeSlots, dayShortLabel, groupSlotsByPeriod, type TimeSlot } from './lib'
import type { StationScheduleDay } from '@/features/service-stations/types'

interface DateTimeStepProps {
  branchId: number
  selectedDate: string | null
  selectedSlot: string | null
  onChange: (date: string | null, slot: string | null) => void
}

export function DateTimeStep({ branchId, selectedDate, selectedSlot, onChange }: DateTimeStepProps) {
  const { data, isLoading, isError } = useServiceStationQuery(branchId, 14)

  // Минимальное допустимое время для is_today — сейчас + 30 минут.
  const firstAllowed = useMemo(() => new Date(Date.now() + 30 * 60_000), [])

  if (isLoading) {
    return (
      <View className="min-h-[260px] items-center justify-center">
        <Spinner />
      </View>
    )
  }

  if (isError || !data) {
    return (
      <View className="rounded-sct border border-red-200 bg-red-50 p-4">
        <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-sm text-red-700">
          Не удалось загрузить расписание филиала.
        </Text>
      </View>
    )
  }

  const selectedDay = data.schedule.find((d) => d.date === selectedDate) ?? null
  const slots = selectedDay
    ? buildTimeSlots(selectedDay, selectedDay.is_today ? firstAllowed : undefined)
    : []
  const { morning, day, evening } = groupSlotsByPeriod(slots)

  return (
    <View className="gap-7">
      <View>
        <Text style={{ fontFamily: 'Inter_900Black' }} className="text-xl uppercase text-textPrimary">
          Выберите дату и время
        </Text>
        <Text className="mt-1 text-sm text-textSecondary">
          В{' '}
          <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-textPrimary">
            {data.name}
          </Text>
          . Слоты по 30 минут.
        </Text>
      </View>

      {/* Дни */}
      <View>
        <Text
          style={{ fontFamily: 'Inter_900Black' }}
          className="mb-3 text-[11px] uppercase tracking-widest text-textSecondary"
        >
          Дата визита
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
        >
          {data.schedule.map((d) => (
            <DayChip
              key={d.date}
              day={d}
              isSelected={d.date === selectedDate}
              onSelect={() => onChange(d.date, null)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Слоты */}
      {selectedDay ? (
        slots.length === 0 ? (
          <Card className="p-4">
            <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-center text-sm text-textSecondary">
              {selectedDay.is_closed
                ? 'В этот день филиал закрыт.'
                : 'На этот день нет доступных слотов.'}
            </Text>
          </Card>
        ) : (
          <View className="gap-5">
            <SlotGroup
              title="Утро"
              hint="до 12:00"
              slots={morning}
              selected={selectedSlot}
              onSelect={(slot) => onChange(selectedDate, slot)}
            />
            <SlotGroup
              title="День"
              hint="12:00 – 18:00"
              slots={day}
              selected={selectedSlot}
              onSelect={(slot) => onChange(selectedDate, slot)}
            />
            <SlotGroup
              title="Вечер"
              hint="после 18:00"
              slots={evening}
              selected={selectedSlot}
              onSelect={(slot) => onChange(selectedDate, slot)}
            />
          </View>
        )
      ) : (
        <Text className="text-sm text-textSecondary">
          Выберите день — мы покажем доступные слоты.
        </Text>
      )}
    </View>
  )
}

function DayChip({
  day,
  isSelected,
  onSelect,
}: {
  day: StationScheduleDay
  isSelected: boolean
  onSelect: () => void
}) {
  const { weekday, date } = dayShortLabel(day)
  const disabled = day.is_closed || !day.available
  return (
    <Pressable
      onPress={onSelect}
      disabled={disabled}
      className={cn(
        'min-w-[84px] items-center rounded-sct border px-3 py-3',
        disabled
          ? 'border-borderLight bg-surfaceLight opacity-40'
          : isSelected
          ? 'border-brandBlue bg-brandBlue'
          : 'border-borderLight bg-white',
      )}
    >
      <Text
        style={{ fontFamily: 'Inter_900Black' }}
        className={cn('text-[10px] uppercase tracking-widest', isSelected ? 'text-white/80' : 'text-textSecondary')}
      >
        {weekday}
      </Text>
      <Text
        style={{ fontFamily: 'Inter_900Black' }}
        className={cn('mt-1 text-base', isSelected ? 'text-white' : 'text-textPrimary')}
      >
        {date}
      </Text>
      {disabled ? (
        <Text
          style={{ fontFamily: 'Inter_700Bold' }}
          className="mt-1 text-[9px] uppercase tracking-widest text-textSecondary"
        >
          Выходной
        </Text>
      ) : null}
    </Pressable>
  )
}

function SlotGroup({
  title,
  hint,
  slots,
  selected,
  onSelect,
}: {
  title: string
  hint: string
  slots: TimeSlot[]
  selected: string | null
  onSelect: (slot: string) => void
}) {
  if (slots.length === 0) return null
  return (
    <View>
      <Text
        style={{ fontFamily: 'Inter_900Black' }}
        className="mb-2 text-[10px] uppercase tracking-widest text-textSecondary"
      >
        {title} <Text className="text-textSecondary/50">· {hint}</Text>
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {slots.map((slot) => {
          const isSelected = selected === slot.localIso
          return (
            <Pressable
              key={slot.localIso}
              disabled={slot.inPast}
              onPress={() => onSelect(slot.localIso)}
              className={cn(
                'w-[31%] items-center rounded-sct border px-2 py-3',
                slot.inPast
                  ? 'border-borderLight bg-surfaceLight opacity-40'
                  : isSelected
                  ? 'border-brandBlue bg-brandBlue'
                  : 'border-borderLight bg-white',
              )}
            >
              <Text
                style={{ fontFamily: 'Inter_900Black' }}
                className={cn(
                  'text-sm',
                  slot.inPast
                    ? 'text-textSecondary line-through'
                    : isSelected
                    ? 'text-white'
                    : 'text-textPrimary',
                )}
              >
                {slot.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
