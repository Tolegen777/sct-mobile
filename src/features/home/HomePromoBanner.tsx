/**
 * Промо-баннер главной — RN-порт features/home/HomePromoBanner.tsx.
 * Гость: оффер «−20% первое обслуживание». Авторизованный: акция месяца с
 * живым обратным отсчётом до конца месяца. Градиент веба → сплошной brandBlue.
 */
import { useEffect, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/features/auth/store'

const PROMO_END_ISO = endOfCurrentMonthISO()

export function HomePromoBanner() {
  const phase = useAuthStore((s) => s.phase)
  return phase !== 'authed' ? <GuestPromoBanner /> : <CountdownPromoBanner />
}

function GuestPromoBanner() {
  const router = useRouter()
  return (
    <View className="overflow-hidden rounded-sct-lg bg-brandBlue p-7">
      <View className="self-start rounded-md bg-brandYellow px-3 py-1">
        <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[10px] uppercase tracking-widest text-textPrimary">
          Предложение для новых клиентов
        </Text>
      </View>
      <Text style={{ fontFamily: 'Inter_900Black' }} className="mt-4 text-2xl uppercase leading-tight text-white">
        Скидка 20% на первое обслуживание
      </Text>
      <Text className="mt-3 text-sm leading-relaxed text-white/80">
        Зарегистрируйтесь, добавьте автомобиль в гараж и забирайте персональную скидку на любой пакет регламентного ТО.
      </Text>
      <Pressable onPress={() => router.push('/register')} className="mt-6 self-start rounded-sct bg-white px-7 py-4 active:opacity-90">
        <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[12px] uppercase tracking-widest text-brandBlue">
          Забрать скидку
        </Text>
      </Pressable>
    </View>
  )
}

function CountdownPromoBanner() {
  const router = useRouter()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diffMs = useMemo(() => new Date(PROMO_END_ISO).getTime() - now, [now])
  if (diffMs <= 0) return null

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  return (
    <View className="overflow-hidden rounded-sct-lg bg-brandBlue p-6">
      <View className="self-start rounded-md bg-brandYellow px-2.5 py-1">
        <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[10px] uppercase tracking-widest text-textPrimary">
          Акция месяца
        </Text>
      </View>
      <Text style={{ fontFamily: 'Inter_900Black' }} className="mt-3 text-2xl uppercase leading-tight text-white">
        −20% на замену масла и фильтров
      </Text>
      <Text className="mt-3 text-sm leading-relaxed text-white/80">
        Для большинства авто доступен спец-пакет: масло, фильтр, диагностика и работа мастера.
      </Text>

      <View className="mt-5 rounded-sct-lg border border-white/10 bg-navy/60 p-4">
        <Text style={{ fontFamily: 'Inter_900Black' }} className="mb-3 text-center text-[10px] uppercase tracking-widest text-white/60">
          До конца акции
        </Text>
        <View className="flex-row items-end justify-around">
          <CountUnit value={days} label="дн" />
          <CountSep />
          <CountUnit value={hours} label="час" />
          <CountSep />
          <CountUnit value={minutes} label="мин" />
        </View>
      </View>

      <View className="mt-6 flex-row flex-wrap gap-3">
        <Pressable onPress={() => router.push('/services')} className="rounded-sct bg-white px-5 py-3 active:opacity-90">
          <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[11px] uppercase tracking-widest text-brandBlue">
            Забронировать акцию
          </Text>
        </Pressable>
        <Pressable onPress={() => router.push('/services')} className="rounded-sct border border-white/20 bg-white/10 px-5 py-3 active:opacity-90">
          <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[11px] uppercase tracking-widest text-white">
            Все акции
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <View className="items-center">
      <Text style={{ fontFamily: 'Inter_900Black' }} className="text-3xl text-white">
        {String(value).padStart(2, '0')}
      </Text>
      <Text style={{ fontFamily: 'Inter_700Bold' }} className="mt-1 text-[9px] uppercase tracking-widest text-white/50">
        {label}
      </Text>
    </View>
  )
}

function CountSep() {
  return <Text style={{ fontFamily: 'Inter_900Black' }} className="text-2xl text-white/30">:</Text>
}

function endOfCurrentMonthISO(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0).toISOString()
}
