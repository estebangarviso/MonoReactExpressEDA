import globals from 'globals';
import pluginJs from '@eslint/js';
// import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

/**
 * @type {import('eslint').Linter.FlatConfig[]}
 */
export default [
	{
		ignores: [
			'build/**/*',
			'dist/**/*',
			'**/node_modules/**/*',
			'.reports/**/*',
			'.vscode/**/*',
			'.wireit/**/*',
			'.rollup.cache/**/*',
		],
	},
	{ files: ['**/*.{js,mjs,cjs,ts}'] },
	{ languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
	{ languageOptions: { globals: globals.browser } },
	{ languageOptions: { parser: '@babel/eslint-parser', parserOptions: { requireConfigFile: false,
		babelOptions: {
		  plugins: [
			'@babel/plugin-syntax-import-assertions'
		  ],
		} } } },
	pluginJs.configs.recommended,
	// ...tseslint.configs.recommended,
	eslintPluginPrettierRecommended,
];
