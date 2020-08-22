const { polygon } = require("polygon-tools")
const Offset = require("polygon-offset")

function getPolygonFromUDTRegions(regions, classification) {
  const udtPolygons = regions
    .map((r) => {
      switch (r.regionType || r.type) {
        case "polygon":
          if (r.points.length < 3) return null
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

  for (let i = 1; i < polys.length; i++) {
    const poly = polys[i]
    if (udtPolygons[i].classification === classification) {
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

function inflate(polygons, amount) {
  return polygons.flatMap((polygon) => {
    const offset = new Offset()
    return offset.data(polygon).margin(amount)
  })
}

function getUnionAndIntersection(p1, p2) {
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
  return { unionArea, intersectionArea }
}

// Public Method, Takes UDT Regions and returns I/O
function getIOU(ann1, ann2, { borderMargin = 0 } = {}) {
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

    const { unionArea, intersectionArea } = getUnionAndIntersection(p1, p2)

    if (borderMargin === 0) {
      totalUnionArea += unionArea
      totalIntersectionArea += intersectionArea
      continue
    }

    const p1Inflated = inflate(p1, borderMargin)
    const p2Inflated = inflate(p2, borderMargin)

    const { intersectionArea: infA } = getUnionAndIntersection(p1Inflated, p2)
    const { intersectionArea: infB } = getUnionAndIntersection(p1, p2Inflated)

    const infIntersection = infA + infB - intersectionArea

    return infIntersection / unionArea
  }

  // console.log({ totalUnionArea, totalIntersectionArea })
  if (totalUnionArea <= 0.0001) return 1

  return totalIntersectionArea / totalUnionArea
}

module.exports = {
  getIOU,
  getPolygonFromUDTRegions,
}
