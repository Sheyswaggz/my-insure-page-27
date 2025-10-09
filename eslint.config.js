import js from '@eslint/js';
import globals from 'globals';
import html from 'eslint-plugin-html';

export default [
  // Global ignores - applies to all configurations
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.vite/**',
      'coverage/**',
      '*.config.js',
      '.eslintrc.*',
    ],
  },

  // Base configuration for all JavaScript files
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    plugins: {
      html,
    },
    rules: {
      ...js.configs.recommended.rules,

      // Error Prevention - Critical Issues
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-return-await': 'error',
      'require-atomic-updates': 'error',

      // Security Best Practices
      'no-unsafe-optional-chaining': 'error',
      'no-prototype-builtins': 'error',
      'no-constructor-return': 'error',
      'no-promise-executor-return': 'error',
      'no-unreachable-loop': 'error',
      'no-useless-backreference': 'error',

      // Code Quality - Maintainability
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'warn',
      'prefer-template': 'warn',
      'prefer-rest-params': 'warn',
      'prefer-spread': 'warn',
      'no-useless-concat': 'warn',
      'no-useless-return': 'warn',
      'no-useless-computed-key': 'warn',
      'no-useless-rename': 'warn',
      'object-shorthand': ['warn', 'always'],

      // Async/Await Best Practices
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'warn',
      'require-await': 'warn',

      // Error Handling
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',

      // Code Consistency
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'curly': ['error', 'all'],
      'brace-style': ['warn', '1tbs', { allowSingleLine: false }],
      'no-else-return': ['warn', { allowElseIf: false }],
      'no-lonely-if': 'warn',
      'no-unneeded-ternary': 'warn',

      // Variable Management
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-use-before-define': [
        'error',
        {
          functions: false,
          classes: true,
          variables: true,
        },
      ],
      'no-shadow': [
        'error',
        {
          builtinGlobals: false,
          hoist: 'functions',
          allow: [],
        },
      ],
      'no-undef-init': 'warn',

      // Function Best Practices
      'no-param-reassign': ['warn', { props: false }],
      'default-param-last': 'warn',
      'no-invalid-this': 'error',
      'consistent-return': 'error',

      // Array and Object Best Practices
      'no-array-constructor': 'error',
      'no-new-object': 'error',
      'no-new-wrappers': 'error',
      'array-callback-return': ['error', { allowImplicit: true }],

      // Performance Considerations
      'no-loop-func': 'error',
      'no-extend-native': 'error',

      // Readability
      'max-depth': ['warn', 4],
      'max-nested-callbacks': ['warn', 3],
      'max-params': ['warn', 5],
      'complexity': ['warn', 15],

      // Spacing and Formatting (minimal - Prettier handles most)
      'no-multi-spaces': 'warn',
      'no-trailing-spaces': 'warn',
      'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1, maxBOF: 0 }],
      'eol-last': ['warn', 'always'],
      'semi': ['error', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'comma-dangle': ['warn', 'always-multiline'],

      // Comments
      'spaced-comment': ['warn', 'always', { markers: ['/'] }],
      'multiline-comment-style': ['warn', 'starred-block'],

      // Disable rules that conflict with Prettier or are not needed
      'indent': 'off',
      'linebreak-style': 'off',
      'max-len': 'off',
    },
  },

  // HTML files with embedded JavaScript
  {
    files: ['**/*.html'],
    plugins: {
      html,
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // Relaxed rules for inline scripts in HTML
      'no-console': 'off',
      'no-undef': 'off', // HTML context may have globals not visible to linter
    },
  },

  // Configuration files - more lenient rules
  {
    files: ['vite.config.js', 'eslint.config.js', '*.config.js', '*.config.mjs'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
      'no-undef': 'off',
    },
  },

  // Development and test files - including vitest globals
  {
    files: ['**/*.test.js', '**/*.spec.js', '**/tests/**/*.js', 'tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // Vitest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
        vitest: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'max-nested-callbacks': 'off',
      'max-lines-per-function': 'off',
      'no-magic-numbers': 'off',
    },
  },
];