import assert from "assert";
import cssMatcher from "jest-matcher-css";
import { merge } from "lodash";
import { describe, it } from "mocha";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
// @ts-ignore
import tailwindcssPseudo from "tailwindcss-pseudo";

import thisPlugin from "../src/index";
import { TailwindCSSConfig } from "../src/types";


const generatePluginCss = (config: TailwindCSSConfig): Promise<string> => postcss(
	tailwindcss(
		merge({
			theme: {},
			corePlugins: false,
			plugins: [
				thisPlugin,
			],
		} as TailwindCSSConfig, config),
	),
).process("@tailwind utilities", {
	from: undefined,
}).then((result) => result.css);

const assertCSS = (actual: string, expected: string): void => {
	const { pass, message } = cssMatcher(actual, expected);
	assert.ok(pass, message());
};

describe("tailwindcss-custom-native", () => {
	it("works when there's just a key and no extra config", async () => {
		assertCSS(await generatePluginCss({
			theme: {
				mixBlendMode: {
					screen: "screen",
					overlay: "overlay",
				},
				customUtilities: {
					mixBlendMode: {},
				},
			},

			plugins: [
				thisPlugin,
			],
		}),
			`
			.mix-blend-mode-screen {
				mix-blend-mode: screen;
			}

			.mix-blend-mode-overlay {
				mix-blend-mode: overlay;
			}
		`);
	});

	it("variants (hover and focus) with key and no extra config", async () => {
		assertCSS(await generatePluginCss({
			theme: {
				mixBlendMode: {
					screen: "screen",
					overlay: "overlay",
				},
				customUtilities: {
					mixBlendMode: {},
				},
			},

			variants: {
				mixBlendMode: ["hover", "focus"],
			},

			plugins: [
				thisPlugin,
			],
		}),
		`
			.mix-blend-mode-screen {
				mix-blend-mode: screen;
			}
			.mix-blend-mode-overlay {
				mix-blend-mode: overlay;
			}

			.hover\\:mix-blend-mode-screen:hover {
				mix-blend-mode: screen;
			}
			.hover\\:mix-blend-mode-overlay:hover {
				mix-blend-mode: overlay;
			}

			.focus\\:mix-blend-mode-screen:focus {
				mix-blend-mode: screen;
			}
			.focus\\:mix-blend-mode-overlay:focus {
				mix-blend-mode: overlay;
			}
		`);
	});

	

	it("rename with responsive variants", async () => {
		assertCSS(await generatePluginCss({
			theme: {
				extend: {
					customUtilities: {
						filter: { rename: "" },
					},

					filter: {
						grayscale: "grayscale(100%)",
						"blur-4": "blur(1rem)",
					},
				},
			},
			variants: {
				filter: ["responsive"],
			},
			plugins: [
				thisPlugin,
			],
		}),
		`
			.grayscale {
				filter: grayscale(100%);
			}

			.blur-4 {
				filter: blur(1rem);
			}

			@media (min-width: 640px) {
				.sm\\:grayscale {
					filter: grayscale(100%);
				}

				.sm\\:blur-4 {
					filter: blur(1rem);
				}
			}

			@media (min-width: 768px) {
				.md\\:grayscale {
					filter: grayscale(100%);
				}

				.md\\:blur-4 {
					filter: blur(1rem);
				}
			}

			@media (min-width: 1024px) {
				.lg\\:grayscale {
					filter: grayscale(100%);
				}

				.lg\\:blur-4 {
					filter: blur(1rem);
				}
			}

			@media (min-width: 1280px) {
				.xl\\:grayscale {
					filter: grayscale(100%);
				}

				.xl\\:blur-4 {
					filter: blur(1rem);
				}
			}
		`);
	});

	

	it("property with active variants", async () => {
		assertCSS(await generatePluginCss({
			theme: {
				extend: {
					blur: {
						0: "blur(0)",
						1: "blur(0.25rem)",
						2: "blur(0.5rem)",
					},

					customUtilities: {
						blur: { property: "filter" },
					},
				},
			},
			variants: {
				blur: ["active"],
			},
			plugins: [
				thisPlugin,
			],
		}),
		`
			.blur-0 {
				filter: blur(0);
			}
			.blur-1 {
				filter: blur(0.25rem);
			}
			.blur-2 {
				filter: blur(0.5rem);
			}

			.active\\:blur-0:active {
				filter: blur(0);
			}
			.active\\:blur-1:active {
				filter: blur(0.25rem);
			}
			.active\\:blur-2:active {
				filter: blur(0.5rem);
			}
		`);
	});

	

	it("multiple custom utilities with rename", async () => {
		assertCSS(await generatePluginCss({
			theme: {
				customUtilities: {
					listStyleImage: { rename: "list" },
					scrollBehavior: { rename: "scroll" },
				},

				listStyleImage: {
					checkmark: "url('/img/checkmark.png')",
				},

				scrollBehavior: {
					immediately: "auto",
					smoothly: "smooth",
				},
			},
			variants: {},
			plugins: [
				thisPlugin,
			],
		}),
		`
			.list-checkmark {
				list-style-image: url('/img/checkmark.png');
			}

			.scroll-immediately {
				scroll-behavior: auto;
			}

			.scroll-smoothly {
				scroll-behavior: smooth;
			}
		`);
	});

	
	

	it("can use other plugins (tailwindcss-pseudo)'s variants", async () => {
		assertCSS(await generatePluginCss({
			theme: {
				extend: {
					content: {
						empty: "''",
						smile: "'\\1F60A'",
						checkmark: "url(/img/checkmark.png)",
					},

					customUtilities: {
						content: {},
					},

					// This is tailwindcss-pseudo config
					pseudo: {
						before: "before",
						after: "after",
					},
				},
			},
			variants: {
				content: ["before", "after"],
			},
			plugins: [
				tailwindcssPseudo(),
				thisPlugin,
			],
		}),
		`
			.empty {
				content: '';
			}
			.content-empty {
				content: '';
			}
			.content-smile {
				content: '\\1F60A';
			}
			.content-checkmark {
				content: url(/img/checkmark.png);
			}

			.before\\:content-empty::before {
				content: '';
			}
			.before\\:content-smile::before {
				content: '\\1F60A';
			}
			.before\\:content-checkmark::before {
				content: url(/img/checkmark.png);
			}

			.after\\:content-empty::after {
				content: '';
			}
			.after\\:content-smile::after {
				content: '\\1F60A';
			}
			.after\\:content-checkmark::after {
				content: url(/img/checkmark.png);
			}
		`);
	});

	
	
	

	it("negative properties are prefixed with - without variants", async () => {
		assertCSS(await generatePluginCss({
			theme: {
				extend: {
					customUtilities: {
						scaleY: { property: "transform" },
					},
					scaleY: {
						"0%": "scaleY(0%)",
						"-50%": "scaleY(-50%)",
						"-100%": "scaleY(-100%)",
						"-200%": "scaleY(-200%)",
					},
				},
			},
			variants: {
			},
			plugins: [
				thisPlugin,
			],
		}),
		`
			.scale-y-0\\% {
				transform: scaleY(0%)
			}

			.-scale-y-50\\% {
				transform: scaleY(-50%)
			}

			.-scale-y-100\\% {
				transform: scaleY(-100%)
			}

			.-scale-y-200\\% {
				transform: scaleY(-200%)
			} 
		`);
	});

	
	

	it("negative properties are prefixed with - when renamed without variants", async () => {
		assertCSS(await generatePluginCss({
			theme: {
				margin: {
					"-4": "-1rem",
					"-2": "-0.5rem",
					0: "0",
					1: "0.25rem",
				},
				customUtilities: {
					margin: { rename: "outside-space" },
				},
			},
			variants: {
				margin: [],
			},
			plugins: [
				thisPlugin,
			],
		}),
		`
			.outside-space-0 {
				margin: 0;
			}

			.outside-space-1 {
				margin: 0.25rem;
			}

			.-outside-space-4 {
				margin: -1rem;
			}

			.-outside-space-2 {
				margin: -0.5rem;
			}
		`);
	});

	
	

	it("negative properties are prefixed with - with variants", async () => {
		assertCSS(await generatePluginCss({
			theme: {
				extend: {
					customUtilities: {
						scaleX: { property: "transform" },
					},
					scaleX: {
						0: "scaleX(0%)",
						"-0.5": "scaleX(-50%)",
						"-1": "scaleX(-100%)",
						"-2": "scaleX(-200%)",
					},
				},
			},
			variants: {
				scaleX: ["focus", "group-hover"],
			},
			plugins: [
				thisPlugin,
			],
		}),
		`
			.scale-x-0 {
				transform: scaleX(0%);
			}
			.-scale-x-0\\.5 {
				transform: scaleX(-50%);
			}
			.-scale-x-1 {
				transform: scaleX(-100%);
			}
			.-scale-x-2 {
				transform: scaleX(-200%);
			}

			.focus\\:scale-x-0:focus {
				transform: scaleX(0%);
			}
			.focus\\:-scale-x-0\\.5:focus {
				transform: scaleX(-50%);
			}
			.focus\\:-scale-x-1:focus {
				transform: scaleX(-100%);
			}
			.focus\\:-scale-x-2:focus {
				transform: scaleX(-200%);
			}

			.group:hover .group-hover\\:scale-x-0 {
				transform: scaleX(0%);
			}
			.group:hover .group-hover\\:-scale-x-0\\.5 {
				transform: scaleX(-50%);
			}
			.group:hover .group-hover\\:-scale-x-1 {
				transform: scaleX(-100%);
			}
			.group:hover .group-hover\\:-scale-x-2 {
				transform: scaleX(-200%);
			}
		`);
	});

	

	
	

	it("negative properties are prefixed with - when renamed with variants", async () => {
		assertCSS(await generatePluginCss({
			theme: {
				tracking: {
					"-3": "-3px",
					"-2": "-2px",
					"-1": "-1px",
					0: "0",
					1: "1px",
				},
				customUtilities: {
					// Just ignore the fact this is not a real CSS property
					tracking: { rename: "letter-spacing" },
				},
			},
			variants: {
				tracking: ["even", "disabled"],
			},
			plugins: [
				thisPlugin,
			],
		}),
		`
			.letter-spacing-0 {
				tracking: 0;
			}
			.letter-spacing-1 {
				tracking: 1px;
			}
			.-letter-spacing-3 {
				tracking: -3px;
			}
			.-letter-spacing-2 {
				tracking: -2px;
			}
			.-letter-spacing-1 {
				tracking: -1px;
			}

			.even\\:letter-spacing-0:nth-child(even) {
				tracking: 0;
			}
			.even\\:letter-spacing-1:nth-child(even) {
				tracking: 1px;
			}
			.even\\:-letter-spacing-3:nth-child(even) {
				tracking: -3px;
			}
			.even\\:-letter-spacing-2:nth-child(even) {
				tracking: -2px;
			}
			.even\\:-letter-spacing-1:nth-child(even) {
				tracking: -1px;
			}

			.disabled\\:letter-spacing-0:disabled {
				tracking: 0;
			}
			.disabled\\:letter-spacing-1:disabled {
				tracking: 1px;
			}
			.disabled\\:-letter-spacing-3:disabled {
				tracking: -3px;
			}
			.disabled\\:-letter-spacing-2:disabled {
				tracking: -2px;
			}
			.disabled\\:-letter-spacing-1:disabled {
				tracking: -1px;
			}
		`);
	});

	
});

