'use strict'

const normalizeValue = require('normalize-value')

module.exports = (color, colors) => {
  const steps = [{ value: 0, norm: 1 }, { value: colors.length, norm: 0 }]

  const index = colors.indexOf(color)

  return normalizeValue(index, steps)
}
