// Interactive trend line (line, ray or segment)
// Combining line primitive and pins

import { c } from "@freecodecamp/strip-comments/lib/languages";

const LineDrawState = Object.freeze({
  IDLE: "idle",        // nothing happens
  DRAWING: "drawing",  // user is drawing the line
  SET: "set",          // line is set
  REDRAW: "redraw"     // line is being edited
});

export default class TrendLine {

    constructor(core, line, nw = false) {
        this.currentState = LineDrawState.IDLE;
        this.core = core
        this.data = line
        this.drawing = false
        this.hover = false
        this.selected = false
        this.onSelect = () => {}
        switch (line.type) {
            case 'segment':
                this.line = new core.lib.Segment(core)
            break
        }
        this.pins = [
            new core.lib.Pin(core, this, 'p1'),
            new core.lib.Pin(core, this, 'p2')
        ]
        if (nw) this.pins[1].state = 'tracking'
    }

    draw(ctx) {

        this.line.update(this.data.p1, this.data.p2)
        ctx.lineWidth = 2
        ctx.strokeStyle = '#3355ff'
        ctx.beginPath()
        this.line.draw(ctx)
        ctx.stroke()

        if (this.hover || this.selected) {

            for (var pin of this.pins) {
                pin.draw(ctx)
            }
        }
    }

    collision() {
        const mouse = this.core.mouse
        let [x, y] = [mouse.x, mouse.y]
        return this.line.collision(x, y)
    }

    propagate(name, data) {
        for (var pin of this.pins) {
            pin[name](data)
        }
    } 

    mousedown(event) {

        this.propagate('mousedown', event)
        // only handle left mouse button
        if (event.button !== 0) return

        switch (this.currentState) {
            case LineDrawState.IDLE:
            case LineDrawState.DRAWING:
                if (this.collision()) {
                    this.onSelect(this.data.uuid)
                    this.currentState = LineDrawState.DRAWING
                }
                break
            case LineDrawState.SET:
                // LINE EDIT: pick up pin and re-draw line with new pin position
                if (this.hover) {
                    // check which pin is hovered
                    for (var pin of this.pins) {
                        if (pin.hover() && pin.state == 'settled') {

                            // set pin to tracking state
                            pin.state = 'tracking'
                            this.currentState = LineDrawState.REDRAW
                        }
                    }
                }
                break
            case LineDrawState.REDRAW:
                // set pin to settled state
                this.currentState = LineDrawState.SET
                break
        }
    }

    mouseup(event) {
        this.propagate('mouseup', event)

        switch (this.currentState) {
            case LineDrawState.DRAWING:

                this.pins[1].update()  // set final second point
                this.currentState = LineDrawState.SET
                break
        }
    }
        
    mousemove(event) {
        this.hover = this.collision()

        switch (this.currentState) {
            case LineDrawState.DRAWING:

                const layout = this.core.layout

                const dt = this.core.cursor.time
                const dv = layout.y2value(this.core.cursor.y)

                const [t1, v1] = this.data.p1
                const [t2, v2] = this.data.p2

                const dtOffset = dt - t1
                const dvOffset = dv - v1

                this.data.p1 = [t1 + dtOffset, v1 + dvOffset]
                this.data.p2 = [t2 + dtOffset, v2 + dvOffset]

                break
        }

        this.propagate('mousemove', event)
    }
}