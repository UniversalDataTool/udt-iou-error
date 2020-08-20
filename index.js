const { polygon } = require("polygon-tools")

function getPolygonFromUDTRegions(regions, classification) {
  const udtPolygons = regions
    .map((r) => {
      switch (r.regionType || r.type) {
        case "polygon":
          return r
        case "bounding-box":
          return {
            regionType: "polygon",
            classification: r.classification,
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

  const firstPolyIndex = udtPolygons.findIndex(
    (p) => p.classification === classification
  )
  if (firstPolyIndex === -1) return []
  let outputPoly = [polys[firstPolyIndex]]

  for (const poly of polys.slice(firstPolyIndex + 1)) {
    if (poly.classification === classification) {
      outputPoly = polygon.union(...outputPoly, poly)
    } else {
      // outputPoly = polygon.subtract(outputPoly, poly)
      outputPoly = outputPoly.flatMap((innerPoly) => {
        return polygon.subtract(innerPoly, poly)
      })
    }
  }

  return outputPoly
}

function sumArea(polygons) {
  return polygons.map(polygon.area).reduce((acc, area) => acc + area, 0)
}

function getIOU(ann1, ann2) {
  const classifications = Array.from(
    new Set([
      ...ann1.map((s) => s.classification),
      ...ann2.map((s) => s.classification),
    ])
  )

  let totalUnionArea = 0
  let totalIntersectionArea = 0

  for (const classification of classifications) {
    const p1 = getPolygonFromUDTRegions(ann1, classification)
    const p2 = getPolygonFromUDTRegions(ann2, classification)

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
    //   classification,
    //   p1Area,
    //   p2Area,
    //   unionArea,
    //   intersectionArea,
    // })
    totalUnionArea += unionArea
    totalIntersectionArea += intersectionArea
  }

  // console.log({ totalUnionArea, totalIntersectionArea })
  if (totalUnionArea === 0) return 1

  return totalIntersectionArea / totalUnionArea
}

module.exports = getIOU
