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

test("intersection over union with multiple classifications", (t) => {
  const iou = getIOU(
    [
      {
        regionType: "bounding-box",
        classification: "red",
        centerX: 0.5,
        centerY: 0.5,
        width: 0.5,
        height: 0.5,
      },
      {
        regionType: "polygon",
        classification: "blue",
        regionType: "bounding-box",
        centerX: 0.1,
        centerY: 0.1,
        width: 0.2,
        height: 0.2,
      },
    ],
    [
      {
        regionType: "polygon",
        classification: "red",
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
        ],
      },
      {
        classification: "blue",
        regionType: "bounding-box",
        centerX: 0.1,
        centerY: 0.1,
        width: 0.1,
        height: 0.1,
      },
    ]
  )
  t.is(iou.toFixed(3), "0.205")
})

test("intersection over union with perfectly overlapping but different classifications", (t) => {
  const iou = getIOU(
    [
      {
        regionType: "bounding-box",
        centerX: 0.5,
        classification: "red",
        centerY: 0.5,
        width: 0.5,
        height: 0.5,
      },
    ],
    [
      {
        regionType: "bounding-box",
        classification: "blue",
        centerX: 0.5,
        centerY: 0.5,
        width: 0.5,
        height: 0.5,
      },
    ]
  )
  t.is(iou.toFixed(3), "0.000")
})
