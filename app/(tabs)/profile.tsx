/**
 * Профиль — порт pages/ProfilePage.tsx (адаптирован под телефон: одна колонка).
 * Ядро переиспользовано: updateClientProfile, useAuthStore, parseApiError.
 *
 * ⚠️ Бэк (как и в вебе): PATCH /auth/profile/ отвечает 405 (BACKEND_NOTES §4.3) —
 * сохранение заработает после подключения ручки. Язык и тумблеры уведомлений —
 * локальные настройки (бэк их не хранит).
 */
import { useEffect, useState, type ReactNode } from 'react'
import { Alert, ScrollView, Text, View } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { RequireAuth } from '@/shared/ui/RequireAuth'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Toggle } from '@/shared/ui/Toggle'
import { Button } from '@/shared/ui/Button'
import { useAuthStore } from '@/features/auth/store'
import { updateClientProfile } from '@/features/auth/api'
import { parseApiError } from '@/features/auth/errors'
import { useAppLockStore } from '@/features/app-lock/store'
import { isBiometricAvailable } from '@/features/app-lock/biometrics'
import * as appLockStorage from '@/features/app-lock/storage'
import type { ClientProfile } from '@/shared/api/types'

const schema = z
  .object({
    first_name: z.string().max(150, 'Слишком длинно').optional().or(z.literal('')),
    last_name: z.string().max(150, 'Слишком длинно').optional().or(z.literal('')),
    email: z.string().email('Неверный формат email').optional().or(z.literal('')),
    new_password: z.string().optional().or(z.literal('')),
    confirm_password: z.string().optional().or(z.literal('')),
  })
  .refine((d) => !d.new_password || d.new_password.length >= 8, {
    message: 'Минимум 8 символов',
    path: ['new_password'],
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'Пароли не совпадают',
    path: ['confirm_password'],
  })

type FormValues = z.infer<typeof schema>

const STATUS_LABEL: Record<string, { text: string; ok: boolean }> = {
  ACTIVE: { text: 'Подтверждён по СМС', ok: true },
  INACTIVE: { text: 'Не подтверждён', ok: false },
  BLOCKED: { text: 'Заблокирован', ok: false },
  ARCHIVED: { text: 'В архиве', ok: false },
}

function initials(p: ClientProfile | null): string {
  if (!p) return '—'
  const f = p.first_name?.charAt(0) ?? ''
  const l = p.last_name?.charAt(0) ?? ''
  return (f + l).toUpperCase() || (p.phone?.slice(-2) ?? '—')
}

export default function ProfileScreen() {
  return (
    <RequireAuth>
      <ProfileForm />
    </RequireAuth>
  )
}

function ProfileForm() {
  const router = useRouter()
  const profile = useAuthStore((s) => s.profile)
  const setProfile = useAuthStore((s) => s.setProfile)
  const logout = useAuthStore((s) => s.logout)

  const [language, setLanguage] = useState('ru')
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const lockEnabled = useAppLockStore((s) => s.enabled)
  const biometricEnabled = useAppLockStore((s) => s.biometricEnabled)
  const [bioAvailable, setBioAvailable] = useState(false)

  useEffect(() => {
    void isBiometricAvailable().then(setBioAvailable)
  }, [])

  const onToggleLock = (next: boolean) => {
    if (next) {
      router.push('/app-lock/setup')
    } else {
      Alert.alert('Выключить код-пароль?', 'Вход без кода и Face ID.', [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выключить',
          style: 'destructive',
          onPress: async () => {
            await appLockStorage.clear()
            await useAppLockStore.getState().reloadConfig()
          },
        },
      ])
    }
  }

  const onToggleBiometric = async (next: boolean) => {
    if (next && !(await isBiometricAvailable())) return
    await appLockStorage.setBiometric(next)
    await useAppLockStore.getState().reloadConfig()
  }

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: profile?.first_name ?? '',
      last_name: profile?.last_name ?? '',
      email: profile?.email ?? '',
      new_password: '',
      confirm_password: '',
    },
  })

  const mutation = useMutation({
    mutationFn: updateClientProfile,
    onSuccess: (updated) => {
      setProfile(updated)
      setSaved(true)
      reset({
        first_name: updated.first_name ?? '',
        last_name: updated.last_name ?? '',
        email: updated.email ?? '',
        new_password: '',
        confirm_password: '',
      })
    },
    onError: (err) =>
      setServerError(parseApiError(err, 'Не удалось сохранить изменения.').general),
  })

  const onSubmit = handleSubmit((values) => {
    setServerError(null)
    setSaved(false)
    mutation.mutate({
      first_name: values.first_name?.trim() || '',
      last_name: values.last_name?.trim() || '',
      email: values.email?.trim() || null,
      ...(values.new_password ? { password: values.new_password } : {}),
    })
  })

  const handleLogout = () => {
    logout()
    router.replace('/')
  }

  if (!profile) return null

  const status = STATUS_LABEL[profile.status] ?? { text: profile.status, ok: false }
  const displayName =
    profile.full_name ||
    `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() ||
    'Клиент'

  return (
    <ScrollView className="flex-1 bg-surfaceLight" contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Карточка профиля */}
      <Card className="items-center p-6">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-brandBlue">
          <Text style={{ fontFamily: 'Inter_900Black' }} className="text-2xl text-white">
            {initials(profile)}
          </Text>
        </View>
        <Text style={{ fontFamily: 'Inter_900Black' }} className="mt-4 text-lg uppercase text-textPrimary">
          {displayName}
        </Text>
        {profile.phone ? <Text className="mt-1 text-sm text-textSecondary">{profile.phone}</Text> : null}

        <View className="mt-6 w-full rounded-sct border border-borderLight bg-surfaceLight p-4">
          <Text className="text-[10px] uppercase tracking-widest text-textSecondary">Статус профиля</Text>
          <View className="mt-1 flex-row items-center gap-2">
            <View className={`h-2 w-2 rounded-full ${status.ok ? 'bg-green-500' : 'bg-slate-400'}`} />
            <Text style={{ fontFamily: 'Inter_700Bold' }} className="uppercase text-textPrimary">
              {status.text}
            </Text>
          </View>
        </View>

        <View className="mt-4 w-full">
          <Button variant="danger" fullWidth onPress={handleLogout}>
            Выйти из системы
          </Button>
        </View>
      </Card>

      {/* Личные данные */}
      <Card className="gap-4 p-6">
        <SectionTitle>Личные данные</SectionTitle>
        <Controller control={control} name="first_name" render={({ field }) => (
          <Input label="Имя" value={field.value} onChangeText={field.onChange} error={errors.first_name?.message} />
        )} />
        <Controller control={control} name="last_name" render={({ field }) => (
          <Input label="Фамилия" value={field.value} onChangeText={field.onChange} error={errors.last_name?.message} />
        )} />
        <Input label="Номер телефона" value={profile.phone ?? ''} editable={false} />
        <Controller control={control} name="email" render={({ field }) => (
          <Input
            label="Электронная почта (email)"
            placeholder="client@sct.kz"
            keyboardType="email-address"
            autoCapitalize="none"
            value={field.value}
            onChangeText={field.onChange}
            error={errors.email?.message}
          />
        )} />
      </Card>

      {/* Настройки */}
      <Card className="gap-4 p-6">
        <SectionTitle>Настройки системы</SectionTitle>
        <Select
          label="Язык интерфейса"
          value={language}
          onChange={setLanguage}
          options={[
            { label: 'Русский (RU)', value: 'ru' },
            { label: 'Қазақша (KK)', value: 'kk' },
            { label: 'English (EN)', value: 'en' },
          ]}
        />
      </Card>

      {/* Уведомления */}
      <Card className="gap-3 p-6">
        <SectionTitle>Уведомления</SectionTitle>
        <View className="rounded-sct border border-borderLight bg-surfaceLight p-4">
          <Toggle
            checked={pushEnabled}
            onChange={setPushEnabled}
            label="Push-уведомления на телефон"
            description="Оповещения о готовности авто, записи и акциях"
          />
        </View>
        <View className="rounded-sct border border-borderLight bg-surfaceLight p-4">
          <Toggle
            checked={emailEnabled}
            onChange={setEmailEnabled}
            label="Уведомления на почту (email)"
            description="Электронные квитанции, акты и отчёты"
          />
        </View>
      </Card>

      {/* Защита входа */}
      <Card className="gap-3 p-6">
        <SectionTitle>Защита входа</SectionTitle>
        <View className="rounded-sct border border-borderLight bg-surfaceLight p-4">
          <Toggle
            checked={lockEnabled}
            onChange={onToggleLock}
            label="Код-пароль"
            description="Запрашивать 4-значный код при открытии приложения"
          />
        </View>
        {lockEnabled && bioAvailable ? (
          <View className="rounded-sct border border-borderLight bg-surfaceLight p-4">
            <Toggle
              checked={biometricEnabled}
              onChange={onToggleBiometric}
              label="Face ID / Touch ID"
              description="Быстрый вход по биометрии вместо кода"
            />
          </View>
        ) : null}
        {lockEnabled ? (
          <Button variant="secondary" fullWidth onPress={() => router.push('/app-lock/setup')}>
            Сменить код
          </Button>
        ) : null}
      </Card>

      {/* Безопасность */}
      <Card className="gap-4 p-6">
        <SectionTitle>Безопасность</SectionTitle>
        <Controller control={control} name="new_password" render={({ field }) => (
          <Input
            label="Новый пароль"
            placeholder="Заполните для изменения"
            secureTextEntry
            value={field.value}
            onChangeText={field.onChange}
            error={errors.new_password?.message}
          />
        )} />
        <Controller control={control} name="confirm_password" render={({ field }) => (
          <Input
            label="Повторите новый пароль"
            placeholder="Повторите новый пароль"
            secureTextEntry
            value={field.value}
            onChangeText={field.onChange}
            error={errors.confirm_password?.message}
          />
        )} />
      </Card>

      {serverError ? (
        <View className="rounded-sct border border-red-200 bg-red-50 p-3">
          <Text className="text-red-700">{serverError}</Text>
        </View>
      ) : null}
      {saved ? (
        <View className="rounded-sct border border-green-200 bg-green-50 p-3">
          <Text className="text-green-700">Изменения сохранены.</Text>
        </View>
      ) : null}

      <Button
        fullWidth
        size="lg"
        loading={mutation.isPending}
        disabled={!isDirty}
        onPress={onSubmit}
      >
        Сохранить изменения
      </Button>
    </ScrollView>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text style={{ fontFamily: 'Inter_900Black' }} className="text-xs uppercase tracking-widest text-textSecondary">
      {children}
    </Text>
  )
}
