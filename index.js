const { kebabCase } = require('lodash');

module.exports = function({ key, property, rename }, addUtilitiesOptions={}) {
	// E.x. 'mixBlendMode' -> 'mix-blend-mode'
	const keyHyphenated = kebabCase(key);
	
	if (property === undefined) {
		property = keyHyphenated;
	}
	
	if (rename === undefined) {
		rename = keyHyphenated;
	}
	
	return ({addUtilities, e, theme, variants }) => {
		const newUtilities = {};
		
		for (const [name, value] of Object.entries(theme(key, {}))) {
			const className = rename === '' ? `.${e(`${name}`)}`: `.${e(`${rename}-${name}`)}`;
			
			newUtilities[className] = {
				[property]: value,
			};
		}
		
		const specifiedVariants = variants(key, []);
		
		// This means a `variants` key in `addUtilitiesOptions` will override `specifiedVariants`!
		addUtilities(newUtilities, {variants: specifiedVariants, ...addUtilitiesOptions});
	};
};
