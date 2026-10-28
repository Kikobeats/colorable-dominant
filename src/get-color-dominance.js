'use strict'

module.exports = (color, colors) => {
  const index = colors.indexOf(color)
  return index === -1 ? 1 : 1 - index / colors.length
}
