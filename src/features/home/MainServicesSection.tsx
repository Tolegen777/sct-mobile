/**
 * «Наши основные услуги» на гостевой главной — RN-порт
 * features/home/MainServicesSection.tsx. Статический контент, ссылки → /services.
 */
import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const SERVICES: { title: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { title: 'Замена масла и жидкостей', desc: 'Моторное масло, АКПП, антифриз и тормозная жидкость.', icon: 'water-outline' },
  { title: 'Техническое обслуживание', desc: 'Регламентное ТО, замена фильтров, свечей зажигания.', icon: 'cog-outline' },
  { title: 'Диагностика ходовой', desc: 'Проверка подвески, рулевого управления и амортизаторов.', icon: 'eye-outline' },
  { title: 'Тормозная система', desc: 'Замена колодок, дисков, обслуживание суппортов.', icon: 'flash-outline' },
]

export function MainServicesSection() {
  const router = useRouter()
  return (
    <View className="gap-4">
      <View>
        <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[11px] uppercase tracking-widest text-brandBlue">
          Направления
        </Text>
        <Text style={{ fontFamily: 'Inter_900Black' }} className="mt-1 text-2xl uppercase text-textPrimary">
          Наши основные услуги
        </Text>
      </View>

      {SERVICES.map((s) => (
        <Pressable
          key={s.title}
          onPress={() => router.push('/services')}
          className="rounded-sct border border-borderLight bg-white p-6 active:opacity-90"
        >
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-surfaceMuted">
            <Ionicons name={s.icon} size={22} color="#18202A" />
          </View>
          <Text style={{ fontFamily: 'Inter_900Black' }} className="mt-5 text-base uppercase leading-tight text-textPrimary">
            {s.title}
          </Text>
          <Text className="mt-2 text-sm leading-relaxed text-textSecondary">{s.desc}</Text>
          <View className="mt-5 flex-row items-center gap-2 border-t border-borderLight pt-4">
            <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[11px] uppercase tracking-widest text-brandBlue">
              Узнать цену
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#1F5FAF" />
          </View>
        </Pressable>
      ))}
    </View>
  )
}
