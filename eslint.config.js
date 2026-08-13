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

            // Abbreviations are allowed across the project (companion to prevent-abbreviations
            // above) — we keep short, conventional names like `e`, `err`, `res`, `str`, `utils`.
            'unicorn/name-replacements'        : 'off',
            // Mocha test callbacks rely on `this` (this.timeout(), this.skip()) with regular
            // functions, and src uses the `const self = this` aliasing pattern (see no-this-assignment).
            'unicorn/no-this-outside-of-class' : 'off',
            // Tests intentionally exercise promise chains with .then()/.catch().
            'unicorn/prefer-await'             : 'off',
            // We keep descriptive boolean names (noSend, needNoSession, patternBased, progress, ...)
            // without forcing an is/has/should prefix.
            'unicorn/consistent-boolean-name'  : 'off',
            // Test helpers reassign module-scoped fixtures from within setup functions.
            'unicorn/no-top-level-assignment-in-function': 'off',
            // Private members use the `_name` convention, not #private fields (see prefer-class-fields).
            'unicorn/prefer-private-class-fields': 'off',
            // Isomorphic code must reference browser globals through globalThis (e.g. globalThis?.WebSocket)
            // so it does not throw a ReferenceError under Node.js.
            'unicorn/no-unnecessary-global-this': 'off',
            // The browser entry files intentionally expose Wampy & serializers on the global object.
            'unicorn/no-global-object-property-assignment': 'off',
            // Dynamic property existence checks (obj[key]) are intentional throughout the WAMP message handling.
            'unicorn/no-computed-property-existence-check': 'off',
            // http:// here is only the canonical MIT-license URL inside license banners.
            'unicorn/prefer-https'             : 'off',
            // Promise.try() and Uint8Array#toBase64() are too new for our supported browser/runtime range.
            'unicorn/prefer-promise-try'       : 'off',
            'unicorn/prefer-uint8array-base64' : 'off',
            // The public `version` field is intentionally kept at the top of the Wampy class.
            'unicorn/consistent-class-member-order': 'off',
            // Concise one-line JSDoc (`/** Validate uri */`) is the established style for member
            // and type documentation across src/ — expanding all of them to multiline adds noise.
            'unicorn/single-line-block-comment-style': 'off',
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


        }
    },
    // Test files: allow chai-style unused expressions
    {
        name : 'test file overrides',
        files: ['test/**/*.ts'],
        rules: {
            '@typescript-eslint/no-unused-expressions': 'off',
            // The plugin only tracks `done` when it is called from the test callback body.
            // Our tests hand it to Wampy option callbacks instead (`onError: function (e) { ... done(); }`,
            // `onClose: done`), which it cannot follow — every such test reports a false positive.
            'mocha/handle-done-callback'              : 'off',
        }
    },
    {
        ignores: ['coverage/*', 'dist/*']
    }
);
