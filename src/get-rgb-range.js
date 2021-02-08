'use strict'

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
  const rgb = color
    .rgb()
    .array()
    .sort((a, b) => b - a)

  const [max, , min] = rgb
  return (max - min) / 10
}
