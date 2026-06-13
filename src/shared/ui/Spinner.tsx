import { ActivityIndicator, View } from 'react-native'

export function Spinner({ className }: { className?: string }) {
  return (
    <View className={className}>
      <ActivityIndicator color="#1F5FAF" />
    </View>
  )
}
