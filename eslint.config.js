import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Ensures CSS imports come after all other imports, so a component's styles
 * are added after (and can override) the styles of the components it uses.
 */
const cssImportOrder = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Require CSS imports to come after other imports' },
    messages: {
      cssImportOrder: 'CSS imports should come after all other imports.',
    },
    schema: [],
  },
  create(context) {
    return {
      Program(program) {
        let cssImport;

        for (const node of program.body) {
          if (node.type !== 'ImportDeclaration') {
            continue;
          }

          if (/\.css(\?.*)?$/.test(node.source.value)) {
            cssImport ??= node;
          } else if (cssImport !== undefined) {
            context.report({ node: cssImport, messageId: 'cssImportOrder' });
            return;
          }
        }
      },
    };
  },
};

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactRefresh.configs.vite,
      prettier,
    ],
    plugins: {
      'react-hooks': reactHooks,
      local: { rules: { 'css-import-order': cssImportOrder } },
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      'local/css-import-order': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['*.config.{js,ts}'],
    languageOptions: {
      globals: globals.node,
    },
  },
]);
