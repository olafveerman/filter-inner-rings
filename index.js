const area = require('@turf/area')
const helpers = require('@turf/helpers')

/**
 * Takes an array of LinearRings and filters any interior ring that is smaller
 * than the minArea.
 * The first ring in the array is the exterior ring and is always returned.
 *
 * @name filterRings
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Number} minArea in square meters
 * @return {Array<Array<Array<number>>>} a filtered array of LinearRings
 * @example
 * var polygon = filterRings([[
 *  [
 *    [6,6],
 *    [10,6],
 *    [10,10],
 *    [6,10],
 *    [6,6]
 *  ],
 *  [
 *    [7,7],
 *    [8,7],
 *    [8,8],
 *    [7,8],
 *    [7,7]
 *  ],
 * ]], 100000);
 *
 * //=LinearRings
 */
function filterRings (coordinates, minArea) {
  return coordinates.filter((ring, i) => i === 0 || area(helpers.polygon([ring])) > minArea)
}

/**
 * Removes any interior ring from a Polygon or MultiPolygon below a particular
 * size in square meters.
 * If no minArea is specified, all inner rings are removed.
 *
 * @name processFeature
 * @param {(Feature)} geojson input feature
 * @param {Number} minArea minimum area in square meters
 * @returns {{(Feature)} feature with filtered geometry
 */
function processFeature (f, minArea) {
  if (f.geometry.type !== 'Polygon' && f.geometry.type !== 'MultiPolygon') {
    // return the original feature if it's not some type of polygon
    return f
  } else if (f.geometry.type === 'Polygon') {
    if (!minArea) {
      // only keep the exterior ring, which is always the first item in the
      // array with LineRings
      f.geometry.coordinates = [f.geometry.coordinates[0]]
    } else {
      f.geometry.coordinates = filterRings(f.geometry.coordinates, minArea)
    }
    return f
  } else if (f.geometry.type === 'MultiPolygon') {
    if (!minArea) {
      // only keep the exterior rings, which is always the first item in the
      // array with LineRings
      f.geometry.coordinates = f.geometry.coordinates.map(polygon => [polygon[0]])
    } else {
      // The coordinates of a MultiPolygons are nested one level deeper than regular Polygons
      f.geometry.coordinates = f.geometry.coordinates.map(polygon => filterRings(polygon, minArea))
    }
    return f
  }
}

/**
 * Accepts a GeoJSON feature, or GeoJSON featureCollection and removes any
 * interior ring from Polygons and MultiPolygons below a size in square meters.
 * If no minArea is specified, all inner rings are removed.
 *
 * @name
 * @param {(Feature|FeatureCollection)} geojson input features
 * @param {Number} minArea minimum area in square meters
 * @returns {{(Feature|FeatureCollection)} filtered feature(s)
 */
module.exports = function (geojson, minArea) {
  if (geojson.type === 'FeatureCollection') {
    geojson.features = geojson.features.map(f => processFeature(f, minArea))
    return geojson
  } else if (geojson.type === 'Feature') {
    return processFeature(geojson, minArea)
  } else {
    throw new Error('A Feature, or FeatureCollection is required')
  }
}
