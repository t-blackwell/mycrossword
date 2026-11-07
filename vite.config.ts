/// <reference types="vitest/config" />
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';

const STYLES_MODULE_ID = 'virtual:mycrossword/styles';
const RESOLVED_STYLES_MODULE_ID = `\0${STYLES_MODULE_ID}`;
const STYLES_PLACEHOLDER = '__MYCROSSWORD_STYLES__';

/**
 * Makes the library's compiled stylesheet available to the bundle as a string
 * (via `virtual:mycrossword/styles`) so it can be injected into the document
 * at runtime, meaning consumers don't need to import a separate CSS file.
 *
 * During development and testing the module exports an empty string as Vite
 * handles the components' CSS imports itself (with HMR).
 */
function libraryStyles(): Plugin {
  let isBuild = false;

  return {
    name: 'mycrossword:library-styles',
    enforce: 'post',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    resolveId(id) {
      if (id === STYLES_MODULE_ID) {
        return RESOLVED_STYLES_MODULE_ID;
      }
    },
    load(id) {
      if (id === RESOLVED_STYLES_MODULE_ID) {
        const value = isBuild ? STYLES_PLACEHOLDER : '';
        return `export default ${JSON.stringify(value)};`;
      }
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        if (!isBuild) {
          return;
        }

        const css = Object.values(bundle)
          .filter(
            (output) =>
              output.type === 'asset' && output.fileName.endsWith('.css'),
          )
          .map((output) =>
            output.type === 'asset' ? output.source.toString() : '',
          )
          .join('\n');

        const placeholder = new RegExp(`(["'\`])${STYLES_PLACEHOLDER}\\1`);
        let replaced = false;

        for (const output of Object.values(bundle)) {
          if (output.type === 'chunk' && placeholder.test(output.code)) {
            output.code = output.code.replace(placeholder, () =>
              JSON.stringify(css),
            );
            replaced = true;
          }
        }

        if (!replaced) {
          this.error('Unable to inject the library styles into the bundle');
        }
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    libraryStyles(),
    dts({
      include: ['lib'],
      exclude: ['lib/**/*.test.*', 'lib/testData', 'lib/utils/test.ts'],
    }),
  ],
  resolve: {
    // resolves `~/*` and `mycrossword` (see tsconfig.json paths)
    tsconfigPaths: true,
    // `npm run dev:dist` runs the demo app against the built library instead
    alias:
      mode === 'dist'
        ? [{ find: /^mycrossword$/, replacement: resolve('dist/main.js') }]
        : [],
  },
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(import.meta.dirname, 'lib/main.ts'),
      formats: ['es'],
      fileName: 'main',
      cssFileName: 'style',
    },
    rolldownOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom'],
    },
  },
  test: {
    globals: true,
    setupFiles: ['./setupTests.ts'],
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['lib/**/*.test.{ts,tsx}'],
          exclude: ['lib/**/*.browser.test.{ts,tsx}'],
        },
      },
      {
        // tests that need a real browser e.g. for CSS media queries
        extends: true,
        test: {
          name: 'browser',
          include: ['lib/**/*.browser.test.{ts,tsx}'],
          css: { include: /.+/ },
          browser: {
            enabled: true,
            headless: true,
            screenshotFailures: false,
            provider: playwright({
              launchOptions: {
                // optional override e.g. to use a pre-installed Chromium
                executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
              },
            }),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
}));
