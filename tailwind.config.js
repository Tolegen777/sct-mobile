/** @type {import('tailwindcss').Config} */
// Дизайн-токены перенесены 1:1 из sct-web/tailwind.config.js.
// boxShadow/keyframes/animation из веба опущены — в RN тени/анимации
// делаются иначе (shadow*/elevation, reanimated).
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brandBlue: '#1F5FAF',
        brandBlueDark: '#184A88',
        navy: '#0A1B3D',
        navyDeep: '#061536',
        brandYellow: '#F2C94C',
        brandOrange: '#F97316',
        surfaceLight: '#F7F8FA',
        surfaceMuted: '#EEF1F4',
        borderLight: '#D9DEE5',
        textPrimary: '#18202A',
        textSecondary: '#4B5968',
        successBg: '#EAF8F0',
        successText: '#1D7F4D',
      },
      borderRadius: {
        sct: '16px',
        'sct-lg': '24px',
        'sct-xl': '32px',
      },
      fontFamily: {
        // Inter грузим через @expo-google-fonts/inter в app/_layout.tsx.
        // В RN насыщенность — это ОТДЕЛЬНЫЙ файл шрифта, а не font-weight.
        // Здесь только базовое семейство (font-sans). Жирные начертания в
        // компонентах задаём явным style={{ fontFamily: 'Inter_700Bold' }}.
        // TODO(порт): домапить веб-классы font-bold/font-900 на семейства Inter
        // (через preset/plugin), чтобы переносить разметку без правок. См. README.
        sans: ['Inter_400Regular'],
      },
    },
  },
  plugins: [],
}
