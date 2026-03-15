import js from '@eslint/js';
import globals from 'globals';
import mochaPlugin from 'eslint-plugin-mocha';
import pluginSecurity from 'eslint-plugin-security';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

const tsFiles = ['cmd/**/*.ts', 'src/**/*.ts', 'test/**/*.ts'];
const jsFiles = ['karma.conf.cjs', 'eslint.config.js'];
const allFiles = [...tsFiles, ...jsFiles];

export default tseslint.config(
    {
        ...eslintPluginUnicorn.configs['recommended'],
        files: allFiles,
    },
    {
        name: 'unicorn plugin overrides',
        files: allFiles,
        rules: {
            'unicorn/prevent-abbreviations'    : 'off',
            'unicorn/switch-case-braces'       : ['error', 'avoid'],
            'unicorn/no-null'                  : 'off',
            'unicorn/no-this-assignment'       : 'off',
            'unicorn/catch-error-name'         : 'off',
            'unicorn/prefer-add-event-listener': 'off',
            'unicorn/numeric-separators-style' : ['warn', { onlyIfContainsSeparator: true }],
            'unicorn/prefer-class-fields'      : 'off',
        }
    },
    {
        ...pluginSecurity.configs.recommended,
        files: allFiles,
    },
    {
        name: 'security plugin overrides',
        files: allFiles,
        rules: {
            'security/detect-object-injection': 'off',
            'security/detect-unsafe-regex'    : 'off'
        }
    },
    {
        ...js.configs.recommended,
        files: allFiles,
    },
    {
        ...mochaPlugin.configs.recommended,
        files: allFiles,
    },
    {
        name           : 'wampy eslint config',
        files          : allFiles,
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType : 'module',
            globals    : {
                ...globals.browser,
                ...globals.node,
                ...globals.amd,
                ...globals.commonjs,
                'msgpack': true,
                'mocha'  : true
            }
        },
        linterOptions  : {
            reportUnusedDisableDirectives: 'warn'
        },
        rules          : {
            'consistent-this'           : ['warn', 'self'],
            'curly'                     : ['error'],
            'default-case-last'         : ['error'],
            'default-param-last'        : ['error'],
            'eqeqeq'                    : ['error'],
            'prefer-const'              : ['warn'],
            'no-console'                : 'off',
            'no-eval'                   : ['error'],
            'no-duplicate-imports'      : ['error'],
            'no-promise-executor-return': ['error'],
            'no-self-compare'           : ['error'],
            'no-unreachable-loop'       : ['error'],
            'no-use-before-define'      : ['error'],
            'no-useless-assignment'     : ['error'],
            'no-unused-vars'            : ['warn', { 'args': 'none' }],
            'radix'                     : ['error'],
            'require-atomic-updates'    : ['error'],
            'max-depth'                 : ['error', 5],
            'max-nested-callbacks'      : ['error', 5],
            'max-params'                : ['error', 5],
        }
    },
    // TypeScript-specific configuration (must come AFTER base rules to override them)
    ...tseslint.configs.recommended.map(config => ({
        ...config,
        files: tsFiles,
    })),
    {
        name           : 'typescript overrides',
        files          : tsFiles,
        languageOptions: {
            parser       : tseslint.parser,
            parserOptions: {
                projectService : true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules          : {
            // Replace JS rules with TS equivalents
            'no-unused-vars'                           : 'off',
            '@typescript-eslint/no-unused-vars'        : ['warn', { 'args': 'none' }],
            'no-use-before-define'                     : 'off',
            '@typescript-eslint/no-use-before-define'  : ['error'],
            'default-param-last'                       : 'off',
            '@typescript-eslint/default-param-last'    : ['error'],

            // Turn off no-duplicate-imports for TS — import type + import from same module is valid
            'no-duplicate-imports'                     : 'off',

            // Allow this aliasing — needed for consistent-this pattern (const self = this)
            '@typescript-eslint/no-this-alias'         : 'off',

            // Relax some TS rules that are too strict for this codebase
            '@typescript-eslint/no-explicit-any'       : 'off',
            '@typescript-eslint/no-require-imports'    : 'off',
            '@typescript-eslint/no-empty-object-type'  : 'off',
        }
    },
    // Test files: allow chai-style unused expressions
    {
        name : 'test file overrides',
        files: ['test/**/*.ts'],
        rules: {
            '@typescript-eslint/no-unused-expressions': 'off',
        }
    },
    {
        ignores: ['coverage/*', 'dist/*']
    }
);
