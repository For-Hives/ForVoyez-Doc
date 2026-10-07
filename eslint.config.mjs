import { fixupConfigRules } from '@eslint/compat'
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import prettierConfig from 'eslint-config-prettier/flat'
import noOnlyTests from 'eslint-plugin-no-only-tests'
import prettier from 'eslint-plugin-prettier'

export default defineConfig([
	// eslint-plugin-import, eslint-plugin-react and eslint-plugin-jsx-a11y still
	// call SourceCode APIs that ESLint 10 removed; @eslint/compat restores them
	...fixupConfigRules(nextVitals),
	prettierConfig,
	{
		plugins: {
			prettier,
			'no-only-tests': noOnlyTests,
		},
		rules: {
			'prettier/prettier': 'error',
			'no-console': 'warn',
			'no-only-tests/no-only-tests': 'error',
			'import/order': [
				'warn',
				{
					groups: [
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
						'index',
					],
					'newlines-between': 'always',
					alphabetize: {
						order: 'asc',
						caseInsensitive: true,
					},
				},
			],
		},
	},
	globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])
