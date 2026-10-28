'use strict'

const should = require('should')

const {
  parseHex,
  toHex,
  contrastRatio,
  isDark,
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

    it('wraps hue and clamps saturation before the step', () => {
      should(shiftLightness([360, 150, 40], 0)).be.eql([0, 100, 40])
      should(shiftLightness([-20, -10, 40], 0)).be.eql([340, 0, 40])
    })

    it('clamps lightness before applying the ratio', () => {
      should(shiftLightness([10, 20, 150], 0.5)).be.eql([10, 20, 150])
      should(shiftLightness([10, 20, -25], -0.5)).be.eql([10, 20, 0])
    })
  })

  describe('.rgbToHsl', () => {
    it('wraps a negative hue into the 0..360 range', () => {
      should(rgbToHsl([255, 0, 1])[0]).be.equal(359.7647058823529)
    })
  })

  describe('.isDark', () => {
    it('treats YIQ 128 as light', () => {
      should(isDark([12, 175, 4])).be.false()
      should(isDark([12, 174, 4])).be.true()
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

    it('linearizes at the WCAG 2.2 cutoff of 0.04045', () => {
      const againstBlack = channel => {
        const value = channel / 255
        const linear = 0.2126 * (value / 12.92)
        return (linear + 0.05) / 0.05
      }
      // Exactly 0.04045 takes the linear branch. Just above 0.03928 still does too.
      should(contrastRatio([0.04045 * 255, 0, 0], [0, 0, 0])).be.equal(againstBlack(0.04045 * 255))
      should(contrastRatio([0.04 * 255, 0, 0], [0, 0, 0])).be.equal(againstBlack(0.04 * 255))
    })
  })
})
