import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";


export default defineConfig([
    {
        ignores: [
            ".github/",
            "dist/",
            "node_modules/",
            "public/",
            "server/",
            "views/",
            "*.d.ts"
        ]
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
        plugins: { js },
        extends: ["js/recommended"]
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
        languageOptions: { globals: globals.browser }
    },
    tseslint.configs.recommended,
    pluginVue.configs["flat/essential"],
    {
        files: ["**/*.vue"],
        languageOptions: { parserOptions: { parser: tseslint.parser } }
    },
    {
        ignores: ["**/*.types.ts"],
        rules: {
            'no-unused-vars': ["warn", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "destructuredArrayIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_"
            }],
            "@typescript-eslint/no-unused-vars": ["warn", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "destructuredArrayIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_"
            }],
            "@typescript-eslint/no-explicit-any": "off",
            "vue/no-unused-vars": "off",
            "vue/require-v-for-key": "off",
            "semi": ["error", "always"]
        }
    },
    // enum types
    {
        files: ["**/*.types.ts"],
        rules: {
            "@typescript-eslint/no-unused-vars": "off"
        }
    }
]);
