'use strict'

const sortBy = require('lodash.sortby')

/**
 * The "range" is a metric used to determine how
 * vibrant a color is. It checks the delta between
 * the highest and lowest channel values, giving us an indiciation
 * of how dominant one range might be.
 *
 * @example
 * For the RGB value [250, 30, 10] we can see
 * that the red channel dominates, meaning it will be
 * primarily red.
 */
module.exports = color => {
  const rgb = sortBy(color.rgb().array()).reverse()
  const [max, , min] = rgb
  return (max - min) / 10
}
