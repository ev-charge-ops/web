import tsParser from '@typescript-eslint/parser'
import boundaries from 'eslint-plugin-boundaries'

const sharedLayers = [
  'components',
  'config',
  'hooks',
  'lib',
  'stores',
  'styles',
  'testing',
  'types',
  'utils',
]

export default [
  {
    ignores: ['dist', 'node_modules', 'coverage'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.app.json' },
      },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        {
          type: 'feature',
          pattern: 'src/features/*',
          capture: ['featureName'],
        },
        ...sharedLayers.map((layer) => ({
          type: 'shared',
          pattern: `src/${layer}`,
        })),
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'shared' } },
              allow: { to: { element: { type: 'shared' } } },
            },
            {
              from: { element: { type: 'feature' } },
              allow: {
                to: {
                  element: {
                    types: { anyOf: ['shared'] },
                  },
                },
              },
            },
            {
              from: { element: { type: 'feature' } },
              allow: {
                to: {
                  element: {
                    type: 'feature',
                    captured: {
                      featureName: '{{ from.element.captured.featureName }}',
                    },
                  },
                },
              },
            },
            {
              from: { element: { type: 'app' } },
              allow: {
                to: {
                  element: { types: { anyOf: ['app', 'feature', 'shared'] } },
                },
              },
            },
          ],
        },
      ],
    },
  },
]
