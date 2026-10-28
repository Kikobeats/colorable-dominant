'use strict'

const SHORTHAND_HEX = /^#([a-f\d])([a-f\d])([a-f\d])$/i
const HEX = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const parseHex = value => {
  const shorthand = SHORTHAND_HEX.exec(value)
  if (shorthand) return shorthand.slice(1).map(digit => parseInt(digit + digit, 16))
  const hex = HEX.exec(value)
  if (hex) return hex.slice(1).map(pair => parseInt(pair, 16))
  throw new Error(`Unable to parse color from string "${value}"`)
}

const toHexPair = channel => ('0' + Number(channel.toFixed(0)).toString(16).toUpperCase()).slice(-2)

const toHex = rgb => '#' + rgb.map(toHexPair).join('')

const linearize = channel => {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
}

const luminance = ([red, green, blue]) =>
  0.2126 * linearize(red) + 0.7152 * linearize(green) + 0.0722 * linearize(blue)

const contrastRatio = (rgb, otherRgb) => {
  const lum1 = luminance(rgb)
  const lum2 = luminance(otherRgb)
  return lum1 > lum2 ? (lum1 + 0.05) / (lum2 + 0.05) : (lum2 + 0.05) / (lum1 + 0.05)
}

const isDark = ([red, green, blue]) => (red * 2126 + green * 7152 + blue * 722) / 10000 < 128

const rgbToHsl = rgb => {
  const r = rgb[0] / 255
  const g = rgb[1] / 255
  const b = rgb[2] / 255
  const min = Math.min(r, g, b)
  const max = Math.max(r, g, b)
  const delta = max - min
  let h

  if (max === min) h = 0
  else if (r === max) h = (g - b) / delta
  else if (g === max) h = 2 + (b - r) / delta
  else h = 4 + (r - g) / delta

  h *= 60
  if (h < 0) h += 360

  const l = (min + max) / 2
  let s
  if (max === min) s = 0
  else if (l <= 0.5) s = delta / (max + min)
  else s = delta / (2 - max - min)

  return [h, s * 100, l * 100]
}

const hueToChannel = (t1, t2, hue) => {
  let t3 = hue
  if (t3 < 0) t3++
  if (t3 > 1) t3--
  if (6 * t3 < 1) return t1 + (t2 - t1) * 6 * t3
  if (2 * t3 < 1) return t2
  if (3 * t3 < 2) return t1 + (t2 - t1) * (2 / 3 - t3) * 6
  return t1
}

const hslToRgb = hsl => {
  const h = hsl[0] / 360
  const s = hsl[1] / 100
  const l = hsl[2] / 100
  let rgb

  if (s === 0) {
    rgb = [l * 255, l * 255, l * 255]
  } else {
    const t2 = l < 0.5 ? l * (1 + s) : l + s - l * s
    const t1 = 2 * l - t2
    rgb = [1, 0, -1].map(offset => hueToChannel(t1, t2, h + (1 / 3) * offset) * 255)
  }

  return rgb.map(channel => clamp(channel, 0, 255))
}

const shiftLightness = (hsl, ratio) => {
  const hue = ((hsl[0] % 360) + 360) % 360
  const saturation = clamp(hsl[1], 0, 100)
  const lightness = clamp(hsl[2], 0, 100)
  return [hue, saturation, lightness + lightness * ratio]
}

module.exports = { parseHex, toHex, contrastRatio, isDark, rgbToHsl, hslToRgb, shiftLightness }
