/**
 * Плашка рекомендации сервиса — RN-порт features/service-book/
 * RecommendationStrip.tsx. Нет рекомендации → не рендерим.
 */
import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '@/shared/ui/Card'
import { formatMileage } from '@/shared/lib/format'
import type { EngineOilRecommendation } from './types'

export function RecommendationStrip({
  recommendation,
}: {
  recommendation: EngineOilRecommendation | null | undefined
}) {
  if (!recommendation || recommendation.next_service_mileage_km == null) return null

  return (
    <Card className="flex-row items-center justify-between gap-4 border-blue-100 bg-blue-50 px-5 py-4">
      <View className="flex-1 flex-row items-center gap-4">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-brandBlue/10">
          <Ionicons name="information-circle-outline" size={20} color="#1F5FAF" />
        </View>
        <View className="flex-1">
          <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[10px] uppercase tracking-widest text-brandBlue">
            {recommendation.title || 'Рекомендация сервиса'}
          </Text>
          <Text style={{ fontFamily: 'Inter_700Bold' }} className="mt-0.5 text-[12px] uppercase text-textSecondary">
            Следующая замена масла в ДВС
          </Text>
          {recommendation.last_service_mileage_km != null ? (
            <Text className="mt-0.5 text-[10px] text-textSecondary">
              последняя — {formatMileage(recommendation.last_service_mileage_km)}
            </Text>
          ) : null}
        </View>
      </View>
      <Text style={{ fontFamily: 'Inter_900Black' }} className="text-xl text-brandBlue">
        {formatMileage(recommendation.next_service_mileage_km)}
      </Text>
    </Card>
  )
}
