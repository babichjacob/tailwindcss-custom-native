const { kebabCase } = require("lodash");

const single = ({ key, property, rename, addUtilitiesOptions = {} }) => {
  // E.x. 'mixBlendMode' -> 'mix-blend-mode'
  const keyHyphenated = kebabCase(key);

  if (property === undefined) property = keyHyphenated;
  if (rename === undefined) rename = keyHyphenated;

  return ({ addUtilities, e, theme, variants }) => {
    const configuration = Object.entries(theme(key, {}));
    if (configuration.length === 0) {
      console.warn(`the custom utility ${key} does not have any configuration in \`theme\`, so no classes can/will be generated`);
    }
    
    const utilities = configuration.reduce((css, [name, value]) => ({
      ...css,
      [rename === "" ? `.${e(`${name}`)}` : `.${e(`${rename}-${name}`)}`]: {
        [property]: value,
      },
    }), {});

    // This means a `variants` key in `addUtilitiesOptions` will override `specifiedVariants`!
    addUtilities(utilities, { variants: variants(key, []), ...addUtilitiesOptions });
  };
};

const multiple = (...options) =>
  (pluginHelpers) => {
    options.forEach((option) => single(option)(pluginHelpers));
  };

module.exports = (...options) => {
  // Determine which form of options is being used
  if (options.length === 0) {
    console.warn(
      "the tailwindcss-custom-native plugin was incorrectly called without any arguments/options; this can be fixed by passing at least one argument of the form { key, property?, rename?, addUtilitiesOptions? }"
    );
  } else if (options.length === 2 && !options[1].hasOwnProperty("key")) {
    // The old API is being used
    return single({ ...options[0], addUtilitiesOptions: options[1] });
  } else {
    return multiple(...options);
  }
};
