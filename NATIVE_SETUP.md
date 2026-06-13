# Нативная настройка (deep links · иконка/сплеш · EAS · push)

Кратко — что уже настроено в `app.json` / `eas.json` и что нужно сделать руками
перед публикацией.

## Deep links

Включён кастомный scheme в `app.json`: **`sctservice://`**. Expo Router строит
карту ссылок из файловой структуры `app/`, поэтому каждый маршрут адресуем:

| Ссылка | Экран |
|---|---|
| `sctservice://` | Главная (таб) |
| `sctservice://services` | Услуги (таб) |
| `sctservice://services/123` | Деталь пакета |
| `sctservice://services/123/book` | Запись на сервис |
| `sctservice://services/123/book?type=default` | Запись на дефолтную услугу |
| `sctservice://services/default/45` | Деталь дефолтной услуги |
| `sctservice://services/info/engine_oil` | Инфо об услуге |
| `sctservice://garage` · `sctservice://garage/add` · `sctservice://garage/edit/7` | Гараж |
| `sctservice://service-book` · `sctservice://bookings/9` · `sctservice://profile` | Книжка / запись / профиль |

Битые пути ловит `app/+not-found.tsx`.

Проверка локально:
```bash
npx uri-scheme open "sctservice://services/1/book" --ios     # или --android
```

**Universal links (https://…)** ещё не настроены — нужен прод-домен веб-версии
и захостить на нём `/.well-known/apple-app-site-association` (iOS) и
`/.well-known/assetlinks.json` (Android), затем добавить `ios.associatedDomains`
и `android.intentFilters` в `app.json`. Делаем, когда будет известен домен.

## Иконка и splash

Ассеты в `assets/` (`icon.png`, `adaptive-icon.png`, `splash-icon.png`,
`favicon.png`) — **бренд-плейсхолдеры** (navy/blue/yellow из дизайн-токенов),
сгенерированы, чтобы проект собирался. **Замените их на реальный дизайн**,
сохранив имена и размеры:

| Файл | Размер | Примечание |
|---|---|---|
| `icon.png` | 1024×1024 | App icon (без прозрачности) |
| `adaptive-icon.png` | 1024×1024 | Android foreground; значимое — в центре ~66% (safe zone), фон задаёт `backgroundColor` |
| `splash-icon.png` | ≥512×512 | Прозрачный PNG, показывается по центру на фоне `#0A1B3D` |
| `favicon.png` | 48×48 | Web |

Конфиг — в `app.json`: `icon`, `android.adaptiveIcon`, плагин
`expo-splash-screen` (фон `#0A1B3D`, ширина изображения 200). Рантайм-логика
(`SplashScreen.preventAutoHideAsync` / `hideAsync`) уже в `app/_layout.tsx` —
сплеш держится, пока грузятся шрифты и поднимается сессия.

## EAS build / submit

`eas.json` содержит профили `development` / `preview` / `production`
(в каждом задан `EXPO_PUBLIC_API_BASE_URL` на демо-бэк).

```bash
npm i -g eas-cli
eas login
eas build -p android --profile preview     # APK для теста
eas build -p ios --profile preview          # нужен Apple Developer аккаунт
eas build -p android --profile production    # AAB для стора (autoIncrement версии)
eas build -p ios --profile production
eas submit -p android --latest               # выгрузка в стор
eas submit -p ios --latest
```

Перед прод-сборкой поменяйте `EXPO_PUBLIC_API_BASE_URL` в `eas.json` на боевой
бэкенд.

## Push-уведомления — отложены (блок бэка)

`expo-notifications` намеренно **не установлен**: на бэке нет ручки регистрации
device-token (см. `../sct-web/BACKEND_NOTES.md`). Когда появится:

```bash
npx expo install expo-notifications
```
…добавить плагин в `app.json`, запрашивать разрешение и регистрировать токен
после логина, слать его на бэк (`POST <device-token endpoint>`), и обрабатывать
входящие (напоминания о записи, смена статуса).

## Локальный запуск

```bash
cp .env.example .env        # EXPO_PUBLIC_API_BASE_URL=https://sct-back-demo.topcoder.kz
npm install
npx expo start
```
