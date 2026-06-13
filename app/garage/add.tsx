/**
 * Визард «Добавить авто» — функциональный порт features/garage/add-car/*.
 * Шаги: Марка → Модель → Параметры (год/кузов/поколение) → Модификация → Номер.
 * Использует реальный конфигуратор cars/marks→models→filters→modifications и
 * создаёт авто через useCreateCarMutation (modification_source_id + форма).
 *
 * Шаг «Параметры» (порт web SpecsStep) сужает список модификаций по
 * году/кузову/поколению через `/cars/filters/`. Это убирает плоский дамп всех
 * модификаций марки+модели (для популярных авто — десятки) и снижает риск 502
 * на тяжёлых выборках. Поколение/«Показать модификации» ведёт к шагу выбора.
 */
import { useMemo, useState, type ReactNode } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Ionicons } from '@expo/vector-icons'
import { RequireAuth } from '@/shared/ui/RequireAuth'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { SafeImage } from '@/shared/ui/SafeImage'
import { cn } from '@/shared/lib/cn'
import { formatEngineVolume } from '@/shared/lib/format'
import { useCreateCarMutation } from '@/features/garage/queries'
import { parseApiError } from '@/features/auth/errors'
import {
  useFiltersQuery,
  useMarksQuery,
  useModelsQuery,
  useModificationsQuery,
} from '@/features/garage/add-car/queries'
import type { Mark, Model, Modification } from '@/features/garage/add-car/types'

/** Параметры сужения модификаций (год/кузов/поколение) — как web SpecsValues. */
interface SpecsValues {
  year?: number
  body_type?: number
  generation?: number
}

const STEPS = ['Марка', 'Модель', 'Параметры', 'Модификация', 'Номер']

export default function AddCarScreen() {
  return (
    <RequireAuth>
      <AddCarWizard />
    </RequireAuth>
  )
}

function AddCarWizard() {
  const router = useRouter()
  const createCar = useCreateCarMutation()
  const [step, setStep] = useState(0)
  const [mark, setMark] = useState<Mark | null>(null)
  const [model, setModel] = useState<Model | null>(null)
  const [specs, setSpecs] = useState<SpecsValues>({})
  const [modification, setModification] = useState<Modification | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const onPickMark = (m: Mark) => {
    if (mark?.id !== m.id) {
      setModel(null)
      setSpecs({})
      setModification(null)
    }
    setMark(m)
    setStep(1)
  }
  const onPickModel = (m: Model) => {
    if (model?.id !== m.id) {
      setSpecs({})
      setModification(null)
    }
    setModel(m)
    setStep(2)
  }
  const onChangeSpecs = (next: SpecsValues) => {
    // Любая смена параметров меняет набор модификаций — сбрасываем выбор.
    setSpecs(next)
    setModification(null)
  }
  const onPickMod = (mod: Modification) => {
    setModification(mod)
    setStep(4)
  }

  const submit = async (v: FinalValues) => {
    if (!modification) return
    setServerError(null)
    try {
      await createCar.mutateAsync({
        modification_source_id: modification.source_id,
        license_plate: v.license_plate.trim().toUpperCase(),
        nickname: v.nickname?.trim() ?? '',
        vin_code: v.vin_code?.trim().toUpperCase() ?? '',
        mileage_km: null,
        is_default: true,
      })
      router.replace('/garage')
    } catch (err) {
      const parsed = parseApiError(err, 'Не удалось сохранить автомобиль.')
      const msgs = [parsed.general, ...Object.values(parsed.fields)].filter(Boolean) as string[]
      setServerError(msgs.join(' ') || 'Не удалось сохранить автомобиль.')
    }
  }

  return (
    <View className="flex-1 bg-surfaceLight">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Добавить авто',
          headerBackVisible: true,
        }}
      />
      <StepHeader step={step} mark={mark} model={model} specs={specs} />

      {step === 0 ? <MarkPicker selectedId={mark?.id ?? null} onSelect={onPickMark} /> : null}
      {step === 1 && mark ? (
        <ModelPicker markId={mark.id} selectedId={model?.id ?? null} onSelect={onPickModel} />
      ) : null}
      {step === 2 && mark && model ? (
        <SpecsPicker
          markId={mark.id}
          modelId={model.id}
          values={specs}
          onChange={onChangeSpecs}
          onContinue={() => setStep(3)}
        />
      ) : null}
      {step === 3 && mark && model ? (
        <ModificationPicker
          markId={mark.id}
          modelId={model.id}
          specs={specs}
          selectedId={modification?.source_id ?? null}
          onSelect={onPickMod}
        />
      ) : null}
      {step === 4 && modification ? (
        <FinalForm onSubmit={submit} serverError={serverError} />
      ) : null}
    </View>
  )
}

function StepHeader({
  step,
  mark,
  model,
  specs,
}: {
  step: number
  mark: Mark | null
  model: Model | null
  specs: SpecsValues
}) {
  const summary = [mark?.name, model?.name, specs.year ? String(specs.year) : null]
    .filter(Boolean)
    .join(' · ')
  return (
    <View className="border-b border-borderLight bg-white px-4 py-3">
      <View className="flex-row gap-2">
        {STEPS.map((label, i) => (
          <View key={label} className="flex-1 items-center">
            <View className={cn('h-1.5 w-full rounded-full', i <= step ? 'bg-brandBlue' : 'bg-borderLight')} />
            <Text
              style={{ fontFamily: 'Inter_700Bold' }}
              className={cn('mt-1.5 text-[9px] uppercase tracking-wide', i === step ? 'text-brandBlue' : 'text-textSecondary')}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>
      {summary ? (
        <Text numberOfLines={1} className="mt-2 text-[11px] uppercase tracking-wide text-textSecondary">
          {summary}
        </Text>
      ) : null}
    </View>
  )
}

// --- Шаг 1: Марка ---
function MarkPicker({ selectedId, onSelect }: { selectedId: number | null; onSelect: (m: Mark) => void }) {
  const { data, isLoading, isError } = useMarksQuery()
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)
  const q = search.trim().toLowerCase()

  const filtered = useMemo(() => {
    const all = data?.results ?? []
    if (!q) return all
    return all.filter((m) => [m.name, m.name_ru, m.display_name].some((v) => v?.toLowerCase().includes(q)))
  }, [data, q])
  const popular = useMemo(() => filtered.filter((m) => m.is_popular), [filtered])
  const base = popular.length > 0 ? popular : filtered
  const visible = q || showAll ? filtered : base.slice(0, 12)
  const canExpand = !q && !showAll && filtered.length > visible.length

  if (isLoading) return <Centered><Spinner /></Centered>
  if (isError || !data) return <ErrorPlate text="Не удалось загрузить список марок." />

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
      <Input label="Поиск марки" placeholder="Например BMW…" value={search} onChangeText={setSearch} autoCapitalize="none" />
      <View className="flex-row flex-wrap gap-3">
        {visible.map((mark) => (
          <Pressable
            key={mark.id}
            onPress={() => onSelect(mark)}
            className={cn('w-[31%] items-center gap-2 rounded-sct border bg-white p-4', mark.id === selectedId ? 'border-brandBlue' : 'border-borderLight')}
          >
            <SafeImage
              uri={mark.logo_url}
              resizeMode="contain"
              className="h-10 w-10"
              fallback={
                <View className="h-10 w-10 items-center justify-center rounded-full bg-surfaceLight">
                  <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[11px] uppercase text-textSecondary">
                    {mark.name.slice(0, 2)}
                  </Text>
                </View>
              }
            />
            <Text style={{ fontFamily: 'Inter_900Black' }} numberOfLines={1} className="text-[11px] uppercase text-textPrimary">
              {mark.name}
            </Text>
          </Pressable>
        ))}
      </View>
      {filtered.length === 0 ? <ErrorPlate text={`По запросу «${search}» марки не найдены.`} muted /> : null}
      {canExpand ? (
        <Pressable onPress={() => setShowAll(true)} className="items-center rounded-sct border-2 border-dashed border-borderLight py-4">
          <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[12px] uppercase tracking-widest text-textSecondary">
            Показать все марки
          </Text>
        </Pressable>
      ) : null}
    </ScrollView>
  )
}

// --- Шаг 2: Модель ---
function ModelPicker({ markId, selectedId, onSelect }: { markId: number; selectedId: number | null; onSelect: (m: Model) => void }) {
  const { data, isLoading, isError } = useModelsQuery(markId)
  const [search, setSearch] = useState('')
  const q = search.trim().toLowerCase()
  const filtered = useMemo(() => {
    const all = data?.results ?? []
    if (!q) return all
    return all.filter((m) => [m.name, m.name_ru, m.display_name].some((v) => v?.toLowerCase().includes(q)))
  }, [data, q])

  if (isLoading) return <Centered><Spinner /></Centered>
  if (isError || !data) return <ErrorPlate text="Не удалось загрузить модели." />

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
      <Input label="Поиск модели" placeholder="Модель…" value={search} onChangeText={setSearch} autoCapitalize="none" />
      {filtered.map((m) => (
        <Pressable
          key={m.id}
          onPress={() => onSelect(m)}
          className={cn('flex-row items-center justify-between rounded-sct border bg-white p-4', m.id === selectedId ? 'border-brandBlue' : 'border-borderLight')}
        >
          <View className="flex-1">
            <Text style={{ fontFamily: 'Inter_900Black' }} className="text-base uppercase text-textPrimary">{m.name}</Text>
            <Text className="mt-0.5 text-[11px] uppercase tracking-wide text-textSecondary">
              {m.year_from}{m.year_to ? `–${m.year_to}` : ''} · {m.modifications_count} модиф.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#D9DEE5" />
        </Pressable>
      ))}
      {filtered.length === 0 ? <ErrorPlate text="Модели не найдены." muted /> : null}
    </ScrollView>
  )
}

// --- Шаг 3: Параметры (год / кузов / поколение) — порт web SpecsStep ---
const YEAR_LIMIT = 12

function SpecsPicker({
  markId,
  modelId,
  values,
  onChange,
  onContinue,
}: {
  markId: number
  modelId: number
  values: SpecsValues
  onChange: (next: SpecsValues) => void
  onContinue: () => void
}) {
  const query = useMemo(
    () => ({ mark: markId, model: modelId, ...values }),
    [markId, modelId, values],
  )
  const { data, isFetching, isError } = useFiltersQuery(query)
  const [showAllYears, setShowAllYears] = useState(false)

  const years = data?.years ?? []
  const bodyTypes = data?.body_types ?? []
  const generations = data?.generations ?? []
  const count = data?.modifications_count ?? 0

  const sortedYears = useMemo(() => [...years].sort((a, b) => b - a), [years])
  const visibleYears = showAllYears ? sortedYears : sortedYears.slice(0, YEAR_LIMIT)

  const selectYear = (y: number) =>
    onChange({ year: values.year === y ? undefined : y, body_type: undefined, generation: undefined })
  const selectBody = (id: number) =>
    onChange({ ...values, body_type: values.body_type === id ? undefined : id, generation: undefined })
  const selectGeneration = (id: number) => {
    onChange({ ...values, generation: id })
    onContinue()
  }

  if (isFetching && !data) return <Centered><Spinner /></Centered>

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 24 }}>
        {isError ? (
          <View className="rounded-sct border border-amber-200 bg-amber-50 p-3">
            <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-sm text-amber-800">
              Сервер не смог посчитать параметры под эту модель.
            </Text>
            <Text className="mt-1 text-xs text-amber-800/80">
              Можно пропустить и сразу перейти к выбору модификации.
            </Text>
          </View>
        ) : null}

        {/* Год выпуска */}
        <View className="gap-3">
          <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[12px] uppercase tracking-widest text-textSecondary">
            Год выпуска
          </Text>
          {years.length === 0 ? (
            <Text className="text-sm text-textSecondary/70">
              Нет доступных годов — переходите к модификациям.
            </Text>
          ) : (
            <>
              <View className="flex-row flex-wrap gap-2">
                {visibleYears.map((y) => (
                  <Pressable
                    key={y}
                    onPress={() => selectYear(y)}
                    className={cn(
                      'min-w-[22%] items-center rounded-sct border px-3 py-3',
                      values.year === y ? 'border-brandBlue bg-brandBlue' : 'border-borderLight bg-white',
                    )}
                  >
                    <Text
                      style={{ fontFamily: 'Inter_900Black' }}
                      className={cn('text-base', values.year === y ? 'text-white' : 'text-textPrimary')}
                    >
                      {y}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {!showAllYears && sortedYears.length > YEAR_LIMIT ? (
                <Pressable
                  onPress={() => setShowAllYears(true)}
                  className="items-center rounded-sct border-2 border-dashed border-borderLight py-3"
                >
                  <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[12px] uppercase tracking-widest text-textSecondary">
                    Показать все года ({sortedYears.length})
                  </Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>

        {/* Тип кузова — после выбора года */}
        {values.year !== undefined && bodyTypes.length > 0 ? (
          <View className="gap-3 border-t border-borderLight pt-5">
            <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[12px] uppercase tracking-widest text-textSecondary">
              Тип кузова
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {bodyTypes.map((b) => (
                <Pressable
                  key={b.id}
                  onPress={() => selectBody(b.id)}
                  className={cn(
                    'rounded-sct border px-4 py-3',
                    values.body_type === b.id ? 'border-brandBlue bg-brandBlue' : 'border-borderLight bg-white',
                  )}
                >
                  <Text
                    style={{ fontFamily: 'Inter_900Black' }}
                    className={cn('text-[12px] uppercase', values.body_type === b.id ? 'text-white' : 'text-textPrimary')}
                  >
                    {b.name || b.code}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* Поколение — после выбора года */}
        {values.year !== undefined && generations.length > 0 ? (
          <View className="gap-3 border-t border-borderLight pt-5">
            <Text style={{ fontFamily: 'Inter_900Black' }} className="text-[12px] uppercase tracking-widest text-textSecondary">
              Поколение
            </Text>
            {generations.map((g) => (
              <Pressable
                key={g.id}
                onPress={() => selectGeneration(g.id)}
                className={cn(
                  'rounded-sct border bg-white p-4',
                  values.generation === g.id ? 'border-brandBlue' : 'border-borderLight',
                )}
              >
                <Text style={{ fontFamily: 'Inter_900Black' }} className="text-sm uppercase text-textPrimary">
                  {g.display_name}
                </Text>
                <Text className="mt-0.5 text-[11px] uppercase tracking-widest text-textSecondary">
                  {g.year_from}{g.year_to ? `–${g.year_to}` : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {/* Нижняя панель: перейти к модификациям с текущими фильтрами (аналог
          web-fallback «Далее»). Можно пропустить параметры целиком. */}
      <View className="border-t border-borderLight bg-white px-4 py-3">
        <Button fullWidth onPress={onContinue}>
          {count > 0 ? `Показать модификации (${count})` : 'К выбору модификации'}
        </Button>
      </View>
    </View>
  )
}

// --- Шаг 4: Модификация ---
function ModificationPicker({
  markId,
  modelId,
  specs,
  selectedId,
  onSelect,
}: {
  markId: number
  modelId: number
  specs: SpecsValues
  selectedId: string | null
  onSelect: (m: Modification) => void
}) {
  const query = useMemo(
    () => ({ mark: markId, model: modelId, ...specs, page_size: 100 }),
    [markId, modelId, specs],
  )
  const { data, isLoading, isError } = useModificationsQuery(query)
  const mods = data?.results ?? []

  if (isLoading) return <Centered><Spinner /></Centered>
  if (isError) return <ErrorPlate text="Не удалось загрузить характеристики." />
  if (mods.length === 0) return <ErrorPlate text="Для этой модели нет модификаций." muted />

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text className="text-[12px] uppercase tracking-widest text-textSecondary">
        Выберите модификацию ({mods.length})
      </Text>
      {mods.map((mod) => {
        const label = mod.full_title || mod.name || mod.display_name || mod.title || `Модификация #${mod.id}`
        const vol = formatEngineVolume(mod.engine_volume ?? null)
        const power = mod.power_display || (mod.horse_power ? `${mod.horse_power} л.с.` : '')
        const meta = [vol, power, mod.transmission_type_label, mod.fuel_type_label].filter(Boolean).join(' · ')
        return (
          <Pressable
            key={mod.source_id}
            onPress={() => onSelect(mod)}
            className={cn('rounded-sct border bg-white p-4', mod.source_id === selectedId ? 'border-brandBlue' : 'border-borderLight')}
          >
            <Text style={{ fontFamily: 'Inter_900Black' }} className="text-sm uppercase text-textPrimary">{label}</Text>
            {meta ? <Text className="mt-1 text-[11px] uppercase tracking-wide text-textSecondary">{meta}</Text> : null}
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

// --- Шаг 4: Финальная форма ---
const licensePlateRegex = /^[A-ZА-ЯЁ0-9\-\s]{2,32}$/i
const vinRegex = /^[A-HJ-NPR-Z0-9]{0,17}$/

const finalSchema = z.object({
  license_plate: z
    .string()
    .min(2, 'Минимум 2 символа')
    .max(32, 'Максимум 32 символа')
    .regex(licensePlateRegex, 'Только буквы, цифры, дефис'),
  nickname: z.string().max(255, 'Максимум 255 символов').optional().or(z.literal('')),
  vin_code: z
    .string()
    .regex(vinRegex, 'VIN — только латиница (без I, O, Q) и цифры')
    .max(17, 'VIN не больше 17 символов')
    .optional()
    .or(z.literal('')),
})
type FinalValues = z.infer<typeof finalSchema>

function FinalForm({ onSubmit, serverError }: { onSubmit: (v: FinalValues) => Promise<void>; serverError: string | null }) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FinalValues>({
    resolver: zodResolver(finalSchema),
    defaultValues: { license_plate: '', nickname: '', vin_code: '' },
  })

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
      <Text style={{ fontFamily: 'Inter_900Black' }} className="text-center text-2xl uppercase text-textPrimary">
        Почти готово
      </Text>
      <Text className="text-center text-sm text-textSecondary">Введите данные для регистрации в системе</Text>

      <Controller
        control={control}
        name="license_plate"
        render={({ field }) => (
          <Input
            label="Госномер (обязательно)"
            placeholder="000 AAA 01"
            autoCapitalize="characters"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.license_plate?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="nickname"
        render={({ field }) => (
          <Input
            label="Псевдоним (необязательно)"
            placeholder="Напр: Моя машина"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.nickname?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="vin_code"
        render={({ field }) => (
          <Input
            label="VIN (необязательно)"
            placeholder="VIN код"
            autoCapitalize="characters"
            maxLength={17}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.vin_code?.message}
          />
        )}
      />

      {serverError ? (
        <View className="rounded-sct border border-red-200 bg-red-50 p-3">
          <Text className="text-red-700">{serverError}</Text>
        </View>
      ) : null}

      <Button fullWidth size="lg" loading={isSubmitting} onPress={handleSubmit(onSubmit)}>
        Добавить в гараж
      </Button>
    </ScrollView>
  )
}

// --- helpers ---
function Centered({ children }: { children: ReactNode }) {
  return <View className="flex-1 items-center justify-center bg-surfaceLight">{children}</View>
}

function ErrorPlate({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <View className="m-4">
      <View className={cn('rounded-sct border p-4', muted ? 'border-borderLight bg-surfaceLight' : 'border-red-200 bg-red-50')}>
        <Text style={{ fontFamily: 'Inter_700Bold' }} className={cn('text-center text-sm', muted ? 'text-textSecondary' : 'text-red-700')}>
          {text}
        </Text>
      </View>
    </View>
  )
}
