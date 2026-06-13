import { Placeholder } from '@/shared/ui/Placeholder'

// TODO(порт): features/auth/ForgotPasswordModal.tsx + password-reset-api.ts.
// ⚠️ Во вебе восстановление пароля было заблокировано бэком (PROJECT_STATUS.md) —
// проверить готовность ручки перед реализацией.
export default function ForgotPasswordScreen() {
  return (
    <Placeholder
      title="Восстановление пароля"
      source="features/auth/ForgotPasswordModal.tsx + password-reset-api.ts"
      note="UI готов во вебе, но ручка была заблокирована бэком — свериться с BACKEND_NOTES.md."
    />
  )
}
