/**
 * Список услуг для активного авто — порт pages/ServicesPage.tsx.
 * Первый экран с загрузкой данных: использует перенесённый usePackagesQuery
 * (TanStack Query → http → SecureStore-токены → реальный бэк).
 *
 * Состояния как в вебе: гость → GuestPrompt; loading → Skeleton; error → retry;
 * нет активного авто → CTA «Добавить авто»; пусто → плашка. Иначе — секции
 * Акции / Спецпредложения / Все услуги / Индивидуальный расчёт.
 *
 * Упрощения относительно веба: карусель → горизонтальный ScrollView,
 * PromoCard → ServiceCard, PackageOptionsModal опущена (карточка ведёт сразу
 * на детальную пакета). См. PORTING_STATUS.md.
 */
import { useMemo, type ReactNode } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { usePackagesQuery } from '@/features/packages/queries'
import { ActiveCarStrip } from '@/features/packages/ActiveCarStrip'
import { ServiceCard } from '@/features/packages/ServiceCard'
import { DefaultServiceCard } from '@/features/packages/DefaultServiceCard'
import { GuestPrompt } from '@/features/auth/GuestPrompt'
import { useAuthStore } from '@/features/auth/store'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'

export default function ServicesScreen() {
  const router = useRouter()
  const isAuthed = useAuthStore((s) => s.phase === 'authed')
  const { data, isLoading, isError, refetch } = usePackagesQuery()

  const { specials, regulars } = useMemo(() => {
    const all = data?.regular_packages ?? []
    return {
      specials: all.filter((p) => p.is_featured),
      regulars: all.filter((p) => !p.is_featured),
    }
  }, [data])

  if (!isAuthed) {
    return (
      <GuestPrompt
        title="Услуги доступны после регистрации"
        description="Пакеты обслуживания подбираются под конкретную модификацию вашего авто. Зарегистрируйтесь — за пару минут добавите машину и увидите подходящие пакеты."
      />
    )
  }

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-surfaceLight" contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Skeleton.Box className="h-20 w-full" />
        <Skeleton.Box className="h-6 w-32" />
        <Skeleton.Card className="h-44" />
        <Skeleton.Card className="h-44" />
      </ScrollView>
    )
  }

  if (isError || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-surfaceLight p-6">
        <Card className="w-full items-center p-6">
          <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-red-700">
            Не удалось загрузить услуги.
          </Text>
          <View className="mt-4">
            <Button variant="secondary" size="sm" onPress={() => refetch()}>
              Повторить
            </Button>
          </View>
        </Card>
      </View>
    )
  }

  if (!data.active_car) {
    return (
      <View className="flex-1 items-center justify-center bg-surfaceLight p-6">
        <Card className="w-full items-center border-2 border-dashed border-borderLight p-8">
          <Text
            style={{ fontFamily: 'Inter_900Black' }}
            className="text-center text-2xl uppercase text-textPrimary"
          >
            Сначала добавьте автомобиль
          </Text>
          <Text className="mt-3 text-center text-sm text-textSecondary">
            Пакеты услуг подбираются под конкретную модификацию вашего авто. Добавьте машину — и увидите доступные пакеты.
          </Text>
          <View className="mt-8">
            <Button variant="dark" size="lg" onPress={() => router.push('/garage/add')}>
              Добавить автомобиль
            </Button>
          </View>
        </Card>
      </View>
    )
  }

  const allEmpty =
    data.promotional_packages.length === 0 &&
    data.regular_packages.length === 0 &&
    (data.default_services?.length ?? 0) === 0

  return (
    <ScrollView className="flex-1 bg-surfaceLight" contentContainerStyle={{ padding: 16, gap: 24 }}>
      <ActiveCarStrip activeCar={data.active_car} />

      {allEmpty ? (
        <Card className="p-8">
          <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-center text-textSecondary">
            Для этой модификации пока нет опубликованных пакетов.
          </Text>
          <Text className="mt-2 text-center text-sm text-textSecondary">
            Зайдите позже или выберите другое авто в гараже.
          </Text>
        </Card>
      ) : null}

      {data.promotional_packages.length > 0 ? (
        <Section title="Акции" accent="yellow">
          <HScroll>
            {data.promotional_packages.map((p) => (
              <View key={p.id} className="w-64">
                <ServiceCard pkg={p} />
              </View>
            ))}
          </HScroll>
        </Section>
      ) : null}

      {specials.length > 0 ? (
        <Section title="Спецпредложения" accent="yellow">
          <HScroll>
            {specials.map((p) => (
              <View key={p.id} className="w-64">
                <ServiceCard pkg={p} />
              </View>
            ))}
          </HScroll>
        </Section>
      ) : null}

      {regulars.length > 0 ? (
        <Section title="Все услуги" accent="blue">
          <View className="gap-4">
            {regulars.map((p) => (
              <ServiceCard key={p.id} pkg={p} />
            ))}
          </View>
        </Section>
      ) : null}

      {(data.default_services?.length ?? 0) > 0 ? (
        <Section title="Услуги с индивидуальным расчётом" accent="blue">
          <View className="gap-4">
            {data.default_services!.map((s) => (
              <DefaultServiceCard key={s.id} service={s} />
            ))}
          </View>
        </Section>
      ) : null}
    </ScrollView>
  )
}

function Section({
  title,
  accent,
  children,
}: {
  title: string
  accent: 'yellow' | 'blue'
  children: ReactNode
}) {
  return (
    <View className="gap-4">
      <View>
        <View className={`mb-2 h-1 w-10 rounded-full ${accent === 'yellow' ? 'bg-brandYellow' : 'bg-brandBlue'}`} />
        <Text style={{ fontFamily: 'Inter_900Black' }} className="text-xl uppercase text-textPrimary">
          {title}
        </Text>
      </View>
      {children}
    </View>
  )
}

function HScroll({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 16, paddingRight: 8 }}
    >
      {children}
    </ScrollView>
  )
}
