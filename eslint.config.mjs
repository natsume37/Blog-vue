import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  ignores: [
    'src/**',
    'dist/**',
    '.output/**',
    'Assets/**',
  ],
  rules: {
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
  },
})
