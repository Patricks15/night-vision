const TradeBoxDrawState = Object.freeze({
    IDLE: 'idle',
    DRAWING: 'drawing',
    SET: 'set',
    REDRAW: 'redraw'
})

export default class TradePositionBox {

    constructor(core, trade, nw = false) {
        this.currentState = TradeBoxDrawState.IDLE
        this.core = core
        this.data = trade
        this.T = core.props.config.TOOL_COLL

        this.hover = false
        this.selected = false
        this.onSelect = () => {}

        this.rr = Number(this.data.rr || 2)
        if (!Number.isFinite(this.rr) || this.rr <= 0) {
            this.rr = 2
        }

        this.colors = {
            entry: '#bcbfc3',
            stop: '#ff4d4f',
            take: '#00c26f',
            riskFill: 'rgba(255, 77, 79, 0.20)',
            rewardFill: 'rgba(0, 194, 111, 0.20)'
        }

        this.pins = [
            new core.lib.Pin(core, this, 'p1'), // entry day
            new core.lib.Pin(core, this, 'p2'), // stop loss
            new core.lib.Pin(core, this, 'p3') // take profit
        ]

        if (nw) {
            this.pins[1].state = 'tracking'
            this.pins[2].state = 'tracking'
        }
    }

    takeProfitValue() {
        const entry = this.data.p1[1]
        const stop = this.data.p2[1]
        return entry + (entry - stop) * this.rr
    }

    draw(ctx) {
        const layout = this.core.layout

        const [t1, entry] = this.data.p1
        const [t2, stop] = this.data.p2
        const take = this.takeProfitValue()

        const x1 = layout.time2x(t1)
        const x2 = layout.time2x(t2)
        const left = Math.min(x1, x2)
        const right = Math.max(x1, x2)
        const width = right - left

        const yEntry = layout.value2y(entry)
        const yStop = layout.value2y(stop)
        const yTake = layout.value2y(take)

        this.drawZone(ctx, left, width, yEntry, yStop, this.colors.riskFill)
        this.drawZone(ctx, left, width, yEntry, yTake, this.colors.rewardFill)

        this.drawLevel(ctx, left, right, yEntry, this.colors.entry, 2)
        this.drawLevel(ctx, left, right, yStop, this.colors.stop, 2)
        this.drawLevel(ctx, left, right, yTake, this.colors.take, 2)

        this.drawLabel(ctx, right + 6, yEntry - 6, 'Entry')
        this.drawLabel(ctx, right + 6, yStop - 6, 'SL')
        this.drawLabel(ctx, right + 6, yTake - 6, `TP (${this.rr.toFixed(1)}R)`)

        if (this.hover || this.selected) {
            console.log("-----")
            for (var pin of this.pins) {
                console.log(pin.name, pin.state)
                console.log(pin.data[pin.name])
                pin.draw(ctx)
            }
        }
    }

    drawZone(ctx, left, width, yA, yB, fillStyle) {
        const top = Math.min(yA, yB)
        const height = Math.abs(yB - yA)

        ctx.fillStyle = fillStyle
        ctx.fillRect(left, top, width, height)
    }

    drawLevel(ctx, left, right, y, color, lineWidth) {
        ctx.beginPath()
        ctx.lineWidth = lineWidth
        ctx.strokeStyle = color
        ctx.moveTo(left, y)
        ctx.lineTo(right, y)
        ctx.stroke()
    }

    drawLabel(ctx, x, y, text) {
        ctx.fillStyle = '#f2f2f2'
        ctx.font = this.core.lib.rescaleFont(this.core.props.config.FONT, 11)
        ctx.fillText(text, x, y)
    }

    collision() {
        const mouse = this.core.mouse
        const layout = this.core.layout

        const [t1, entry] = this.data.p1
        const [t2, stop] = this.data.p2
        const take = this.takeProfitValue()

        const x1 = layout.time2x(t1)
        const x2 = layout.time2x(t2)

        const minX = Math.min(x1, x2) - this.T
        const maxX = Math.max(x1, x2) + this.T

        const yEntry = layout.value2y(entry)
        const yStop = layout.value2y(stop)
        const yTake = layout.value2y(take)

        const minY = Math.min(yEntry, yStop, yTake) - this.T
        const maxY = Math.max(yEntry, yStop, yTake) + this.T

        if (mouse.x >= minX && mouse.x <= maxX &&
            mouse.y >= minY && mouse.y <= maxY) {
            return true
        }

        return false
    }

    propagate(name, data) {
        for (var pin of this.pins) {
            pin[name](data)
        }
    }

    mousedown(event) {
        this.propagate('mousedown', event)

        if (event.button !== 0) return

        switch (this.currentState) {
            case TradeBoxDrawState.IDLE:
                this.currentState = TradeBoxDrawState.DRAWING
                if (this.collision()) {
                    this.onSelect(this.data.uuid)
                }
                break

            case TradeBoxDrawState.DRAWING:
                this.pins[1].update()
                this.currentState = TradeBoxDrawState.SET
                break

            case TradeBoxDrawState.SET:
                if (this.hover) {
                    for (var pin of this.pins) {
                        if (pin.hover() && pin.state === 'settled') {
                            pin.state = 'tracking'
                            this.currentState = TradeBoxDrawState.REDRAW
                        }
                    }
                }
                break

            case TradeBoxDrawState.REDRAW:
                this.currentState = TradeBoxDrawState.SET
                break
        }
    }

    mouseup(event) {
        this.propagate('mouseup', event)
    }

    mousemove(event) {
        this.hover = this.collision()

        const layout = this.core.layout

        switch (this.currentState) {
            case TradeBoxDrawState.DRAWING: {
                // set stop loss level by drawing the box
                const dt = this.core.cursor.ti
                const dv = layout.y2value(this.core.cursor.y)
                console.log(dt)
                this.data.p2 = [dt, dv]
                // set take profit level based on RR
                const take = this.takeProfitValue()
                this.data.p3 = [dt, take]
                console.log(this.data.p2)
                console.log(this.data.p3)
                break

            }

            case TradeBoxDrawState.REDRAW: {
                const dt = this.core.cursor.time
                const dv = layout.y2value(this.core.cursor.y)

                if (this.pins[0].state === 'tracking') {
                    const riskDistance = this.data.p2[1] - this.data.p1[1]
                    const currentEnd = this.data.p2[0]

                    this.data.p1 = [dt, dv]
                    this.data.p2 = [currentEnd, dv + riskDistance]
                }

                if (this.pins[1].state === 'tracking') {
                    this.data.p2 = [dt, dv]
                }

                break
            }
        }

        this.propagate('mousemove', event)
    }
}
