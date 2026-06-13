/**
 * Inputs с маской `+7 (XXX) XXX-XX-XX` (RN-порт shared/ui/PhoneInput.tsx).
 * Controlled: value (маскированный) + onChange(value). Маска через
 * formatPhoneInput (перенесён из веба). На submit — unformatPhone().
 *
 * С RHF — через Controller (как в вебе):
 *   <Controller name="phone" control={control} render={({ field }) => (
 *     <PhoneInput value={field.value} onChange={field.onChange} error={...} />
 *   )} />
 */
import { forwardRef, useCallback } from 'react'
import { type TextInput } from 'react-native'
import { Input, type InputProps } from './Input'
import { formatPhoneInput } from '@/shared/lib/phone'

export interface PhoneInputProps
  extends Omit<InputProps, 'value' | 'onChange' | 'onChangeText'> {
  value: string
  onChange: (value: string) => void
}

export const PhoneInput = forwardRef<TextInput, PhoneInputProps>(function PhoneInput(
  { value, onChange, ...rest },
  ref,
) {
  const handleChange = useCallback(
    (text: string) => onChange(formatPhoneInput(text)),
    [onChange],
  )

  return (
    <Input
      ref={ref}
      keyboardType="phone-pad"
      autoComplete="tel"
      placeholder="+7 (___) ___-__-__"
      value={value}
      onChangeText={handleChange}
      {...rest}
    />
  )
})
