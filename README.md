
# @phosphor-icons/core

<!-- BEGIN_LOGO -->
<img src="/.github/logo.png" width="128" align="right" />
<!-- END_LOGO -->

This repository hosts the raw SVGs and catalog data – including tags, categories, and release versions – of all icons in the [Phosphor Icons](https://phosphoricons.com) family. It serves as the basis for our fuzzy-search on our website and other tools, and as a dev dependency in the build process in some of our framework-specific libraries. You may find this package is useful to you in implementing a port of Phosphor to your preferred framework, or as a source of truth for our current SVG assets.

[![NPM](https://img.shields.io/npm/v/@phosphor-icons/core.svg?style=flat-square)](https://www.npmjs.com/package/@phosphor-icons/core)
[![GitHub stars](https://img.shields.io/github/stars/phosphor-icons/core?style=flat-square&label=Star)](https://github.com/phosphor-icons/core)
[![GitHub forks](https://img.shields.io/github/forks/phosphor-icons/core?style=flat-square&label=Fork)](https://github.com/phosphor-icons/core/fork)
[![GitHub watchers](https://img.shields.io/github/watchers/phosphor-icons/core?style=flat-square&label=Watch)](https://github.com/phosphor-icons/core)
[![Follow on GitHub](https://img.shields.io/github/followers/rektdeckard?style=flat-square&label=Follow)](https://github.com/rektdeckard)

## Installation

```bash
pnpm add @phosphor-icons/core
#^ or whatever package manager you use
```

## Assets

This package exposes all icons as SVG assets, grouped by weight, under the `/assets` directory (i.e. `/assets/<weight>/<kebab-name>-<weight>.svg`), and also aliased so that `/assets` can be omitted from the path in projects that support import maps. These files can be used as needed for custom implementations or ports. Your framework and build tooling may require custom type declarations to recognize and transform `"*.svg"` files into modules.

### Example

```ts
import ghostDuotone from "@phosphor-icons/core/duotone/ghost-duotone.svg";
```

Using [SVGR](https://react-svgr.com/docs/webpack/#use-with-url-loader-or-file-loader) (includes `create-react-app` projects):

```tsx
import { ReactComponent as GhostDuotone } from "@phosphor-icons/core/duotone/ghost-duotone.svg";
```

## Catalog

This package exposes a named export `icons`, which is an array of `IconEntry` objects represententing each icon, its name in both `kebab-case` and `PascalCase`, the categories and tags associated with it, as well as the version it was published in and the most recent version it was updated in.

It also includes an optional `alias` field, which if present, contains deprecated names for the icon for backwards-compatibility purposes, and a `codepoint` field, which is a stable decimal representation of its Unicode code point in font implementations such as [@phosphor-icons/web](https://github.com/phosphor-icons/web) and [@phosphor-icons/flutter](https://github.com/phosphor-icons/flutter).

```ts
interface IconEntry {
  name: string; // "cloud-lightning"
  pascal_name: string; // "CloudLightning"
  alias?: {
    name: string;
    pascal_name: string;
  };
  codepoint: number;
  categories: readonly IconCategory[]; // ["weather"]
  tags: readonly string[]; // ["*updated*", "meteorology", "cloudy", "overcast", "stormy", "thunderstorm"]
  published_in: number; // 1.0
  updated_in: number; // 1.4
}
```

> [!NOTE]
> Duotone icons rely on overlaying two glyphs (a background and foreground layer), and thus use 2 codepoints. All codepoint bases are even numbers, so the codepoints associated with duotone icons are `codepoint` and `codepoint + 1`. The `codepoint` feature is not yet stabilized, and should only be relied upon in versions `>=2.1.0`.

An additional type export, `PhosphorIcon`, represents the literal type of the `icons` list. You can use it to extract narrowed types such as *valid icon names*, which can be useful for constraining parameter types in ports:

```ts
type IconName = PhosphorIcon["name"];
/* type IconName = "function" | "address-book" | "air-traffic-control" | "buildings" | "airplane" |
 *                 "airplane-in-flight" | "airplane-landing" | "airplane-takeoff" | "airplane-tilt" |
 *                 "airplay" | ... 1237 more ... | "youtube-logo"
 */
```

<!-- BEGIN_LINKS -->
## Our Projects

- [@phosphor-icons/homepage](https://github.com/phosphor-icons/homepage) ▲ Phosphor homepage and general info
- [@phosphor-icons/core](https://github.com/phosphor-icons/core) ▲ Phosphor icon assets and catalog
- [@phosphor-icons/elm](https://github.com/phosphor-icons/phosphor-elm) ▲ Phosphor icons for Elm
- [@phosphor-icons/figma](https://github.com/phosphor-icons/figma) ▲ Phosphor icons Figma plugin
- [@phosphor-icons/flutter](https://github.com/phosphor-icons/flutter) ▲ Phosphor IconData library for Flutter
- [@phosphor-icons/pack](https://github.com/phosphor-icons/pack) ▲ Phosphor web font stripper to generate minimal icon bundles
- [@phosphor-icons/penpot](https://github.com/phosphor-icons/penpot) ▲ Phosphor icons Penpot plugin
- [@phosphor-icons/react](https://github.com/phosphor-icons/react) ▲ Phosphor icon component library for React
- [@phosphor-icons/sketch](https://github.com/phosphor-icons/sketch) ▲ Phosphor icons Sketch plugin
- [@phosphor-icons/swift](https://github.com/phosphor-icons/swift) ▲ Phosphor icon component library for SwiftUI
- [@phosphor-icons/theme](https://github.com/phosphor-icons/theme) ▲ A VS Code (and other IDE) theme with the Phosphor color palette
- [@phosphor-icons/unplugin](https://github.com/phosphor-icons/unplugin) ▲ A multi-framework bundler plugin for generating Phosphor sprite sheets
- [@phosphor-icons/vue](https://github.com/phosphor-icons/vue) ▲ Phosphor icon component library for Vue
- [@phosphor-icons/web](https://github.com/phosphor-icons/web) ▲ Phosphor icons for Vanilla JS
- [@phosphor-icons/webcomponents](https://github.com/phosphor-icons/webcomponents) ▲ Phosphor icons as Web Components

## Community Projects

- [adamglin0/compose-phosphor-icons](https://github.com/adamglin0/compose-phosphor-icon) ▲ Phosphor icons for Compose Multiplatform
- [altdsoy/phosphor_icons](https://github.com/altdsoy/phosphor_icons) ▲ Phosphor icons for Phoenix and TailwindCSS
- [amPerl/egui-phosphor](https://github.com/amperl/egui-phosphor) ▲ Phosphor icons for egui apps (Rust)
- [babakfp/phosphor-icons-svelte](https://github.com/babakfp/phosphor-icons-svelte) ▲ Phosphor icons for Svelte apps
- [brettkolodny/phosphor-lustre](https://github.com/brettkolodny/phosphor-lustre) ▲ Phosphor icons for Lustre
- [cellularmitosis/phosphor-uikit](https://github.com/cellularmitosis/phosphor-uikit) ▲ XCode asset catalog generator for Phosphor icons (Swift/UIKit)
- [cjohansen/phosphor-clj](https://github.com/cjohansen/phosphor-clj) ▲ Phosphor icons as Hiccup for Clojure and ClojureScript
- [codeat3/blade-phosphor-icons](https://github.com/codeat3/blade-phosphor-icons) ▲ Phosphor icons in your Laravel Blade views
- [dreamRs/phosphor-r](https://github.com/dreamRs/phosphoricons) ▲ Phosphor icon wrapper for R documents and applications
- [duongdev/phosphor-react-native](https://github.com/duongdev/phosphor-react-native) ▲ Phosphor icon component library for React Native
- [haruaki07/phosphor-svelte](https://github.com/haruaki07/phosphor-svelte) ▲ Phosphor icons for Svelte apps
- [IgnaceMaes/ember-phosphor-icons](https://github.com/IgnaceMaes/ember-phosphor-icons) ▲ Phosphor icons for Ember apps
- [iota-uz/icons](https://github.com/iota-uz/icons) ▲ Phosphor icons as Templ components (Go)
- [jajuma/phosphorhyva](https://github.com/JaJuMa-GmbH/phosphor-hyva) ▲ Phosphor icons for Magento 2 & Mage-OS with Hyvä Theme
- [Kitten](https://kitten.small-web.org/reference/#icons) ▲ Phosphor icons integrated by default in Kitten
- [lucagoslar/phosphor-css](https://github.com/lucagoslar/phosphor-css) ▲ CSS wrapper for Phosphor SVG icons
- [maful/ruby-phosphor-icons](https://github.com/maful/ruby-phosphor-icons) ▲ Phosphor icons for Ruby and Rails applications
- [meadowsys/phosphor-svgs](https://github.com/meadowsys/phosphor-svgs) ▲ Phosphor icons as Rust string constants
- [mwood/tamagui-phosphor-icons](https://github.com/mwood23/tamagui-phosphor-icons) ▲ Phosphor icons for Tamagui
- [noozo/phosphoricons_elixir](https://github.com/noozo/phosphoricons_elixir) ▲ Phosphor icons as SVG strings for Elixir/Phoenix
- [oyedejioyewole/nuxt-phosphor-icons](https://github.com/oyedejioyewole/nuxt-phosphor-icons) ▲ Phosphor icons integration for Nuxt
- [pepaslabs/phosphor-uikit](https://github.com/pepaslabs/phosphor-uikit) ▲ Xcode asset catalog generator for Swift/UIKit
- [raycast/phosphor-icons](https://www.raycast.com/marinsokol/phosphor-icons) ▲ Phosphor icons Raycast extension
- [reatlat/eleventy-plugin-phosphoricons](https://github.com/reatlat/eleventy-plugin-phosphoricons) ▲ An Eleventy shortcode plugin to embed icons as inline SVGs
- [robruiz/wordpress-phosphor-icons-block](https://github.com/robruiz/phosphor-icons-block) ▲ Phosphor icon block for use in WordPress v5.8+
- [sachaw/solid-phosphor](https://github.com/sachaw/solid-phosphor) ▲ Phosphor icons for SolidJS
- [SeanMcP/phosphor-astro](https://github.com/SeanMcP/phosphor-astro) ▲ Phosphor icons as Astro components
- [SorenHolstHansen/phosphor-leptos](https://github.com/SorenHolstHansen/phosphor-leptos) ▲ Phosphor icon component library for Leptos apps (Rust)
- [vnphanquang/phosphor-icons-tailwindcss](https://github.com/vnphanquang/phosphor-icons-tailwindcss) ▲ TailwindCSS plugin for Phosphor icons
- [wireui/phosphoricons](https://github.com/wireui/phosphoricons) ▲ Phosphor icons for Laravel

If you've made a port of Phosphor and you want to see it here, just open a PR [here](https://github.com/phosphor-icons/homepage)!

## License

MIT © [Phosphor Icons](https://github.com/phosphor-icons)
<!-- END_LINKS -->
