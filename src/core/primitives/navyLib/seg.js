
// Draws a segment, adds corresponding collision f-n

import Math2 from '../../../stuff/math.js'

export default class Segment {

    // Overlay ref, canvas ctx
    constructor(core) {
        this.T = core.props.config.TOOL_COLL
        this.core = core
    }

    // Update line coordinates
    update(p1, p2) {
        const layout = this.core.layout
        this.x1 = layout.ti2x(p1[0], p1[0]) // time , index
        this.y1 = layout.value2y(p1[1])
        this.x2 = layout.ti2x(p2[0], p2[0])
        this.y2 = layout.value2y(p2[1])
    }

    // p1[t, $], p2[t, $] (time-price coordinates)
    // TODO: fix for index-based
    draw(ctx) {
        ctx.moveTo(this.x1, this.y1)
        ctx.lineTo(this.x2, this.y2)
    }

    // Collision function. x, y - mouse coord.
    collision(x, y) {
        return Math2.point2seg(
            [x, y],
            [this.x1, this.y1],
            [this.x2, this.y2]
        ) < this.T
    }
}