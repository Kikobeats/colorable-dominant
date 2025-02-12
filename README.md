# colorable-dominant

![Last version](https://img.shields.io/github/tag/Kikobeats/colorable-dominant.svg?style=flat-square)
[![Coverage Status](https://img.shields.io/coveralls/Kikobeats/colorable-dominant.svg?style=flat-square)](https://coveralls.io/github/Kikobeats/colorable-dominant)
[![NPM Status](https://img.shields.io/npm/dm/colorable-dominant.svg?style=flat-square)](https://www.npmjs.org/package/colorable-dominant)

> Create ARIA-compliant color themes based on a predominant color palette. Similar to [react-image-palette](https://github.com/FormidableLabs/react-image-palette) but out of the box

**colorable-dominant** is based mayority in [react-image-palette](https://github.com/FormidableLabs/react-image-palette) but designed for be used leaving the process of get the most predominant colors out of the library.

You can use your favorite predominant colors extractor (such as [splashy](https://github.com/microlinkhq/splashy)) and then use this library for get the best [WCAG contrast standard](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html) combination.

## Install

```bash
$ npm install colorable-dominant --save
```

## Usage

```js
const colorableDominant = require('colorable-dominant')
const splashy = require('splashy')

const buffer = Buffer.from(await fetch('https://i.imgur.com/ZJDyOhn.jpg').then(res => res.arrayBuffer()))
const palette = await splashy(buffer)

console.log({ palette, ...colorableDominant(palette) })
// {
//   palette: [ '#941c1c', '#8c0c04', '#d58d74', '#ad685d', '#644430', '#ceb9ad' ],
//   backgroundColor: '#CEB9AD',
//   color: '#8C0C04',
//   alternativeColor: '#941C1C'
// }
```

## API

### colorableDominant(colors, [options])

#### colors

*Required*<br>
Type: `array`

A collection of a predominant colors, sorted from most to less predominant.

#### options

##### minContrast

Type: `number`<br>
Default: `4.5`

This is the [WCAG contrast ratio](https://www.w3.org/TR/WCAG20/#visual-audio-contrast) for considered a good combination of colors.

These contrast ratio is used for create color variations from the original colors in order to get a better (but still predominant) color present in original colors.

The value provided by default is a "AA" certification.

##### threshold

Type: `number`<br>
Default: `1.0`

The minimum [WCAG contrast ratio](https://www.w3.org/TR/WCAG20/#visual-audio-contrast) to considered a combination of colors.

The value means that combinations below this value will be discarded.

## Related

- [splashy](https://github.com/microlinkhq/splashy) – Given an image, extract predominant & palette colors.
- [color-microservice](https://github.com/Kikobeats/color-microservice) – Get color information from any URL image microservice.

## License

**colorable-dominant** © Formidable Labs, Released under the [MIT](https://github.com/Kikobeats/colorable-dominant/blob/master/LICENSE.md) License.<br>
Authored by Formidable Labs and maintained by Kiko Beats with help from [contributors](https://github.com/Kikobeats/colorable-dominant/contributors).

> [kikobeats.com](https://kikobeats.com) · GitHub [@Kiko Beats](https://github.com/Kikobeats) · X [@Kikobeats](https://x.com/Kikobeats)
