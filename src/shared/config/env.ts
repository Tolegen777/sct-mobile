/**
 * Все переменные окружения собираем в одном месте (как в вебе), но источник —
 * Expo: `process.env.EXPO_PUBLIC_*` (инлайнится бандлером) или app config.
 * Если переменной нет — кидаем понятную ошибку, а не undefined летит в axios.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(`Missing env variable: ${name}. Проверь .env / app config`)
  }
  return value
}

export const env = {
  API_BASE_URL: required(
    'EXPO_PUBLIC_API_BASE_URL',
    process.env.EXPO_PUBLIC_API_BASE_URL,
  ),
} as const
