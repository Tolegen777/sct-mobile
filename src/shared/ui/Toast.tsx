/**
 * Минимальная toast-система (RN-порт shared/ui/Toast.tsx).
 *
 * Использование (как в вебе):
 *   import { toast } from '@/shared/ui/Toast'
 *   toast.success('Сохранено')
 *   toast.error('Не удалось загрузить')
 *
 * Глобальный pub/sub + объект `toast` переносятся дословно (чистый JS).
 * Отличие от веба: вместо portal в document.body — <ToastViewport/>
 * монтируется один раз в app/_layout.tsx и рисует тосты абсолютным оверлеем
 * снизу (Animated fade/slide, авто-скрытие по duration, тап — закрыть).
 */
import { useCallback, useEffect, useRef, useState, type ComponentProps } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { cn } from '@/shared/lib/cn'

export type ToastTone = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: number
  tone: ToastTone
  message: string
  duration: number
}

// Глобальный pub/sub — позволяет звать `toast.success(...)` из любого места,
// без проброса контекста.
type Subscriber = (item: ToastItem) => void
const subscribers = new Set<Subscriber>()
let nextId = 1

function publish(tone: ToastTone, message: string, duration = 3500) {
  const item: ToastItem = { id: nextId++, tone, message, duration }
  subscribers.forEach((s) => s(item))
}

export const toast = {
  show: (tone: ToastTone, message: string, opts?: { duration?: number }) =>
    publish(tone, message, opts?.duration),
  success: (message: string, opts?: { duration?: number }) =>
    publish('success', message, opts?.duration),
  error: (message: string, opts?: { duration?: number }) =>
    publish('error', message, opts?.duration ?? 5000),
  info: (message: string, opts?: { duration?: number }) =>
    publish('info', message, opts?.duration),
  warning: (message: string, opts?: { duration?: number }) =>
    publish('warning', message, opts?.duration ?? 5000),
}

type IoniconName = ComponentProps<typeof Ionicons>['name']

const TONES: Record<ToastTone, { box: string; text: string; icon: IoniconName; color: string }> = {
  success: { box: 'border-green-200 bg-green-50', text: 'text-green-800', icon: 'checkmark-circle', color: '#15803D' },
  error: { box: 'border-red-200 bg-red-50', text: 'text-red-800', icon: 'close-circle', color: '#B91C1C' },
  info: { box: 'border-blue-200 bg-blue-50', text: 'text-brandBlueDark', icon: 'information-circle', color: '#184A88' },
  warning: { box: 'border-amber-200 bg-amber-50', text: 'text-amber-800', icon: 'warning', color: '#B45309' },
}

/**
 * Viewport — слушает pub/sub и рисует активные тосты. Монтируется один раз
 * в корне (app/_layout.tsx), внутри SafeAreaProvider.
 */
export function ToastViewport() {
  const insets = useSafeAreaInsets()
  const [items, setItems] = useState<ToastItem[]>([])
  const timeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    const t = timeouts.current.get(id)
    if (t) {
      clearTimeout(t)
      timeouts.current.delete(id)
    }
  }, [])

  useEffect(() => {
    const sub: Subscriber = (item) => {
      setItems((prev) => [...prev, item])
      const t = setTimeout(() => remove(item.id), item.duration)
      timeouts.current.set(item.id, t)
    }
    subscribers.add(sub)
    return () => {
      subscribers.delete(sub)
    }
  }, [remove])

  // Чистим таймеры при unmount.
  useEffect(() => {
    const map = timeouts.current
    return () => {
      map.forEach((t) => clearTimeout(t))
      map.clear()
    }
  }, [])

  if (items.length === 0) return null

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 16, paddingHorizontal: 16 }}
    >
      <View pointerEvents="box-none" className="gap-2">
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onClose={() => remove(item.id)} />
        ))}
      </View>
    </View>
  )
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const anim = useRef(new Animated.Value(0)).current
  const tone = TONES[item.tone]

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: true }).start()
  }, [anim])

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
      }}
    >
      <Pressable
        onPress={onClose}
        className={cn('flex-row items-start gap-3 rounded-sct border bg-white p-4', tone.box)}
      >
        <Ionicons name={tone.icon} size={18} color={tone.color} style={{ marginTop: 1 }} />
        <Text style={{ fontFamily: 'Inter_500Medium' }} className={cn('flex-1 text-sm leading-snug', tone.text)}>
          {item.message}
        </Text>
        <Ionicons name="close" size={16} color={tone.color} style={{ marginTop: 1, opacity: 0.6 }} />
      </Pressable>
    </Animated.View>
  )
}
