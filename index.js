const plugin = require("tailwindcss/plugin");
const { kebabCase } = require("lodash");

module.exports = plugin(({ addUtilities, e, theme, variants }) => {
  const customUtilities = Object.entries(theme("customUtilities", {}));
  if (customUtilities.length === 0) console.warn("the tailwindcss-custom-native plugin does not have any configuration, so no utilities can/will be generated; this can be fixed by putting something like { keyName: {} } in `theme.customUtilities`");

  customUtilities.forEach(([key, { property, rename, addUtilitiesOptions }]) => {
    const configuration = Object.entries(theme(key, {}));
    if (configuration.length === 0) {
      console.warn(`the custom utility ${key} does not have any configuration in \`theme\`, so no classes can/will be generated for this utility`);
      return;
    }

    // E.x. 'mixBlendMode' -> 'mix-blend-mode'
    const keyHyphenated = kebabCase(key);

    if (property === undefined) property = keyHyphenated;
    if (rename === undefined) rename = keyHyphenated;
    if (addUtilitiesOptions === undefined) addUtilitiesOptions = {};

    const utilities = configuration.reduce((css, [name, value]) => ({
      ...css,
      [rename === "" ? `.${e(`${name}`)}` : `.${e(`${rename}-${name}`)}`]: {
        [property]: value,
      },
    }), {});

    // This means a `variants` key in `addUtilitiesOptions` will override `specifiedVariants`!
    addUtilities(utilities, { variants: variants(key, []), ...addUtilitiesOptions });
  });
});
