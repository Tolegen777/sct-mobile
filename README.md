# SCT Mobile (React Native / Expo)

Мобильное приложение SCT Service — **клиентская часть** веб-приложения
[`sct-web`](../sct-web) (без админки). Бэкенд тот же
(`https://sct-back-demo.topcoder.kz`).

Это **каркас-фундамент**: настроены проект, навигация и перенесено
переиспользуемое ядро из веба. Экраны пока заглушки (кроме входа) — их
наполняем по [`../sct-web/MOBILE_PORTING_GUIDE.md`](../sct-web/MOBILE_PORTING_GUIDE.md).

> ⚠️ Каркас собран статически и **ещё не запускался** в этом виде. На первом
> `expo start` могут потребоваться мелкие правки версий/конфига — см. «Версии».

---

## Стек

Expo + Expo Router + NativeWind, а логический слой **переиспользован из веба
как есть**: TanStack Query, Zustand, React Hook Form + Zod, axios.

## Запуск

```bash
# 1. зависимости
npm install

# 2. выровнять версии под установленный Expo SDK (важно!)
npx expo install --fix

# 3. переменные окружения
cp .env.example .env        # EXPO_PUBLIC_API_BASE_URL уже указывает на демо-бэк

# 4. старт
npx expo start              # затем i (iOS) / a (Android) / Expo Go на телефоне
```

### Версии
`package.json` ориентирован на **Expo SDK 53** (React 19, RN 0.79). Если у тебя
другой SDK — самый надёжный путь: `npx create-expo-app@latest` свежим SDK, затем
перенести в него папки `app/`, `src/`, `global.css`, `tailwind.config.js`,
`babel.config.js`, `metro.config.js` и доустановить зависимости через
`npx expo install`. `npx expo install --fix` подгонит версии автоматически.

---

## Архитектура

Зеркало FSD из веба, плюс `app/` для файловой маршрутизации Expo Router:

```
app/                      # Expo Router — экраны (аналог pages/ + routes.tsx веба)
  _layout.tsx             # провайдеры, шрифты, bootstrap токенов/авторизации, splash
  (tabs)/                 # нижние табы: Главная/Книжка/Услуги/Контакты
  services/  garage/  bookings/  login,register,forgot-password,profile
src/
  app/                    # query-client, online-focus (RN focus/online)
  shared/
    api/                  # schema, types, http, endpoints, token-storage (SecureStore)
    config/env.ts         # EXPO_PUBLIC_* вместо import.meta.env
    lib/                  # format, phone, cn — перенесены дословно
    ui/                   # RN-компоненты (Button, Spinner, Placeholder, RequireAuth)
  features/auth/          # store, api, schemas, errors — перенесены дословно
```

Алиас `@/*` → `./src/*` (как в вебе). Router-файлы импортируют логику из `@/...`.

### Что переиспользовано из веба дословно
`shared/api/{schema,types,http}`, `shared/lib/*`, `app/query-client`,
`features/auth/{store,api,schemas,errors}`. Это работает в RN без правок.

### Что заменено под RN
- `shared/api/token-storage` — `localStorage` → **expo-secure-store** с in-memory
  зеркалом (синхронное чтение, чтобы `http.ts`/`store.ts` не трогать; на старте
  `hydrateTokens()` в `app/_layout.tsx`).
- `shared/config/env` — `import.meta.env.VITE_*` → `process.env.EXPO_PUBLIC_*`.
- `endpoints` — выкинуты все `staff*` (админки нет).
- `app/query-client` дополнен `online-focus` (рефетч на foreground + офлайн).
- Навигация — `react-router` → Expo Router; `MobileTabBar` → нативные `Tabs`.
- `shared/ui/*` — переписаны на RN-примитивы (зеркаля пропсы веба).

### Известные TODO каркаса
- **Шрифты:** Inter грузится, но веб-классы `font-bold/font-900` пока не
  замаплены на семейства (`Inter_700Bold`/`Inter_900Black`). Сейчас жирность —
  через `style={{ fontFamily: ... }}`. Домапить в `tailwind.config.js`.
- **UI-кит:** перенесён основной набор (`Button/Input/PhoneInput/Card/Modal/
  Select/Textarea/Toggle/Skeleton/SafeImage/Spinner`). Осталось `SearchableSelect`
  и `Toast` — см. PORTING_STATUS.
- **Иконки/сплеш, push, deep links, EAS-сборка** — раздел «Нативные добавки» гайда.

Полный план и Definition of Done на каждый экран — в
[`../sct-web/MOBILE_PORTING_GUIDE.md`](../sct-web/MOBILE_PORTING_GUIDE.md).
Текущий прогресс — в [`PORTING_STATUS.md`](./PORTING_STATUS.md).
