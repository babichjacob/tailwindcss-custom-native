This Tailwind CSS plugin allows you to write configuration for your own custom utility in the `theme` and `variants` section of your config as though it were actually part of the framework. Just define it with a single line in the `plugins` section! 

This should allow you to finally kill off leftover CSS and inline styles that have no accompanying plugin-made or native utility. Although you can replace other [plugins](https://github.com/aniftyco/awesome-tailwindcss#plugins) with this one, it's probably a good idea to use those instead because they're purpose-built and likely to create a better output.

## Installation
```bash
npm install --save-dev tailwindcss-custom-native
```

## Basic usage
With this Tailwind configuration,

```js
const customNative = require('tailwindcss-custom-native');

module.exports = {
  theme: {
    ...,
    
    // This utility is not native to Tailwind,
    mixBlendMode: {
      'screen': 'screen',
      'overlay': 'overlay',
    }
  },
  
  ...
  
  plugins: [
    // So we define it down here!
    customNative({key: 'mixBlendMode'}),
    // There are extra parameters for further customization -- see the advanced usage section
  ]
}
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
const customNative = require('tailwindcss-custom-native');

module.exports = {
  theme: {
    ...,
    
    mixBlendMode: {
      'screen': 'screen',
      'overlay': 'overlay',
    }
  },
  
  variants: {
    ...,
    
    // All variants, whether added by plugin or not, are at your disposal
    mixBlendMode: ['hover', 'focus'],
  },
  
  plugins: [
    customNative({key: 'mixBlendMode'}),
  ]
}
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


## Advanced usage
The complete function signature of `customNative` is:
```js
function({ key, property, rename }, addUtilitiesOptions={}) {...}
```
Where each parameter means:
* `key` (required, string) - The key name in the `theme` and `variants` section for your custom utility
* `property` (optional, string) - The CSS property that your utility is for. When not specified, it defaults to kebab-casing (AKA hyphenating) the `key` (e.x. `key: 'animationTimingFunction'` has corresponding `property: 'animation-timing-function'`). You may want to use this in cases where your `key` name disagrees with the property name or you want to shorten it
* `rename` (optional, string) - The preceding string that comes before each name (from your `theme` configuration) in the generated class name. When not specified, it defaults to kebab-casing (AKA hyphenating) the `key`. If set to the empty string (`''`), then there is no preceding name and each generated class name is just the name from each `theme` pair. See examples to clear things up
* `addUtilitiesOptions` - Extra options to pass to the [`addUtilities`](https://next.tailwindcss.com/docs/plugins/#adding-utilities) function call. At the time of writing, this just means the [`respectPrefix` and `respectImportant`](https://next.tailwindcss.com/docs/plugins/#prefix-and-important-preferences) options

## Examples
Specifying `rename: ''` so you can write `blur-1` and `grayscale` instead of `filter-blur-1` or `filter-grayscale`:

```js
const customNative = require('tailwindcss-custom-native');

module.exports = {
  theme: {
    extend: {
      filter: {
      	'grayscale': 'grayscale(100%)',
        'blur-4': 'blur(1rem)',
      }
    }
  },
  variants: {
    filter: ['responsive'],
  },
  plugins: [
    customNative({key: 'filter', rename: ''}),
  ]
}
```
```css
.grayscale {
  filter: grayscale(100%)
}

.blur-4 {
  filter: blur(1rem)
}

// Or whatever screen `sm` is in your config
@media (min-width: 640px)
  .sm\:grayscale {
    filter: grayscale(100%)
  }

  .sm\:blur-4 {
    filter: blur(1rem)
  }
}

/* ... and so on for the other screens */
```

Let's say you want a section specifically for blur utilities. Using `'blur'` as the key and `property: 'filter'`:
```js
const customNative = require('tailwindcss-custom-native');

module.exports = {
  theme: {
    extend: {
      blur: {
        '0': 'blur(0)',
        '1': 'blur(0.25rem)',
        '2': 'blur(0.5rem)',
        ... // as many numbers as you want
      }
    }
  },
  variants: {
    blur: ['active'],
  },
  plugins: [
    customNative({key: 'blur', property: 'filter'}),
  ]
}
```
```css
.blur-0 {
  filter: blur(0)
}

.blur-1 {
  filter: blur(0.25rem)
}

.blur-2 {
  filter: blur(0.5rem)
}

.active\:blur-0:active {
  filter: blur(0)
}

.active\:blur-1:active {
  filter: blur(0.25rem)
}

.active\:blur-2:active {
  filter: blur(0.5rem)
}

/* and so on for the other numbers you specified */
```

You can (and probably will in practice) use the plugin more than once to create multiple utilities:
```js
const customNative = require('tailwindcss-custom-native');

module.exports = {
  theme: {
    extend: {
      listStyleImage: {
        'checkmark': "url('/img/checkmark.png')"
      },
      
      scrollBehavior: {
        'immediately': 'auto',
        'smoothly': 'smooth'
      }
    }
  },
  variants: {
    
  },
  plugins: [
    customNative({key: 'listStyleImage', rename: 'list'}),
    customNative({key: 'scrollBehavior', rename: 'scroll'}),
  ]
}
```
```css
.list-checkmark {
  list-style-image: url('/img/checkmark.png')
}

.scroll-immediately {
  scroll-behavior: auto
}

.scroll-smoothly {
  scroll-behavior: smooth
}
```

Another good idea is to use it in conjunction with other plugins (especially ones that are missing relevant utilities or register new variants), in this case `tailwindcss-pseudo`:
```js
module.exports = {
  theme: {
    extend: {
      content: {
        'empty': "''",
        'smile': "'\\1F60A'",
        'checkmark': 'url(/img/checkmark.png)',
      },
      
      // This is tailwindcss-pseudo config
      pseudo: {
        'before': 'before',
        'after': 'after',
      }
    }
  },
  variants: {
    content: ['before', 'after']
  },
  plugins: [
    // Untested: this probably has to come first so that it can register the variant
    require('tailwindcss-pseudo')(),
    require('tailwindcss-custom-native')({key: 'content'}),
  ]
}

```
```css
.content-empty {
  content: ''
}
.content-smile {
  content: '\1F60A'
}
.content-checkmark {
  content: url(/img/checkmark.png)
}

.before\:content-empty::before {
  content: ''
}
.before\:content-smile::before {
  content: '\1F60A'
}
.before\:content-checkmark::before {
  content: url(/img/checkmark.png)
}

.after\:content-empty::after {
  content: ''
}
.after\:content-smile::after {
  content: '\1F60A'
}
.after\:content-checkmark::after {
  content: url(/img/checkmark.png)
}
```

## License and Contributing
MIT licensed. There are no contributing guidelines. Just do whatever you want to point out an issue or feature request and I'll work with it.
