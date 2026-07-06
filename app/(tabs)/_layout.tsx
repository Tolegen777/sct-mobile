/**
 * Нижние табы — перенос app/MobileTabBar.tsx из веба:
 *   Главная / Книжка(authOnly) / Услуги / Контакты / Профиль(authOnly).
 * «Книжка» и «Профиль» требуют авторизации → для гостя табы скрыты (href: null).
 */
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text, View } from 'react-native'
import { useAuthStore } from '@/features/auth/store'

/** Брендовая шапка на navy (как на вебе) вместо дефолтной белой с «Главная». */
function HeaderBrand() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ fontFamily: 'Inter_900Black', fontSize: 20, color: '#FFFFFF', letterSpacing: 1 }}>
        SCT
      </Text>
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: '#F2C94C', marginLeft: 6, letterSpacing: 2 }}>
        SERVICE
      </Text>
    </View>
  )
}

export default function TabsLayout() {
  const isAuthed = useAuthStore((s) => s.phase === 'authed')

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1F5FAF',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontFamily: 'Inter_700Bold', fontSize: 10, textTransform: 'uppercase' },
        // Тёмная брендовая шапка (раньше была белая с текстом «Главная»).
        headerStyle: { backgroundColor: '#0A1B3D' },
        headerTintColor: '#FFFFFF',
        headerTitleAlign: 'left',
        headerTitle: () => <HeaderBrand />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Главная',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="service-book"
        options={{
          title: 'Книжка',
          href: isAuthed ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Услуги',
          tabBarIcon: ({ color, size }) => <Ionicons name="construct-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Контакты',
          tabBarIcon: ({ color, size }) => <Ionicons name="mail-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          href: isAuthed ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}
