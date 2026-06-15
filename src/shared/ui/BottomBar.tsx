/**
 * Липкая нижняя панель действий (кнопки/цена), приклеенная к низу экрана.
 *
 * Главное — учитывает нижнюю safe-area (зона home-indicator), иначе на
 * устройствах с индикатором кнопка прижимается к самому краю. Заменяет
 * повторяющийся `<View className="border-t ... px-4 py-3">` на стек-экранах.
 */
import { type ReactNode } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@/shared/lib/cn'

export function BottomBar({ children, className }: { children: ReactNode; className?: string }) {
  const insets = useSafeAreaInsets()
  return (
    <View
      style={{ paddingBottom: insets.bottom + 12 }}
      className={cn('border-t border-borderLight bg-white px-4 pt-3', className)}
    >
      {children}
    </View>
  )
}
