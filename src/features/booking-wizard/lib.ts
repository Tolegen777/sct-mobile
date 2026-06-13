/**
 * Утилиты wizard'а записи на сервис (RN-порт features/booking-wizard/lib.ts).
 *
 * Бэк не отдаёт временных слотов — только часы работы (opens_at/closes_at) на
 * каждый день в schedule филиала. Слоты строим сами с шагом 30 минут. Когда
 * бэк подключит `/slots/?date=&service_station_id=&duration_min=` — заменим
 * `buildTimeSlots` на запрос к API, остальное останется как есть.
 *
 * Отличия от веба:
 *  - даты форматируем через date-fns + ru (как весь sct-mobile), чтобы не
 *    зависеть от наличия Intl-локалей в Hermes;
 *  - `localIso → UTC` собираем из компонентов даты — надёжнее строкового
 *    `new Date(str)` на Hermes.
 */
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { StationScheduleDay } from '@/features/service-stations/types'

export interface TimeSlot {
  /** ISO в локальной таймзоне, формат `YYYY-MM-DDTHH:mm` */
  localIso: string
  /** Лейбл для UI — `09:30` */
  label: string
  /** Час начала слота (для сегментации «утро/день/вечер») */
  hour: number
  /** Если слот в прошлом — блокируем (только для is_today) */
  inPast?: boolean
}

const SLOT_STEP_MIN = 30

/**
 * Строим временные слоты из расписания дня. Пустой массив для is_closed дней.
 * @param day          день из schedule филиала
 * @param firstAllowed самое раннее допустимое время (для is_today: now + 30 мин)
 */
export function buildTimeSlots(day: StationScheduleDay, firstAllowed?: Date): TimeSlot[] {
  if (day.is_closed || !day.available) return []
  const [openH, openM] = day.opens_at.split(':').map((s) => Number(s))
  const [closeH, closeM] = day.closes_at.split(':').map((s) => Number(s))
  const [year, month, dayNum] = day.date.split('-').map((s) => Number(s))

  const slots: TimeSlot[] = []
  let h = openH
  let m = openM
  while (h < closeH || (h === closeH && m <= closeM - SLOT_STEP_MIN)) {
    const slotDate = new Date(year, month - 1, dayNum, h, m)
    const localIso = `${year}-${pad(month)}-${pad(dayNum)}T${pad(h)}:${pad(m)}`
    const inPast = firstAllowed ? slotDate.getTime() < firstAllowed.getTime() : false
    slots.push({ localIso, label: `${pad(h)}:${pad(m)}`, hour: h, inPast })
    m += SLOT_STEP_MIN
    if (m >= 60) {
      m -= 60
      h += 1
    }
  }
  return slots
}

/** Разделяем слоты на «Утро / День / Вечер». */
export function groupSlotsByPeriod(slots: TimeSlot[]) {
  const morning = slots.filter((s) => s.hour < 12)
  const day = slots.filter((s) => s.hour >= 12 && s.hour < 18)
  const evening = slots.filter((s) => s.hour >= 18)
  return { morning, day, evening }
}

/**
 * Конвертирует «YYYY-MM-DDTHH:mm» (локальная TZ устройства) в ISO 8601 UTC,
 * который ждёт бэк. Собираем Date из компонентов — без зависимости от того,
 * как движок парсит строку без таймзоны.
 */
export function localIsoToUtcIso(localIso: string): string {
  const [datePart, timePart] = localIso.split('T')
  const [y, mo, d] = datePart.split('-').map((s) => Number(s))
  const [h, mi] = (timePart ?? '00:00').split(':').map((s) => Number(s))
  return new Date(y, mo - 1, d, h, mi).toISOString()
}

/** Лейбл дня для ленты: `{ weekday: 'ПН', date: '24 апр' }`. */
export function dayShortLabel(day: StationScheduleDay): { weekday: string; date: string } {
  const [y, m, d] = day.date.split('-').map((s) => Number(s))
  const dt = new Date(y, m - 1, d)
  const weekday = format(dt, 'EEEEEE', { locale: ru }).toUpperCase()
  const date = format(dt, 'd MMM', { locale: ru })
  return { weekday, date }
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}
