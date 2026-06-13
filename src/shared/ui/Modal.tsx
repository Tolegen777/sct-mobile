/**
 * Модалка (RN-порт shared/ui/Modal.tsx). Наружный API зеркалит веб
 * (open/onClose/title/disableOverlayClose), внутри — нативный RN Modal:
 * затемнение + центр-карточка, тап по фону закрывает (если не disabled).
 *
 * size из веба (max-width) опущен — на телефоне всегда near-full-width.
 */
import { type ReactNode } from 'react'
import { Modal as RNModal, Pressable, ScrollView, Text, View } from 'react-native'
import { cn } from '@/shared/lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  disableOverlayClose?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  disableOverlayClose,
}: ModalProps) {
  return (
    <RNModal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-textPrimary/80 p-4"
        onPress={() => {
          if (!disableOverlayClose) onClose()
        }}
      >
        {/* вложенный Pressable перехватывает тап → не закрывает по фону */}
        <Pressable
          className={cn('max-h-[85%] w-full max-w-md overflow-hidden rounded-sct-xl bg-white', className)}
          onPress={() => {}}
        >
          <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
            <View className="mb-4 flex-row items-start justify-between gap-2">
              {title ? (
                <Text
                  style={{ fontFamily: 'Inter_900Black' }}
                  className="flex-1 text-2xl uppercase text-textPrimary"
                >
                  {title}
                </Text>
              ) : (
                <View className="flex-1" />
              )}
              <Pressable
                onPress={onClose}
                hitSlop={8}
                className="h-8 w-8 items-center justify-center rounded-lg bg-surfaceLight"
              >
                <Text className="text-base text-textSecondary">✕</Text>
              </Pressable>
            </View>
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </RNModal>
  )
}
