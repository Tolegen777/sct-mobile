/**
 * 404-роут Expo Router — открывается на неизвестных путях и битых deep link'ах.
 */
import { Link, Stack } from 'expo-router'
import { Text, View } from 'react-native'

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surfaceLight p-6">
      <Stack.Screen options={{ title: 'Не найдено' }} />
      <Text style={{ fontFamily: 'Inter_900Black' }} className="text-2xl uppercase text-textPrimary">
        Страница не найдена
      </Text>
      <Text className="mt-2 text-center text-sm text-textSecondary">
        Похоже, такой страницы нет или ссылка устарела.
      </Text>
      <View className="mt-6">
        <Link href="/">
          <Text style={{ fontFamily: 'Inter_900Black' }} className="uppercase text-brandBlue">
            На главную
          </Text>
        </Link>
      </View>
    </View>
  )
}
