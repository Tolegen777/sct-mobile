module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      // пресет nativewind (css-interop) сам подключает react-native-worklets/plugin
      // последним — для reanimated 4. Отдельно его добавлять НЕ нужно (был бы дубль).
      'nativewind/babel',
    ],
  }
}
