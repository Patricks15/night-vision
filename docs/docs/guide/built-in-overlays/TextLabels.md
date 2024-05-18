# TextLabels

Text labels that stick to a given price

## Data Format

```js
[<timestamp>, <TextLabelObject>]
 <TextLabelObject> {
   text :: string, text of the label
   dir :: direction, 1 = points up, -1 = points down
   price :: price
   ?color :: color, text color
   ?back :: color, background
   ?stroke :: stroke color
   ?offset, px, offest from the pin
 }
```

## TextLabels.color
- **Type:** `Color`
- **Default:** `$core.colors.text`

## TextLabels.back
- **Type:** `Color`
- **Default:** `$core.colors.back`

## TextLabels.stroke
- **Type:** `Color`
- **Default:** `$core.colors.scale`

## TextLabels.borderRadius
- **Type:** `number`
- **Default:** `3`

## TextLabels.offset
- **Type:** `number`
- **Default:** `5`

