/**
 * Лендинг услуги-категории (RN-порт pages/ServiceInfoPage.tsx).
 *
 * Публичная статическая страница по коду категории — без API (бэк отдаёт
 * только пакеты внутри категории, без описания самой категории). Заголовок
 * маппим по коду; остальной контент — маркетинговая статика. CTA → /services.
 */
import { type ReactNode } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'

const CATEGORY_TITLES: Record<string, string> = {
  engine_oil: 'Замена масла в двигателе',
  transmission_oil: 'Замена масла в АКПП',
  brake: 'Тормозная система',
  brakes: 'Тормозная система',
  maintenance: 'Техническое обслуживание',
  diagnostics: 'Диагностика ходовой',
  suspension: 'Диагностика ходовой',
  tire: 'Шиномонтаж',
  tires: 'Шиномонтаж',
}

const INCLUDES = [
  { title: 'Диагностика и осмотр', desc: 'Проверяем узлы и подбираем оптимальный объём работ под ваше авто.' },
  { title: 'Оригинальные расходники', desc: 'Используем сертифицированные материалы и проверенные бренды.' },
  { title: 'Работа мастеров', desc: 'Обслуживание по регламенту производителя на профессиональном оборудовании.' },
  { title: 'Запись в книжку', desc: 'Фиксируем выполненные работы в вашей электронной сервисной книжке.' },
]

const BENEFITS = [
  'Официальная гарантия на все работы и запчасти.',
  'Прозрачная фиксированная цена пакета без доплат.',
  'Экономия времени — запись онлайн в пару кликов.',
  'Контроль состояния авто и напоминания о ТО.',
]

const STEPS = [
  { title: 'Онлайн-запись', desc: 'Выбираете филиал, дату и удобное время.' },
  { title: 'Приёмка авто', desc: 'Мастер принимает автомобиль и подтверждает состав работ.' },
  { title: 'Выполнение работ', desc: 'Проводим обслуживание с оригинальными материалами.' },
  { title: 'Выдача и отчёт', desc: 'Возвращаем авто и фиксируем работы в книжке.' },
]

export default function ServiceInfoScreen() {
  const router = useRouter()
  const { code } = useLocalSearchParams<{ code: string }>()
  const title = (code && CATEGORY_TITLES[code]) || 'Обслуживание автомобиля'

  return (
    <View className="flex-1 bg-surfaceLight">
      <Stack.Screen options={{ headerShown: true, title: 'Об услуге' }} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 40 }}>
        {/* Hero */}
        <View className="overflow-hidden rounded-sct-lg bg-navy p-6">
          <View className="self-start rounded-full bg-white/10 px-4 py-1.5">
            <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[10px] uppercase tracking-widest text-white/80">
              Услуга
            </Text>
          </View>
          <Text style={{ fontFamily: 'Inter_900Black' }} className="mt-4 text-3xl uppercase leading-none text-white">
            {title}
          </Text>
          <Text className="mt-4 text-sm leading-relaxed text-white/70">
            Качественное и своевременное обслуживание напрямую влияет на ресурс, безопасность и
            стоимость вашего автомобиля.
          </Text>
          <View className="mt-6 self-start">
            <Button variant="secondary" size="lg" onPress={() => router.push('/services')}>
              Подобрать пакет
            </Button>
          </View>
        </View>

        {/* Что включает */}
        <View className="gap-4">
          <SectionTitle>Что обычно включает услуга</SectionTitle>
          {INCLUDES.map((c) => (
            <Card key={c.title} className="p-5">
              <Text style={{ fontFamily: 'Inter_900Black' }} className="text-sm uppercase tracking-tight text-textPrimary">
                {c.title}
              </Text>
              <Text className="mt-2 text-[13px] leading-relaxed text-textSecondary">{c.desc}</Text>
            </Card>
          ))}
        </View>

        {/* Что получает клиент */}
        <View className="gap-3">
          <SectionTitle>Что получает клиент</SectionTitle>
          {BENEFITS.map((b) => (
            <View key={b} className="flex-row items-start gap-3 rounded-sct border border-borderLight bg-white p-4">
              <Ionicons name="checkmark-circle" size={18} color="#1F5FAF" style={{ marginTop: 1 }} />
              <Text style={{ fontFamily: 'Inter_500Medium' }} className="flex-1 text-sm text-textPrimary">{b}</Text>
            </View>
          ))}
        </View>

        {/* Почему стоимость разная */}
        <View className="gap-3">
          <SectionTitle>Почему стоимость разная</SectionTitle>
          <Card className="p-5">
            <Text className="text-sm leading-relaxed text-textSecondary">
              Итоговая цена зависит от модели и модификации автомобиля, объёма и типа расходников,
              состояния узлов и выбранного пакета. Поэтому мы рассчитываем стоимость под конкретное
              авто — без скрытых платежей и доплат на месте.
            </Text>
          </Card>
        </View>

        {/* Как проходит */}
        <View className="gap-4">
          <SectionTitle>Как проходит обслуживание</SectionTitle>
          {STEPS.map((step, i) => (
            <Card key={step.title} className="p-5">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-brandBlue">
                <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[12px] text-white">{i + 1}</Text>
              </View>
              <Text style={{ fontFamily: 'Inter_900Black' }} className="mt-3 text-sm uppercase tracking-tight text-textPrimary">
                {step.title}
              </Text>
              <Text className="mt-1 text-[13px] leading-relaxed text-textSecondary">{step.desc}</Text>
            </Card>
          ))}
        </View>

        {/* CTA */}
        <View className="overflow-hidden rounded-sct-lg bg-navy p-6">
          <Text style={{ fontFamily: 'Inter_900Black' }} className="text-xl uppercase leading-tight text-white">
            Отправьте данные автомобиля и получите точный расчёт
          </Text>
          <Text className="mt-2 text-sm text-white/70">
            Добавьте авто в гараж — подберём пакеты с актуальными ценами под вашу модификацию.
          </Text>
          <View className="mt-5 self-start">
            <Button variant="secondary" size="lg" onPress={() => router.push('/services')}>
              Подобрать пакет
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text style={{ fontFamily: 'Inter_900Black' }} className="text-xl uppercase tracking-tight text-textPrimary">
      {children}
    </Text>
  )
}
