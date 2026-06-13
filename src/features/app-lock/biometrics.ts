/**
 * Обёртка над expo-local-authentication. Никакой UI — только проверка наличия
 * и запуск системного промпта биометрии.
 */
import * as LocalAuthentication from 'expo-local-authentication'

/** Есть ли железо И заведена ли биометрия пользователем. */
export async function isBiometricAvailable(): Promise<boolean> {
  const [hasHardware, enrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ])
  return hasHardware && enrolled
}

/**
 * Системный промпт биометрии. Возвращает true при успехе.
 * `disableDeviceFallback: true` — не предлагаем системный пасскод устройства,
 * наш фолбэк — собственный пин-пад.
 */
export async function authenticateBiometric(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Подтвердите вход',
    cancelLabel: 'Ввести код',
    disableDeviceFallback: true,
  })
  return result.success
}
