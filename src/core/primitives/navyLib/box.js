import { c } from "@freecodecamp/strip-comments/lib/languages";

const BoxDrawState = Object.freeze({
  IDLE: "idle",
  DRAWING: "drawing",
  SET: "set",
  REDRAW: "redraw"
});

export default class Box {

    constructor(core, box, nw = false) {
        this.currentState = BoxDrawState.IDLE;
        this.core = core;
        this.data = box;
        this.T = core.props.config.TOOL_COLL // distance for collision

        this.hover = false;
        this.selected = false;
        this.onSelect = () => {};

        // Pins = Ecken
        this.pins = [
            new core.lib.Pin(core, this, 'p1'), // top-left
            new core.lib.Pin(core, this, 'p2')  // bottom-right
        ];

        if (nw) this.pins[1].state = 'tracking';
    }

    draw(ctx) {
        const layout = this.core.layout;

        const [t1, v1] = this.data.p1;
        const [t2, v2] = this.data.p2;

        const x1 = layout.time2x(t1);
        const y1 = layout.value2y(v1);

        const x2 = layout.time2x(t2);
        const y2 = layout.value2y(v2);

        const width = x2 - x1;
        const height = y2 - y1;

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#3355ff';
        ctx.fillStyle = 'rgba(51,85,255,0.2)';

        ctx.rect(x1, y1, width, height);
        ctx.fill();
        ctx.stroke();

        if (this.hover || this.selected) {
            for (var pin of this.pins) {
                pin.draw(ctx);
            }
        }
    }

    collision() {
        // LATER: check whick type of colliosion
        //{ type: 'corner' | 'edge' | 'inside' | null }

        const mouse = this.core.mouse;
        const layout = this.core.layout;

        const [t1, v1] = this.data.p1;
        const [t2, v2] = this.data.p2;

        const x1 = layout.time2x(t1);
        const y1 = layout.value2y(v1);

        const x2 = layout.time2x(t2);
        const y2 = layout.value2y(v2);

        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        const corners = [
            [minX, minY],
            [minX, maxY],
            [maxX, minY],
            [maxX, maxY]
        ];

        for (const [cx, cy] of corners) {
            const dx = mouse.x - cx;
            const dy = mouse.y - cy;

            if (Math.sqrt(dx * dx + dy * dy) < this.T) {
                return true;
            }
        }

        return false;
    }

    propagate(name, data) {
        for (var pin of this.pins) {
            pin[name](data);
        }
    }

    mousedown(event) {
        this.propagate('mousedown', event);

        if (event.button !== 0) return;
        switch (this.currentState) {
            case BoxDrawState.IDLE:
                this.currentState = BoxDrawState.DRAWING
                if (this.collision()) { // WHY?
                    this.onSelect(this.data.uuid)
                }
                break

            case BoxDrawState.DRAWING:
                this.pins[1].update();
                this.currentState = BoxDrawState.SET;
                break
            
            case BoxDrawState.SET:
                if (this.hover) {
                    for (var pin of this.pins) {
                        if (pin.hover() && pin.state === 'settled') {
                            pin.state = 'tracking';
                            this.currentState = BoxDrawState.REDRAW;
                        }
                    }
                }
                break

            case BoxDrawState.REDRAW:
                this.currentState = BoxDrawState.SET;
                break;
        }
    }

    mouseup(event) {
        this.propagate('mouseup', event);
    }

    mousemove(event) {
        this.hover = this.collision();

        switch (this.currentState) {

            // draw box
            case BoxDrawState.DRAWING: {
                const layout = this.core.layout;

                const dt = this.core.cursor.time;
                const dv = layout.y2value(this.core.cursor.y);

                this.data.p2 = [dt, dv];
                break;
            }
        }

        this.propagate('mousemove', event);
    }
}