/**
 * Image, который при ошибке загрузки показывает fallback (RN-порт
 * shared/ui/SafeImage.tsx). Бэк отдаёт S3-URL'ы, иногда 403/404.
 *
 * Отличие от веба: src(string) → uri(string). Размеры задаём className/style
 * (RN Image без размеров не виден).
 */
import { useState, type ReactNode } from 'react'
import { Image, type ImageProps } from 'react-native'

interface SafeImageProps extends Omit<ImageProps, 'source'> {
  uri?: string | null
  fallback?: ReactNode
  className?: string
}

export function SafeImage({ uri, fallback, className, ...rest }: SafeImageProps) {
  const [failed, setFailed] = useState(false)

  if (!uri || failed) return <>{fallback ?? null}</>

  return (
    <Image
      source={{ uri }}
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  )
}
