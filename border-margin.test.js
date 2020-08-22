const test = require("ava")
const { getIOU } = require("./index.js")

test("border margin test", (t) => {
  const annotation1 = [
    {
      regionType: "bounding-box",
      centerX: 0.5,
      centerY: 0.5,
      width: 0.5,
      height: 0.5,
    },
  ]

  const annotation2 = [
    {
      regionType: "bounding-box",
      centerX: 0.5,
      centerY: 0.5,
      width: 0.25,
      height: 0.25,
    },
  ]

  const iou0 = getIOU(annotation1, annotation2, { borderMargin: 0 })
  const iou1 = getIOU(annotation1, annotation2, { borderMargin: 0.01 })
  const iouf = getIOU(annotation1, annotation2, {
    borderMargin: 0.15,
  })

  t.is(iou0.toFixed(3), "0.250")
  t.is(iou1.toFixed(3), "0.284")
  t.is(iouf.toFixed(3), "0.975")
})
