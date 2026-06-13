/**
 * Skeleton-плейсхолдеры (RN-порт shared/ui/Skeleton.tsx). Пульсация — через
 * Animated (в RN нет CSS animate-pulse). Тот же набор: Box/TextLine/Card/Hero/
 * Row/TableRows.
 */
import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { cn } from '@/shared/lib/cn'

function Box({ className }: { className?: string }) {
  const opacity = useRef(new Animated.Value(0.5)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 650, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])

  return (
    <View className={cn('overflow-hidden rounded-md', className)}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#EEF1F4', opacity }]} />
    </View>
  )
}

function TextLine({ className }: { className?: string }) {
  return <Box className={cn('h-4 w-full', className)} />
}

function Card({ className }: { className?: string }) {
  return (
    <View className={cn('rounded-sct border border-borderLight bg-white p-5', className)}>
      <Box className="h-5 w-3/4" />
      <Box className="mt-3 h-3 w-1/2" />
      <Box className="mt-4 h-20 w-full" />
    </View>
  )
}

function Hero({ className }: { className?: string }) {
  return (
    <View className={cn('rounded-sct-lg bg-surfaceMuted p-6', className)}>
      <Box className="h-3 w-24" />
      <Box className="mt-4 h-8 w-3/4" />
      <Box className="mt-3 h-4 w-1/2" />
    </View>
  )
}

function Row({ className }: { className?: string }) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-4 rounded-sct border border-borderLight bg-white p-4',
        className,
      )}
    >
      <Box className="h-12 w-20" />
      <View className="flex-1 gap-2">
        <Box className="h-4 w-3/4" />
        <Box className="h-3 w-1/2" />
      </View>
    </View>
  )
}

function TableRows({ count = 5 }: { count?: number }) {
  return (
    <View className="gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Row key={i} />
      ))}
    </View>
  )
}

export const Skeleton = { Box, TextLine, Card, Hero, Row, TableRows }
