const test = require("ava")
const getIOU = require("./")

test("intersection over union", (t) => {
  const iou = getIOU(
    [
      {
        regionType: "bounding-box",
        centerX: 0.5,
        centerY: 0.5,
        width: 0.5,
        height: 0.5,
      },
      {
        regionType: "polygon",
        points: [
          { x: 0.1, y: 0.1 },
          { x: 0, y: 0.1 },
          { x: 0, y: 0 },
        ],
      },
    ],
    [
      {
        regionType: "polygon",
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
        ],
      },
    ]
  )
  t.assert(iou.toFixed(3) === "0.208")
})
