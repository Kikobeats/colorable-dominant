'use strict'

const colorable = require('colorable')
const Color = require('color')

const getColorDominance = require('./get-color-dominance')
const getRGBRange = require('./get-rgb-range')

const THRESHOLD_CONTRAST_RATIO = 1.0
const MINIMUM_CONTRAST_RATIO = 4.5

const DEFAULT = {
  threshold: THRESHOLD_CONTRAST_RATIO,
  minContrast: MINIMUM_CONTRAST_RATIO,
  compact: true
}

const calculateTotalPairScore = pairs =>
  pairs.reduce((score, color) => score + color.score, 0)

const sortPairsByScore = pairs =>
  pairs.sort((a, b) => {
    if (a.score === b.score) return 0
    return a.score > b.score ? -1 : 1
  })

const getMostDominantPrimaryColor = (colors, WCAGCompliantColorPairs) => {
  var highestDominanceScore = 0
  var mostDominantColor = ''

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

module.exports = (colors, opts) => {
  opts = Object.assign({ compact: true }, DEFAULT, opts)
  const { minContrast } = opts
  const colorsCombinations = colorable(colors, opts)
  const WCAGCompliantColorPairs = {}

  colorsCombinations.forEach((colorCombination, index) => {
    const { hex, combinations } = colorCombination
    const dominantColor = Color(hex)
    const pairs = (WCAGCompliantColorPairs[dominantColor.hex()] = [])

    combinations.forEach(innerColorCombination => {
      let { hex, contrast } = innerColorCombination
      let color = Color(hex)

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
        let lighten = dominantColor.isDark()
        while (contrast < minContrast) {
          const newColor = lighten ? color.lighten(delta) : color.darken(delta)
          // If the new color is the same as the old one, we're not getting any
          // lighter or darker so we need to stop.
          if (newColor.hex() === color.hex()) break
          const newContrast = dominantColor.contrast(newColor)
          // If the new contrast is lower than the old contrast
          // then we need to start moving the other direction in the spectrum
          if (newContrast < contrast) {
            lighten = !lighten
          }
          color = newColor
          contrast = newContrast
        }
      }
      const score = contrast + range
      pairs.push({ color, score, contrast })
    })
  })

  const backgroundColor = getMostDominantPrimaryColor(
    colors,
    WCAGCompliantColorPairs
  )

  // prettier-ignore
  let [
    color,
    alternativeColor,
    accentColor
  ] = WCAGCompliantColorPairs[backgroundColor]

  if (!alternativeColor) alternativeColor = color
  if (!accentColor) accentColor = alternativeColor

  return {
    backgroundColor,
    color: color.color.hex(),
    alternativeColor: alternativeColor.color.hex()
  }
}
