const plugin = require("tailwindcss/plugin");
const { default: prefixNegativeModifiers } = require("tailwindcss/lib/util/prefixNegativeModifiers");
const { kebabCase } = require("lodash");

module.exports = plugin(({
	addUtilities, e, theme, variants,
}) => {
	const customUtilities = Object.entries(theme("customUtilities", {}));
	// Warn when there is no configuration for the plugin
	if (customUtilities.length === 0) console.warn("the tailwindcss-custom-native plugin does not have any configuration, so no utilities can/will be generated; this can be fixed by putting something like { keyName: {} } in `theme.customUtilities`");

	customUtilities.forEach(([key, { property, rename, addUtilitiesOptions }]) => {
		const configuration = Object.entries(theme(key, {}));
		// Warn when no property-value pairs were given in `theme` for this utility
		if (configuration.length === 0) {
			console.warn(`the custom utility ${key} does not have any configuration in \`theme\`, so no classes can/will be generated for this utility`);
			return;
		}

		// E.x. 'mixBlendMode' -> 'mix-blend-mode'
		const keyHyphenated = kebabCase(key);

		if (property === undefined) property = keyHyphenated;
		if (rename === undefined) rename = keyHyphenated;
		if (addUtilitiesOptions === undefined) addUtilitiesOptions = {};

		// Forbid specifying variants in addUtilitiesOptions
		if (Object.prototype.hasOwnProperty.call(addUtilitiesOptions, "variants")) throw new TypeError(`the specified addUtilitiesOptions ${addUtilitiesOptions} for the custom utility ${key} has unacceptable property \`variants\`. this can be fixed by removing that property from addUtilitiesOptions and instead specifying variants in the \`variants\` key in \`theme.customUtilities.${key}\``);

		const utilities = configuration.reduce((css, [name, value]) => {
			const className = rename === "" ? name : prefixNegativeModifiers(rename, name);

			css[`.${e(className)}`] = {
				[property]: value,
			};

			return css;
		}, {});

		addUtilities(utilities, { variants: variants(key, []), ...addUtilitiesOptions });
	});
});
