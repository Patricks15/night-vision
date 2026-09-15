
// Average volume (SMA)

import { fastSma } from './helperFns.js'

export default function avgVolume(ctx, core, props, cnv, vIndex = 5) {

    let i1 = core.view.i1
    let i2 = core.view.i2
    let len = props.avgVolumeSMA
    let sma = fastSma(core.data, vIndex, i1, i2, len)
    let layout  = core.layout
    let vs = cnv.volScale
    let h = layout.height

    ctx.lineJoin = "round"
    ctx.lineWidth = 0.75
    ctx.strokeStyle = props.colorAvgVol
    ctx.beginPath()

    // TODO: implement
    if (core.layout.indexBased) return

    let offset = core.data.length - sma.length

    // TODO: Calculate layout index offset
    for (var i = 0, n = sma.length; i < n; i++) {
        let x = layout.ti2x(sma[i][0], i + offset)
        let y = cnv.volScaleMode ?
            layout.value2y(sma[i][1]) :
            h - sma[i][1] * vs
        ctx.lineTo(x, y)
    }
    ctx.stroke()

}
