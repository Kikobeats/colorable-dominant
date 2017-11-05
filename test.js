'use strict'

// const colorable = require('colorable')
//
// const colors = [
//   '#ef4a2a',
//   '#3c1020',
//   '#4f3848',
//   '#85302b',
//   '#645444',
//   '#602b29',
//   '#665877',
//   '#4e3932',
//   '#ac979d'
// ]
//
// var options = {
//   compact: true,
//   threshold: 0
// }
//
// const result = colorable(colors, options)
// console.log(JSON.stringify(result, null, 2))

// get pixels
// const getPixels = require('./src/get-image-pixels')
// const countPixel = require('./src/count-pixel')
const path = require('path')
// const Color = require('color')
//
const image = path.resolve('./test/demo.png')
//
// ;(async () => {
//   const pixels = await getPixels({filepath: image})
//   const color = Color([61, 11, 28])
//
//   const count = pixels.reduce((acc, pixel) => {
//     if (pixel.string() === color.string()) ++acc
//     return acc
//   }, 0)
//
//   console.log(count)
// })()

// JIMPPPPPPPP

const Jimp = require('jimp')
const Color = require('color')
Jimp.read(image, function (err, image) {
  const { width, height } = image.bitmap

  const pixels = []

  for (var x = 0; x < height; x++) {
    for (var y = 0; y < width; y++) {
      const { r, g, b } = Jimp.intToRGBA(image.getPixelColor(x, y))
      pixels.push(Color({ r, g, b }))
    }
  }

  console.log(pixels)
})
