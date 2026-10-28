'use strict'

const should = require('should')

const {
  parseHex,
  toHex,
  contrastRatio,
  rgbToHsl,
  hslToRgb,
  shiftLightness
} = require('../src/color')

describe('color', () => {
  describe('.parseHex', () => {
    it('parses 6-digit hex in any case', () => {
      should(parseHex('#3c1020')).be.eql([60, 16, 32])
      should(parseHex('#3C1020')).be.eql([60, 16, 32])
    })

    it('expands 3-digit hex', () => {
      should(parseHex('#fA0')).be.eql([255, 170, 0])
    })

    it('throws on anything that is not 3 or 6 digit hex', () => {
      ;['red', 'rgb(1, 2, 3)', 'fff', '#ffff', '#ffffff80', ' #fff', ''].forEach(value => {
        should(() => parseHex(value)).throw({
          name: 'Error',
          message: `Unable to parse color from string "${value}"`
        })
      })
    })
  })

  describe('.toHex', () => {
    it('serializes rounded channels as uppercase hex', () => {
      should(toHex([0, 15.5, 254.4])).be.equal('#0010FE')
    })
  })

  describe('.shiftLightness', () => {
    const shift = (hex, ratio) => toHex(hslToRgb(shiftLightness(rgbToHsl(parseHex(hex)), ratio)))

    it('lightens and darkens like color@4', () => {
      should(shift('#3c1020', 0.5)).be.equal('#5A1830')
      should(shift('#808080', 0.5)).be.equal('#C0C0C0')
      should(shift('#808080', -0.5)).be.equal('#404040')
    })
  })

  describe('.contrastRatio', () => {
    it('is 21 between black and white', () => {
      should(contrastRatio([0, 0, 0], [255, 255, 255])).be.equal(21)
      should(contrastRatio([255, 255, 255], [0, 0, 0])).be.equal(21)
    })

    it('is 1 for the same color', () => {
      should(contrastRatio([60, 16, 32], [60, 16, 32])).be.equal(1)
    })

    it('matches the WCAG 2.2 relative luminance definition', () => {
      should(contrastRatio([119, 119, 119], [255, 255, 255]).toFixed(2)).be.equal('4.48')
      should(contrastRatio([118, 118, 118], [255, 255, 255]).toFixed(2)).be.equal('4.54')
    })
  })
})
