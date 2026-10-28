'use strict'

const should = require('should')

const colorableDominant = require('..')
const getColorDominance = require('../src/get-color-dominance')
const colorableParity = require('./fixtures/colorable-parity.json')

describe('colorable-dominant', () => {
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

  it('just one color', () => {
    const predominantColors = ['#ef4a2a']

    should(colorableDominant(predominantColors)).be.eql({
      backgroundColor: null,
      alternativeColor: null,
      color: null
    })
  })

  it('list of colors', () => {
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

  it('throws without colors', () => {
    should(() => colorableDominant()).throw(TypeError)
  })

  it('drops duplicate colors before pairing', () => {
    should(colorableDominant(['#FF0000', '#FF0000', '#0000FF'], { threshold: 0 })).be.eql({
      backgroundColor: '#FF0000',
      color: '#00005C',
      alternativeColor: '#00005C'
    })
  })

  it('drops a pair whose contrast equals the threshold', () => {
    should(colorableDominant(['#000000', '#ffffff'], { threshold: 21, minContrast: 21 })).be.eql({
      backgroundColor: null,
      color: null,
      alternativeColor: null
    })
  })

  it('keeps the default threshold when the option is undefined', () => {
    const colors = ['#000000', '#ffffff']
    should(colorableDominant(colors, { threshold: undefined })).be.eql(colorableDominant(colors))
  })

  it('produces the same themes as the colorable-based implementation', () => {
    colorableParity.forEach(({ colors, options, expected }) => {
      should(colorableDominant(colors, options)).be.eql(expected)
    })
  })
})
