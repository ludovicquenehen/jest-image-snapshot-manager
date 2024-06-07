module.exports = {
  root: true,
  extends: ["plugin:vue/vue3-essential", "prettier"],
  plugins: ["prettier"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "no-undef": "off", // need for auto import
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
        singleAttributePerLine: true,
      },
    ], // include prettier

    // function and variables naming convention
    camelcase: [
      "error",
      {
        properties: "always",
      },
    ],

    // common vue rules
    "vue/attributes-order": "error",
    "vue/require-default-prop": "off",
    "vue/require-explicit-emits": "error",
    "vue/order-in-components": "off",
    "vue/no-mutating-props": "error",
    "vue/attribute-hyphenation": "error",
    "vue/no-v-html": "error",
    "vue/require-prop-types": "error",
    "vue/v-slot-style": "off",
    "vue/v-bind-style": "error",
    "vue/valid-v-for": "off",
    "vue/require-v-for-key": "off",
    "vue/return-in-computed-property": "error",
    "vue/component-name-in-template-casing": [
      "error",
      "PascalCase",
      {
        registeredComponentsOnly: false,
      },
    ],

    "vue/multi-word-component-names": "off",
    "vue/html-indent": "off",
  },
};
