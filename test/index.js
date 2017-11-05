'use strict'

const should = require('should')

const colorableDominant = require('..')
const getColorDominance = require('../src/get-color-dominance')

describe('Colorable dominant', () => {
  describe('.getColorDominance', () => {
    it('dominance score is 1 if the color is the first position', () => {
      const dominanceScore = getColorDominance('#ef4a2a', [
        '#ef4a2a',
        '#3c1020',
        '#4f3848',
        '#85302b',
        '#645444',
        '#602b29',
        '#665877',
        '#4e3932',
        '#ac979d'
      ])
      should(dominanceScore).be.equal(1)
    })

    it('dominance score is near to 0 if the color is the last position', () => {
      const dominanceScore = getColorDominance('#ac979d', [
        '#ef4a2a',
        '#3c1020',
        '#4f3848',
        '#85302b',
        '#645444',
        '#602b29',
        '#665877',
        '#4e3932',
        '#ac979d'
      ])
      should(dominanceScore).be.equal(0.11111111111111116)
    })

    it('dominance score is near to 0.5 if the color is the middle', () => {
      const dominanceScore = getColorDominance('#645444', [
        '#ef4a2a',
        '#3c1020',
        '#4f3848',
        '#85302b',
        '#645444',
        '#602b29',
        '#665877',
        '#4e3932',
        '#ac979d'
      ])
      should(dominanceScore).be.equal(0.5555555555555556)
    })
  })

  it('from a list of colors', () => {
    const predominantColors = [
      '#ef4a2a',
      '#3c1020',
      '#4f3848',
      '#85302b',
      '#645444',
      '#602b29',
      '#665877',
      '#4e3932',
      '#ac979d'
    ]

    should(colorableDominant(predominantColors)).be.eql({
      backgroundColor: '#3C1020',
      alternativeColor: '#D17872',
      color: '#EF4E2E'
    })
  })
})
