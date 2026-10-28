'use strict'

const { writeFileSync } = require('fs')
const { join } = require('path')
const { setFlagsFromString } = require('v8')
const { runInNewContext } = require('vm')

const colorableDominant = require('..')
const parity = require('../test/fixtures/colorable-parity.json')

const RUNS = 7
const PARITY_ROUNDS = 40
const LARGE_PALETTE_SIZE = 64
const LARGE_PALETTE_ROUNDS = 8
const LOW_CONTRAST_ROUNDS = 400

const HEX_COLOR = /^#[0-9A-F]{6}$/

const toHexChannel = value => value.toString(16).padStart(2, '0')

const rgbHex = (red, green, blue) =>
  `#${toHexChannel(red)}${toHexChannel(green)}${toHexChannel(blue)}`

const largePalette = Array.from({ length: LARGE_PALETTE_SIZE }, (_, index) =>
  rgbHex((index * 37) % 256, (index * 91 + 40) % 256, (index * 53 + 128) % 256)
)

const lowContrastPalette = [
  '#777777',
  '#7a7477',
  '#74777a',
  '#7a7a74',
  '#787878',
  '#76797b',
  '#7b7876',
  '#757575'
]

const LOW_CONTRAST_OPTIONS = { minContrast: 7, threshold: 0 }

const isTheme = (theme, palette) =>
  palette.some(color => color.toUpperCase() === theme.backgroundColor) &&
  HEX_COLOR.test(theme.color) &&
  HEX_COLOR.test(theme.alternativeColor)

const sameTheme = (theme, expected) =>
  theme.backgroundColor === expected.backgroundColor &&
  theme.color === expected.color &&
  theme.alternativeColor === expected.alternativeColor

const parityCase = {
  name: 'theme from fixture palettes',
  extra: `${PARITY_ROUNDS} rounds over ${parity.length} parity palettes`,
  timed: () => {
    let matched = 0
    for (let round = 0; round < PARITY_ROUNDS; round++) {
      for (const { colors, options, expected } of parity) {
        if (sameTheme(colorableDominant(colors, options), expected)) matched++
      }
    }
    return matched
  },
  verify: matched => matched === PARITY_ROUNDS * parity.length
}

const largePaletteCase = {
  name: `theme from ${LARGE_PALETTE_SIZE}-color palette`,
  extra: `${LARGE_PALETTE_ROUNDS} calls, ${
    LARGE_PALETTE_SIZE * (LARGE_PALETTE_SIZE - 1)
  } pairs each`,
  timed: () => {
    let valid = 0
    for (let round = 0; round < LARGE_PALETTE_ROUNDS; round++) {
      if (isTheme(colorableDominant(largePalette), largePalette)) valid++
    }
    return valid
  },
  verify: valid => valid === LARGE_PALETTE_ROUNDS
}

const lowContrastCase = {
  name: 'contrast adjustment loop',
  extra: `${LOW_CONTRAST_ROUNDS} calls on ${lowContrastPalette.length} near-identical greys, minContrast 7`,
  timed: () => {
    let valid = 0
    for (let round = 0; round < LOW_CONTRAST_ROUNDS; round++) {
      if (isTheme(colorableDominant(lowContrastPalette, LOW_CONTRAST_OPTIONS), lowContrastPalette)) { valid++ }
    }
    return valid
  },
  verify: valid => valid === LOW_CONTRAST_ROUNDS
}

const CASES = [parityCase, largePaletteCase, lowContrastCase]

const median = values => {
  const sorted = values.slice().sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

setFlagsFromString('--expose-gc')
const collectGarbage = runInNewContext('gc')

const now = () => process.hrtime.bigint()

const elapsed = started => Number(now() - started) / 1e6

const fmt = value => value.toFixed(1)

const report = slot => {
  const med = slot.walls.length ? median(slot.walls) : Number.NaN
  const min = slot.walls.length ? Math.min(...slot.walls) : Number.NaN
  const max = slot.walls.length ? Math.max(...slot.walls) : Number.NaN
  const extra = `${slot.entry.extra}, errors ${slot.errors}, runs ${RUNS}`
  console.log(`${slot.entry.name}  median ${fmt(med)}ms  range ${fmt(min)}-${fmt(max)}  ${extra}`)
  return {
    name: slot.entry.name,
    unit: 'ms',
    value: Number(med.toFixed(1)),
    range: `${fmt(min)}-${fmt(max)}`,
    extra
  }
}

const takeSample = (slot, run) => {
  try {
    collectGarbage()
    const started = now()
    const outcome = slot.entry.timed()
    const wall = elapsed(started)
    if (!slot.entry.verify(outcome)) {
      console.error(`${slot.entry.name} run ${run} produced unexpected output`)
      slot.errors++
      return
    }
    slot.walls.push(wall)
  } catch (error) {
    console.error(error)
    slot.errors++
  }
}

const main = () => {
  const slots = CASES.map(entry => ({ entry, walls: [], errors: 0 }))
  for (const slot of slots) {
    try {
      slot.entry.timed()
    } catch (error) {
      console.error(error)
      slot.errors++
    }
  }
  for (let run = 0; run < RUNS; run++) {
    for (const slot of slots) takeSample(slot, run)
  }
  const results = slots.map(report)
  writeFileSync(
    join(__dirname, '..', 'benchmark-output.json'),
    JSON.stringify(results, null, 2) + '\n'
  )
  const errors = slots.reduce((total, slot) => total + slot.errors, 0)
  if (errors > 0 || results.some(result => !Number.isFinite(result.value))) {
    process.exitCode = 1
  }
}

main()
