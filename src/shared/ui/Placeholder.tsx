/**
 * Временная заглушка экрана. Каждый стаб роутера ссылается на свой
 * веб-источник — порт делается по MOBILE_PORTING_GUIDE.md §6/§9.
 * После реализации экрана компонент удаляется.
 */
import { ScrollView, Text, View } from 'react-native'

export function Placeholder({
  title,
  source,
  note,
}: {
  title: string
  source: string
  note?: string
}) {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 20, gap: 14 }}
    >
      <Text style={{ fontFamily: 'Inter_900Black' }} className="text-2xl text-textPrimary">
        {title}
      </Text>
      <Text className="text-textSecondary">
        Экран-заглушка. View переносим из веба по гайду.
      </Text>

      <View className="rounded-sct bg-surfaceLight p-4">
        <Text className="text-[11px] uppercase tracking-widest text-textSecondary">
          Источник в sct-web
        </Text>
        <Text style={{ fontFamily: 'Inter_700Bold' }} className="mt-1 text-textPrimary">
          {source}
        </Text>
      </View>

      {note ? <Text className="text-textSecondary">{note}</Text> : null}

      <Text className="text-xs text-textSecondary">
        Подробности: ../sct-web/MOBILE_PORTING_GUIDE.md
      </Text>
    </ScrollView>
  )
}
