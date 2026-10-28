'use strict'

const {
  parseHex,
  toHex,
  contrastRatio,
  isDark,
  rgbToHsl,
  hslToRgb,
  shiftLightness
} = require('./color')
const getColorDominance = require('./get-color-dominance')
const getRGBRange = require('./get-rgb-range')

const THRESHOLD_CONTRAST_RATIO = 1.0
const MINIMUM_CONTRAST_RATIO = 4.5

const DEFAULT = {
  threshold: THRESHOLD_CONTRAST_RATIO,
  minContrast: MINIMUM_CONTRAST_RATIO
}

const isNil = value => value === null || value === undefined
const isEmpty = value => value.length === 0
const exists = value => !isNil(value) && !isEmpty(value)

const calculateTotalPairScore = pairs => pairs.reduce((score, color) => score + color.score, 0)

const sortPairsByScore = (pairs = []) =>
  pairs.sort((a, b) => {
    if (a.score === b.score) return 0
    return a.score > b.score ? -1 : 1
  })

const getMostDominantPrimaryColor = (colors, WCAGCompliantColorPairs) => {
  let highestDominanceScore = 0
  let mostDominantColor = ''

  for (const dominantColor in WCAGCompliantColorPairs) {
    const pairs = WCAGCompliantColorPairs[dominantColor]
    const dominance = getColorDominance(dominantColor, colors)
    const totalPairScore = calculateTotalPairScore(pairs)
    const score = pairs.length ? (pairs.length + totalPairScore) * dominance : 0
    if (score > highestDominanceScore) {
      highestDominanceScore = score
      mostDominantColor = dominantColor
    }
  }

  WCAGCompliantColorPairs[mostDominantColor] = sortPairsByScore(
    WCAGCompliantColorPairs[mostDominantColor]
  )

  return mostDominantColor
}

const getColorCombinations = (palette, threshold) =>
  palette.map(dominantColor => ({
    dominantColor,
    combinations: palette
      .filter(color => color !== dominantColor)
      .map(color => ({ color, contrast: contrastRatio(dominantColor, color) }))
      .filter(({ contrast }) => contrast > threshold)
  }))

module.exports = (colors, opts) => {
  opts = Object.assign({}, DEFAULT, opts)
  const { minContrast, threshold = 0 } = opts
  const palette = colors.filter((color, index) => colors.indexOf(color) === index).map(parseHex)
  const WCAGCompliantColorPairs = {}

  getColorCombinations(palette, threshold).forEach(({ dominantColor, combinations }) => {
    const pairs = (WCAGCompliantColorPairs[toHex(dominantColor)] = [])

    combinations.forEach(innerColorCombination => {
      let { color, contrast } = innerColorCombination

      /**
       * The score is determined based three things:
       *
       *  contrast:
       *     how well contrasted the color is with the dominant color.
       *  dominance:
       *    the level of dominance of the dominant color
       *    which is based on the index of the color in
       *    the palette array.
       *   range/vibrance:
       *    we want some vibrant colors
       */
      const range = getRGBRange(color)
      /**
       * If the contrast isn't high enough, lighten/darken
       * the color so that we get a more accessible
       * version of the color.
       */
      if (contrast < minContrast) {
        const delta = (minContrast - contrast) / 20
        let lighten = isDark(dominantColor)
        let hsl = rgbToHsl(color)
        while (contrast < minContrast) {
          const newHsl = shiftLightness(hsl, lighten ? delta : -delta)
          const newColor = hslToRgb(newHsl)
          // If the new color is the same as the old one, we're not getting any
          // lighter or darker so we need to stop.
          if (toHex(newColor) === toHex(color)) break
          const newContrast = contrastRatio(dominantColor, newColor)
          // If the new contrast is lower than the old contrast
          // then we need to start moving the other direction in the spectrum
          if (newContrast < contrast) {
            lighten = !lighten
          }
          hsl = newHsl
          color = newColor
          contrast = newContrast
        }
      }
      const score = contrast + range
      pairs.push({ color, score, contrast })
    })
  })

  const backgroundColor = getMostDominantPrimaryColor(colors, WCAGCompliantColorPairs)

  // prettier-ignore
  let [color, alternativeColor, accentColor] = WCAGCompliantColorPairs[backgroundColor]
  if (!alternativeColor) alternativeColor = color
  if (!accentColor) accentColor = alternativeColor

  return {
    backgroundColor: exists(backgroundColor) ? backgroundColor : null,
    color: exists(color) ? toHex(color.color) : null,
    alternativeColor: exists(alternativeColor) ? toHex(alternativeColor.color) : null
  }
}
