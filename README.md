# 🧩 Tailwind CSS Custom Native Utilities
This Tailwind CSS plugin allows you to write configuration for your own custom utility in the `theme` and `variants` section of your config as though it were actually part of the framework. Just define it with a single line in the `plugins` section!

This should allow you to finally kill off leftover CSS and inline styles that have no accompanying plugin-made or native utility. Although you can replace other [plugins](https://github.com/aniftyco/awesome-tailwindcss#plugins) with this one, it's probably a good idea to use those instead because they're purpose-built and likely to create a better output.

# 💻 Installation

```bash
npm install --save-dev tailwindcss-custom-native
```

# 🛠 Basic usage

With this Tailwind configuration,

```js
module.exports = {
  theme: {
    // This utility is not native to Tailwind,
    mixBlendMode: {
      'screen': 'screen',
      'overlay': 'overlay',
    },
    // So we define it here!
    customUtilities: {
      mixBlendMode: {},
      // There are extra parameters for further customization -- see the advanced usage section
    },
  },

  plugins: [
    require('tailwindcss-custom-native'),
  ],
};
```

this CSS is generated:

```css
.mix-blend-mode-screen {
  mix-blend-mode: screen;
}

.mix-blend-mode-overlay {
  mix-blend-mode: overlay;
}
```

### Variants

When no variants are specified in the `variants` key of your config, no variants will be generated, as you saw above. (If you would prefer for `['responsive']` to be the default, I am open to changing it).

If you want variants (in the same config as above):

```js
module.exports = {
  theme: {
    mixBlendMode: {
      'screen': 'screen',
      'overlay': 'overlay',
    },
    customUtilities: {
      mixBlendMode: {},
    },
  },

  variants: {
    // All variants, whether added by plugin or not, are at your disposal
    mixBlendMode: ['hover', 'focus'],
  },

  plugins: [
    require('tailwindcss-custom-native'),
  ],
};
```

you get this additional CSS:

```css
.hover\:mix-blend-mode-screen:hover {
  mix-blend-mode: screen;
}
.hover\:mix-blend-mode-overlay:hover {
  mix-blend-mode: overlay;
}

.focus\:mix-blend-mode-screen:focus {
  mix-blend-mode: screen;
}
.focus\:mix-blend-mode-overlay:focus {
  mix-blend-mode: overlay;
}
```

# ⚙️ Full configuration

This plugin expects configuration of the form

```js
theme: {
  customUtilities: {
    key: { property, rename, addUtilitiesOptions },
    // Keep repeating this pattern for more utilities
  },
}
```

Where each parameter means:

- `key` (required, string) - The name of the key for your custom utility, as you wrote in the `theme` and `variants` section

- `property` (optional, string) - The CSS property that your utility is for

  When not specified, it defaults to kebab-casing (AKA hyphenating) the `key`. For example, `key: 'animationTimingFunction'` has corresponding `property: 'animation-timing-function'`).

  This parameter allows you to use a `key` that may be shorter than the property name, or completely different from it.

- `rename` (optional, string) - The prefix before each value name (from `theme[key]`) in the generated classes

  When not specified, it defaults to kebab-casing (AKA hyphenating) the `key`. For example, `key: 'mixBlendMode'` has corresponding `rename: 'mix-blend-mode'`).

  If set to the empty string (`''`), then there is no prefix and each generated class is just the value name.

- `addUtilitiesOptions` (optional, object) - Extra options to pass to the [`addUtilities`](https://tailwindcss.com/docs/plugins/#adding-utilities) function call.

  As of Tailwind 1.2.0, this just means the [`respectPrefix` and `respectImportant`](https://tailwindcss.com/docs/plugins/#prefix-and-important-preferences) options

# 📚 Examples

Specify `rename: ''` so you can write `blur-4` and `grayscale` instead of `filter-blur-4` and `filter-grayscale`:

```js
module.exports = {
  theme: {
    extend: {
      customUtilities: {
        filter: { rename: "" },
      },

      filter: {
        "grayscale": "grayscale(100%)",
        "blur-4": "blur(1rem)",
      },
    },
  },
  variants: {
    filter: ["responsive"],
  },
  plugins: [
    require("tailwindcss-custom-native"),
  ],
};
```

```css
.grayscale {
  filter: grayscale(100%);
}

.blur-4 {
  filter: blur(1rem);
}

/* Or whatever screen `sm` is in your config */
@media (min-width: 640px) {
  .sm\:grayscale {
    filter: grayscale(100%);
  }

  .sm\:blur-4 {
    filter: blur(1rem);
  }
}

/* ... and so on for the other screens */
```

Any property named with a `-` in front will have that moved to the front of the generated class name, just like the native [`margin`](https://tailwindcss.com/docs/margin/#negative-values) or [`z-index`](https://tailwindcss.com/docs/z-index/#negative-values) utilities do.

Let's say you want a section specifically for blur utilities, because they *really* have nothing to do with other kinds of CSS filters. Use `'blur'` as the `key` and `'filter'` as the `property`:

```js
module.exports = {
  theme: {
    extend: {
      blur: {
        '0': 'blur(0)',
        '1': 'blur(0.25rem)',
        '2': 'blur(0.5rem)',
        // ... as many numbers as you want
      },

      customUtilities: {
        blur: { property: 'filter' },
      },
    },
  },
  variants: {
    blur: ['active'],
  },
  plugins: [
    require('tailwindcss-custom-native'),
  ],
};
```

```css
.blur-0 {
  filter: blur(0);
}

.blur-1 {
  filter: blur(0.25rem);
}

.blur-2 {
  filter: blur(0.5rem);
}

.active\:blur-0:active {
  filter: blur(0);
}

.active\:blur-1:active {
  filter: blur(0.25rem);
}

.active\:blur-2:active {
  filter: blur(0.5rem);
}

/* and so on for the other numbers you specified */
```

In practice, you will probably need more than one custom utility, so just add another to the list:

```js
module.exports = {
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
    require("tailwindcss-custom-native"),
  ],
};
```

```css
.list-checkmark {
  list-style-image: url('/img/checkmark.png');
}

.scroll-immediately {
  scroll-behavior: auto;
}

.scroll-smoothly {
  scroll-behavior: smooth;
}
```

This plugin can piggyback off of other plugins, especially those that register new variants or are missing relevant utilities. 

In this case, it is used to add some `content` utilities that have `before` and `after` pseudoselector variants, as provided by `tailwindcss-pseudo`:

```js
module.exports = {
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
    require("tailwindcss-pseudo")(),
    require("tailwindcss-custom-native"),
  ],
};
```

```css
.content-empty {
  content: "";
}
.content-smile {
  content: "\1F60A";
}
.content-checkmark {
  content: url(/img/checkmark.png);
}

.before\:content-empty::before {
  content: "";
}
.before\:content-smile::before {
  content: "\1F60A";
}
.before\:content-checkmark::before {
  content: url(/img/checkmark.png);
}

.after\:content-empty::after {
  content: "";
}
.after\:content-smile::after {
  content: "\1F60A";
}
.after\:content-checkmark::after {
  content: url(/img/checkmark.png);
}
```

## 😵 Help! I have a question

[Create an issue](https://github.com/babichjacob/tailwindcss-custom-native/issues/new) and I'll try to help.

## 😡 Fix! There is something that needs improvement

[Create an issue](https://github.com/babichjacob/tailwindcss-custom-native/issues/new) or [pull request](https://github.com/babichjacob/tailwindcss-custom-native/pulls) and I'll try to fix.

## 📄 License

MIT

---

*Repository preview image generated with [GitHub Social Preview](https://social-preview.pqt.dev/)*
