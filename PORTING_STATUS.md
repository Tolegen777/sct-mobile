# Статус порта (sct-web → sct-mobile)

Легенда: ✅ готово · 🟡 частично · ⬜ заглушка/TODO

## Фундамент
- ✅ Expo + Expo Router + NativeWind + TypeScript (конфиги)
- ✅ Дизайн-токены из `tailwind.config.js` (цвета, радиусы) · 🟡 шрифты (вес→семейство не домаплено)
- ✅ Перенос ядра: `schema`, `types`, `http`, `endpoints`(client), `env`, `query-client`, `lib/*`
- ✅ Хранилище токенов на `expo-secure-store` (+ `hydrateTokens` на старте)
- ✅ `online-focus` (refetch на foreground + offline через NetInfo)
- ✅ Auth: `store`, `api`, `schemas`, `errors` (перенесены дословно)
- ✅ Навигация: табы (Главная/Книжка*/Услуги/Контакты) + стеки + гард `RequireAuth`
- ✅ Bootstrap авторизации в `app/_layout.tsx` (аналог `AuthBootstrap`)

## Экраны (карта из routes.tsx)
| Экран | Маршрут | Auth | Статус | Источник |
|---|---|---|---|---|
| Вход | `/login` | — | ✅ рабочий | `features/auth/LoginModal` |
| Регистрация | `/register` | — | ✅ рабочий | `features/auth/RegisterModal` |
| Восстановление пароля | `/forgot-password` | — | ⬜ | `features/auth/ForgotPasswordModal` |
| Главная | `/(tabs)` | — | ✅ рабочий | `pages/HomePage` + `features/home` |
| Услуги | `/(tabs)/services` | — | ✅ рабочий | `pages/ServicesPage` + `features/packages` |
| Сервисная книжка | `/(tabs)/service-book` | ✅ | ✅ рабочий | `pages/ServiceBookPage` + `features/service-book` |
| Контакты | `/(tabs)/contacts` | — | ✅ рабочий (без карты) | `pages/ContactsPage` + `features/service-stations` |
| Деталь пакета | `/services/[id]` | — | ✅ рабочий (сжато) | `pages/PackageDetailPage` |
| Запись на сервис | `/services/[id]/book` | ✅ | ✅ рабочий | `pages/BookServicePage` + `features/booking-wizard` |
| Инфо об услуге | `/services/info/[code]` | — | ✅ рабочий | `pages/ServiceInfoPage` |
| Default-услуга | `/services/default/[id]` | ✅ | ✅ рабочий | `pages/DefaultServiceDetailPage` |
| Гараж | `/garage` | ✅ | ✅ рабочий | `pages/GaragePage` + `features/garage` |
| Добавить авто | `/garage/add` | ✅ | ✅ рабочий (упрощён) | `features/garage/add-car` (визард) |
| Редактировать авто | `/garage/edit/[id]` | ✅ | ✅ рабочий | `pages/EditCarPage` |
| Деталь записи | `/bookings/[id]` | ✅ | ✅ рабочий (без edit) | `pages/BookingDetailPage` + `features/bookings` |
| Профиль | `/profile` | ✅ | ✅ рабочий | `pages/ProfilePage` |

\* «Книжка» в табах скрыта для гостя.

## Фичи (перенос api/queries + RN-вьюхи)
- ✅ `features/packages` — api/queries/types/lib (копия) + ServiceCard/DefaultServiceCard/ActiveCarStrip (RN)
- ✅ `features/home` — все 8 секций (Hero, WhyUs, MainServices, PromoBanner, MyGarage, ActiveCar, Upcoming, History)
- ✅ `features/garage` — api/queries/lib + CarCard/EmptyGarage (RN); список + edit-car (nickname/пробег + сделать активным/удалить) готовы
- ✅ `features/garage/add-car` — api/queries/types (конфигуратор) + визард Mark→Model→Modification→Номер (шаг фильтров/Specs свёрнут)
- ✅ `features/bookings` — api/queries/types (копия) + экран детали (отмена через Alert). EditBookingModal — TODO
- ✅ `features/service-book` — api/queries/types + RN-компоненты (CarHeroCompact, RecommendationStrip, BookServiceCTA, AppointmentRow, HistorySection)
- ✅ `features/service-stations` — api/queries/types (копия) + экран Контакты (карта Leaflet опущена)
- ✅ `features/auth/GuestPrompt` (RN)
- ✅ `booking-wizard` — `lib` (слоты/дата/UTC) + `BranchStep` + `DateTimeStep` (RN) + экран записи: 3 шага (филиал → дата/время → подтверждение) + экран успеха
- ⬜ `PromoCard` (пока ServiceCard) · ⬜ `PackageOptionsModal` (карточка ведёт сразу на пакет)

## UI-кит (`shared/ui`)
- ✅ `Button` · ✅ `Input` · ✅ `PhoneInput` · ✅ `Textarea` · ✅ `Select`* · ✅ `Modal` · ✅ `Card`
- ✅ `Toggle` · ✅ `Skeleton` · ✅ `SafeImage` · ✅ `Spinner` · ✅ `Placeholder` · ✅ `RequireAuth`
- ✅ `SearchableSelect` (модалка-шит с поиском — для длинных списков) · ✅ `Toast` (глобальный pub/sub + `ToastViewport` в `_layout`)
- \* `Select` — API на `options` (в RN нет `<option>`); см. шапку компонента

## Нативные добавки
- 🟡 offline/refetch (есть `online-focus`) · ⬜ push (`expo-notifications` не ставился — нужен device-token эндпоинт на бэке)
- ✅ deep links (scheme `sctservice://`, Expo Router linking + `+not-found`)
- ✅ иконка/сплеш (бренд-плейсхолдеры в `assets/` + конфиг в `app.json`) · ✅ EAS-конфиг (`eas.json`: dev/preview/production)
- 📄 `NATIVE_SETUP.md` — карта deep links, замена ассетов, команды EAS, статус push

## Следующие шаги (рекомендуемый порядок — см. гайд §8)
1. ✅ UI-кит (полный — включая `SearchableSelect` и `Toast`).
2. ✅ Auth-флоу (Login + Register + Profile рабочие). Осталось `forgot-password`.
3. ✅ Services, Home, Service-book, Contacts, Garage (список + **add-car визард**), Booking (деталь), **Запись на сервис (booking-wizard)**, **edit-car**. Дальше: forgot-password (ждёт бэк).
4. ✅ Нативный polish: deep links + иконка/сплеш + `eas.json` (push ждёт бэк). См. `NATIVE_SETUP.md`.
