/**
 * Экран регистрации — РАБОЧИЙ порт features/auth/RegisterModal.tsx.
 * Одно поле «Имя» → split на first_name/last_name (бэк ждёт раздельно).
 * Ядро (registerClient, registerSchema, splitFullName) переиспользовано из веба.
 */
import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { PhoneInput } from '@/shared/ui/PhoneInput'
import { useAuthStore } from '@/features/auth/store'
import { registerClient } from '@/features/auth/api'
import { registerSchema, splitFullName, type RegisterFormValues } from '@/features/auth/schemas'
import { parseApiError } from '@/features/auth/errors'
import { unformatPhone } from '@/shared/lib/phone'

const KNOWN_FIELDS = ['first_name', 'last_name', 'full_name', 'phone', 'password', 'password_confirm']

export default function RegisterScreen() {
  const router = useRouter()
  const setSession = useAuthStore((s) => s.setSession)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: '', phone: '', password: '', password_confirm: '' },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null)
    try {
      const { first_name, last_name } = splitFullName(values.full_name)
      const data = await registerClient({
        first_name,
        last_name,
        phone: unformatPhone(values.phone),
        password: values.password,
      })
      if (!data.user) {
        setServerError('Сервер не вернул профиль клиента.')
        return
      }
      setSession(data.access, data.refresh, data.user)
      if (router.canGoBack()) router.back()
      else router.replace('/')
    } catch (err) {
      const parsed = parseApiError(err, 'Не удалось зарегистрироваться.')
      for (const [field, message] of Object.entries(parsed.fields)) {
        if (field === 'first_name' || field === 'last_name' || field === 'full_name') {
          setError('full_name', { type: 'server', message })
        } else if (field === 'phone' || field === 'password' || field === 'password_confirm') {
          setError(field, { type: 'server', message })
        }
      }
      const allMapped = Object.keys(parsed.fields).every((f) => KNOWN_FIELDS.includes(f))
      if (parsed.general || !allMapped) setServerError(parsed.general)
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 20, gap: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="items-center gap-1">
        <Text style={{ fontFamily: 'Inter_900Black' }} className="text-2xl uppercase text-textPrimary">
          Регистрация
        </Text>
        <Text className="text-textSecondary">Регистрация строго по номеру телефона</Text>
      </View>

      <Controller
        control={control}
        name="full_name"
        render={({ field }) => (
          <Input
            label="Имя"
            placeholder="Иван"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.full_name?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <PhoneInput
            label="Номер телефона"
            value={field.value}
            onChange={field.onChange}
            error={errors.phone?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <Input
            label="Пароль"
            placeholder="Минимум 8 символов"
            secureTextEntry
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.password?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password_confirm"
        render={({ field }) => (
          <Input
            label="Подтвердите пароль"
            placeholder="Повторите пароль"
            secureTextEntry
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.password_confirm?.message}
          />
        )}
      />

      {serverError ? (
        <View className="rounded-sct border border-red-200 bg-red-50 p-3">
          <Text className="text-red-700">{serverError}</Text>
        </View>
      ) : null}

      <Button fullWidth size="lg" loading={isSubmitting} onPress={handleSubmit(onSubmit)}>
        Зарегистрироваться
      </Button>

      <View className="flex-row justify-center gap-1 pt-2">
        <Text className="text-textSecondary">Уже зарегистрированы?</Text>
        <Pressable onPress={() => router.replace('/login')}>
          <Text style={{ fontFamily: 'Inter_900Black' }} className="uppercase text-brandBlue">
            Войти
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}
