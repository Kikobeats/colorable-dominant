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
    const expected = {
      backgroundColor: '#FF0000',
      color: '#00005C',
      alternativeColor: '#00005C'
    }

    should(colorableDominant(['#FF0000', '#FF0000', '#0000FF'], { threshold: 0 })).be.eql(expected)
    should(colorableDominant(['#ff0000', '#FF0000', '#0000ff'], { threshold: 0 })).be.eql(expected)
    should(colorableDominant(['#f00', '#FF0000', '#00f'], { threshold: 0 })).be.eql(expected)
  })

  it('ranks a repeated color by its place in the full palette', () => {
    should(colorableDominant(['#0003E5', '#000083', '#000083'])).be.eql({
      backgroundColor: '#000083',
      color: '#8A8BFF',
      alternativeColor: '#8A8BFF'
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

  it('builds the recorded theme for each palette', () => {
    colorableParity.forEach(({ colors, options, expected }) => {
      should(colorableDominant(colors, options)).be.eql(expected)
    })
  })

  it('honors palette order regardless of hex case', () => {
    const predominantColors = [
      '#ac979d',
      '#4e3932',
      '#665877',
      '#602b29',
      '#645444',
      '#85302b',
      '#4f3848',
      '#3c1020',
      '#ef4a2a'
    ]

    const expected = {
      backgroundColor: '#AC979D',
      alternativeColor: '#571F1C',
      color: '#5D1507'
    }

    should(colorableDominant(predominantColors)).be.eql(expected)
    should(colorableDominant(predominantColors.map(color => color.toUpperCase()))).be.eql(expected)
    should(
      colorableDominant([
        '#ac979d',
        '#4E3932',
        '#665877',
        '#602B29',
        '#645444',
        '#85302B',
        '#4f3848',
        '#3C1020',
        '#EF4A2A'
      ])
    ).be.eql(expected)
  })

  it('honors palette order for shorthand hex', () => {
    const expected = {
      backgroundColor: '#FF0000',
      color: '#00005C',
      alternativeColor: '#FFFFFF'
    }
    const reversed = {
      backgroundColor: '#0000FF',
      color: '#00FF00',
      alternativeColor: '#FFBEBE'
    }

    should(colorableDominant(['#FF0000', '#00FF00', '#0000FF'])).be.eql(expected)
    should(colorableDominant(['#f00', '#0f0', '#00f'])).be.eql(expected)
    should(colorableDominant(['#F00', '#0F0', '#00F'])).be.eql(expected)
    should(colorableDominant(['#0000FF', '#00FF00', '#FF0000'])).be.eql(reversed)
    should(colorableDominant(['#00f', '#0f0', '#f00'])).be.eql(reversed)
    should(colorableDominant(['#00F', '#0F0', '#F00'])).be.eql(reversed)
  })
})
