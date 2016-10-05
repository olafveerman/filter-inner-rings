const test = require('ava')
const filterRings = require('../index.js')
const fs = require('fs')

test('filterRings removes inner rings in a Polygon that are below the minArea specified', t => {
  let input = JSON.parse(fs.readFileSync('./fixtures/poly-with-inner-rings.json'))
  let expected = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'Polygon',
      'coordinates': [
        [
          [6, 6],
          [10, 6],
          [10, 10],
          [6, 10],
          [6, 6]
        ]
      ]
    }
  }
  t.deepEqual(filterRings(input, 12500000000), expected)
})

test('filterRings removes inner rings in a MultiPolygon that are below the minArea specified', t => {
  let input = JSON.parse(fs.readFileSync('./fixtures/multipolygon-with-inner-rings.json'))
  let expected = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'MultiPolygon',
      'coordinates': [
        [
          [
            [6, 6],
            [10, 6],
            [10, 10],
            [6, 10],
            [6, 6]
          ]
        ],
        [
          [
            [10, 10],
            [12, 10],
            [12, 12],
            [10, 12],
            [10, 10]
          ]
        ]
      ]
    }
  }
  t.deepEqual(filterRings(input, 12500000000), expected)
})

test('filterRings removes inner rings in a Polygon that are below the minArea specified and leaves those above', t => {
  let input = JSON.parse(fs.readFileSync('./fixtures/poly-with-inner-rings.json'))
  let expected = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'Polygon',
      'coordinates': [
        [
          [6, 6],
          [10, 6],
          [10, 10],
          [6, 10],
          [6, 6]
        ],
        [
          [7, 7],
          [8, 7],
          [8, 8],
          [7, 8],
          [7, 7]
        ]
      ]
    }
  }
  t.deepEqual(filterRings(input, 4000000000), expected)
})

test('filterRings removes inner rings in a MultiPolygon that are below the minArea specified and leaves those above', t => {
  let input = JSON.parse(fs.readFileSync('./fixtures/multipolygon-with-inner-rings.json'))
  let expected = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'MultiPolygon',
      'coordinates': [
        [
          [
            [6, 6],
            [10, 6],
            [10, 10],
            [6, 10],
            [6, 6]
          ],
          [
            [7, 7],
            [8, 7],
            [8, 8],
            [7, 8],
            [7, 7]
          ]
        ],
        [
          [
            [10, 10],
            [12, 10],
            [12, 12],
            [10, 12],
            [10, 10]
          ],
          [
            [10.5, 10.5],
            [11.5, 10.5],
            [11.5, 11.5],
            [10.5, 11.5],
            [10.5, 10.5]
          ]
        ]
      ]
    }
  }
  t.deepEqual(filterRings(input, 4000000000), expected)
})

test('filterRings leaves inner rings in a Polygon that are above the minArea specified', t => {
  let input = JSON.parse(fs.readFileSync('./fixtures/poly-with-inner-rings.json'))
  t.deepEqual(filterRings(input, 1), input)
})

test('filterRings leaves inner rings in a MultiPolygon that are above the minArea specified', t => {
  let input = JSON.parse(fs.readFileSync('./fixtures/multipolygon-with-inner-rings.json'))
  t.deepEqual(filterRings(input, 1), input)
})

test('filterRings handles Polygons that have no inner rings', t => {
  let input = JSON.parse(fs.readFileSync('./fixtures/poly-no-inner-rings.json'))
  t.deepEqual(filterRings(input, 100), input)
})

test('filterRings handles MultiPolygons that have no inner rings', t => {
  let input = JSON.parse(fs.readFileSync('./fixtures/multipolygon-no-inner-rings.json'))
  t.deepEqual(filterRings(input, 100), input)
})

test('filterRings strips all inner rings from a Polygon if no minArea is specified', t => {
  let input = JSON.parse(fs.readFileSync('./fixtures/poly-with-inner-rings.json'))
  let expected = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'Polygon',
      'coordinates': [
        [
          [6, 6],
          [10, 6],
          [10, 10],
          [6, 10],
          [6, 6]
        ]
      ]
    }
  }
  t.deepEqual(filterRings(input), expected)
})

test('filterRings strips all inner rings from a MultiPolygon if no minArea is specified', t => {
  let input = JSON.parse(fs.readFileSync('./fixtures/multipolygon-with-inner-rings.json'))
  let expected = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'MultiPolygon',
      'coordinates': [
        [
          [
            [6, 6],
            [10, 6],
            [10, 10],
            [6, 10],
            [6, 6]
          ]
        ],
        [
          [
            [10, 10],
            [12, 10],
            [12, 12],
            [10, 12],
            [10, 10]
          ]
        ]
      ]
    }
  }
  t.deepEqual(filterRings(input), expected)
})

test('filterRings leaves lineStrings intact', t => {
  let input = JSON.parse(fs.readFileSync('./fixtures/linestring.json'))
  t.deepEqual(filterRings(input, 100), input)
})

test('filterRings leaves Points intact', t => {
  let input = require('./fixtures/point.json')
  t.deepEqual(filterRings(input, 100), input)
})

test('filterRings handles FeatureCollections', t => {
  let input = require('./fixtures/fc-polygon-no-inner-rings.json')
  t.deepEqual(filterRings(input, 100), input)
})

test('filterRings throws an error when it doesn\'t receive a Feature or FeatureCollection', t => {
  let input = require('./fixtures/feature-array.json')
  t.throws(() => filterRings(input, 100), 'A Feature, or FeatureCollection is required')
})
