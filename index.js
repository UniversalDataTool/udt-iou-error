const { polygon } = require("polygon-tools")

function getPolygonFromUDTRegions(regions) {
  const udtPolygons = regions
    .map((r) => {
      switch (r.regionType || r.type) {
        case "polygon":
          return r
        case "bounding-box":
          return {
            regionType: "polygon",
            points: [
              { x: r.centerX - r.width / 2, y: r.centerY - r.height / 2 },
              { x: r.centerX + r.width / 2, y: r.centerY - r.height / 2 },
              { x: r.centerX + r.width / 2, y: r.centerY + r.height / 2 },
              { x: r.centerX - r.width / 2, y: r.centerY + r.height / 2 },
            ],
          }
        default:
          return null
      }
    })
    .filter(Boolean)

  const polys = udtPolygons.map((p) => p.points.map(({ x, y }) => [x, y]))

  return polygon.union(...polys)
}

function sumArea(polygons) {
  return polygons.map(polygon.area).reduce((acc, area) => acc + area, 0)
}

function getIOU(ann1, ann2) {
  const p1 = getPolygonFromUDTRegions(ann1)
  const p2 = getPolygonFromUDTRegions(ann2)

  const fullArea = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ]

  const fullAreaMinusP1 = polygon.subtract(fullArea, ...p1)
  const fullAreaMinusP2 = polygon.subtract(fullArea, ...p2)
  const fullAreaMinusP1P2 = polygon.subtract(fullArea, ...p1, ...p2)

  const p1Area = 1 - sumArea(fullAreaMinusP1)
  const p2Area = 1 - sumArea(fullAreaMinusP2)
  const unionArea = 1 - sumArea(fullAreaMinusP1P2)
  const intersectionArea = p1Area + p2Area - unionArea

  // console.log({
  //   p1Area,
  //   p2Area,
  //   unionArea,
  //   intersectionArea,
  // })

  return intersectionArea / unionArea
}

module.exports = getIOU
