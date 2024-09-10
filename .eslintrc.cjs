module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-essential',
        '@vue/eslint-config-typescript'
    ],
    parserOptions: {
        parser: "@typescript-eslint/parser",
        sourceType: "module",
        ecmaVersion: 2023,
    },
    rules: {
        'no-unused-vars': "warn",
        "vue/no-unused-vars": "off",
        "vue/require-v-for-key": "off",
        "semi": ["error", "always"]
    }
};
