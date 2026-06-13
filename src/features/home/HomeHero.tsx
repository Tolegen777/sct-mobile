/**
 * Тёмный hero главной — RN-порт features/home/HomeHero.tsx.
 * Гость: маркетинг + Регистрация/Вход. Авторизованный: приветствие по имени +
 * CTA (записаться/добавить авто/услуги в зависимости от hasCars).
 * Декоративные фото-заглушки веба опущены.
 */
import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/features/auth/store'

export function HomeHero({ hasCars }: { hasCars: boolean }) {
  const router = useRouter()
  const phase = useAuthStore((s) => s.phase)
  const profile = useAuthStore((s) => s.profile)
  const isAuthed = phase === 'authed'

  if (!isAuthed) {
    return (
      <View className="overflow-hidden rounded-sct-lg bg-navy p-6">
        <View className="self-start rounded-full bg-white/10 px-4 py-1.5">
          <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[10px] uppercase tracking-widest text-white/80">
            Официальный автосервис
          </Text>
        </View>
        <Text style={{ fontFamily: 'Inter_900Black' }} className="mt-5 text-3xl uppercase leading-tight text-white">
          Премиальное обслуживание вашего автомобиля
        </Text>
        <Text className="mt-4 text-sm leading-relaxed text-white/70">
          Прозрачные цены, гарантия на все виды работ и персональный подход. Зарегистрируйтесь, добавьте авто и получите доступ к акциям и онлайн-записи.
        </Text>
        <View className="mt-8 gap-3">
          <HeroButton label="Зарегистрироваться" tone="yellow" onPress={() => router.push('/register')} />
          <HeroButton label="Войти по номеру" tone="translucent" onPress={() => router.push('/login')} />
        </View>
      </View>
    )
  }

  const firstName = profile?.first_name?.trim()
  const title = firstName
    ? `${firstName.toUpperCase()}, ВАШ АВТОМОБИЛЬ ГОТОВ К СЕРВИСУ`
    : 'ВАШ АВТОМОБИЛЬ ГОТОВ К СЕРВИСУ'

  return (
    <View className="overflow-hidden rounded-sct-lg bg-navy p-6">
      <Text style={{ fontFamily: 'Inter_900Black' }} className="text-2xl uppercase leading-tight text-white">
        {title}
      </Text>
      <Text className="mt-4 text-sm leading-relaxed text-white/70">
        Мы подобрали актуальные пакеты, акции и ближайшие слоты обслуживания для вашего автомобиля.
      </Text>
      <View className="mt-7 flex-row flex-wrap gap-3">
        {hasCars ? (
          <>
            <HeroButton label="Записаться на сервис" tone="light" onPress={() => router.push('/services')} />
            <HeroButton label="Добавить авто" tone="translucent" onPress={() => router.push('/garage/add')} />
          </>
        ) : (
          <>
            <HeroButton label="Добавить авто" tone="light" onPress={() => router.push('/garage/add')} />
            <HeroButton label="Все услуги" tone="translucent" onPress={() => router.push('/services')} />
          </>
        )}
      </View>
    </View>
  )
}

function HeroButton({
  label,
  tone,
  onPress,
}: {
  label: string
  tone: 'light' | 'translucent' | 'yellow'
  onPress: () => void
}) {
  const box =
    tone === 'light'
      ? 'bg-white'
      : tone === 'yellow'
        ? 'bg-brandYellow'
        : 'border border-white/20 bg-white/10'
  const text = tone === 'translucent' ? 'text-white' : 'text-textPrimary'
  return (
    <Pressable onPress={onPress} className={`items-center rounded-sct px-5 py-3 active:opacity-90 ${box}`}>
      <Text style={{ fontFamily: 'Inter_900Black' }} className={`text-[11px] uppercase tracking-widest ${text}`}>
        {label}
      </Text>
    </Pressable>
  )
}
