/**
 * Переключатель (RN-порт shared/ui/Toggle.tsx) на базе нативного Switch.
 * Пропсы зеркалят веб: checked / onChange(boolean) / label / description.
 */
import { Switch, Text, View } from 'react-native'

interface ToggleProps {
  checked: boolean
  onChange: (value: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <View className="w-full flex-row items-center justify-between gap-4">
      <View className="flex-1">
        {label ? (
          <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-sm text-textPrimary">
            {label}
          </Text>
        ) : null}
        {description ? (
          <Text className="mt-0.5 text-xs text-textSecondary">{description}</Text>
        ) : null}
      </View>
      <Switch
        value={checked}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ true: '#1F5FAF', false: '#CBD5E1' }}
        thumbColor="#ffffff"
      />
    </View>
  )
}
