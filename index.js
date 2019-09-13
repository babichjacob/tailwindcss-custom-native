const { kebabCase } = require("lodash");

function single({ key, property, rename, addUtilitiesOptions }) {
  // E.x. 'mixBlendMode' -> 'mix-blend-mode'
  const keyHyphenated = kebabCase(key);

  if (property === undefined) {
    property = keyHyphenated;
  }

  if (rename === undefined) {
    rename = keyHyphenated;
  }

  if (addUtilitiesOptions === undefined) {
    addUtilitiesOptions = {};
  }

  return ({ addUtilities, e, theme, variants }) => {
    const newUtilities = {};

    for (const [name, value] of Object.entries(theme(key, {}))) {
      const className = rename === "" ? `.${e(`${name}`)}` : `.${e(`${rename}-${name}`)}`;

      newUtilities[className] = {
        [property]: value
      };
    }

    const specifiedVariants = variants(key, []);

    // This means a `variants` key in `addUtilitiesOptions` will override `specifiedVariants`!
    addUtilities(newUtilities, { variants: specifiedVariants, ...addUtilitiesOptions });
  };
}

function multiple(...configurations) {
  return pluginHelpers => {
    configurations.forEach(configuration => single(configuration)(pluginHelpers));
  };
}

module.exports = function(...args) {
  // Determine which form of arguments is being used
  if (args.length === 0) {
    console.warn(
      "customNative was called without any arguments; this can be fixed by passing at least one argument of the form { key, property, rename, addUtilitiesOptions }"
    );
  } else if (args.length === 2 && !args[1].hasOwnProperty("key")) {
    // The old API is being used
    return single({ ...args[0], addUtilitiesOptions: args[1] });
  } else {
    return multiple(...args);
  }
};
