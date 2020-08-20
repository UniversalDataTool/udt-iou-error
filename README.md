# UDT IOU Error

Compute the intersection over union error of groups of polygons ([UDT regions](https://github.com/UniversalDataTool/udt-format/blob/master/interfaces/image_segmentation.md)). Created primarily for use with the [Universal Data Tool](https://universaldatatool.com).

```javascript
// install with npm install udt-iou-error
const getIOU = require("udt-iou-error")

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
    regionType: "polygon",
    points: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
]

getIOU(annotation1, annotation2)
// >> 0.2
```

### Classifications

It's also smart enough to calculate IOU error with multiple classifications.

```javascript
const getIOU = require("udt-iou-error")

const annotation1 = [
  {
    regionType: "bounding-box",
    classification: "red",
    centerX: 0.5,
    centerY: 0.5,
    width: 0.5,
    height: 0.5,
  },
  {
    regionType: "bounding-box",
    classification: "blue",
    centerX: 0.1,
    centerY: 0.1,
    width: 0.2,
    height: 0.2,
  },
]

const annotation2 = [
  {
    regionType: "polygon",
    classification: "blue",
    points: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
]

getIOU(annotation1, annotation2)
// >> 0.2
```
