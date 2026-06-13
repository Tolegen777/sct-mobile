/**
 * Базовая карточка дизайн-системы SCT (RN-порт shared/ui/Card.tsx).
 * Белый фон + тонкая обводка. Тень в RN опущена (при желании — className
 * "shadow-sm" или style с shadow/elevation).
 */
import { View, type ViewProps } from 'react-native'
import { cn } from '@/shared/lib/cn'

export function Card({ className, ...rest }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn('rounded-sct-lg border border-borderLight bg-white', className)}
      {...rest}
    />
  )
}
