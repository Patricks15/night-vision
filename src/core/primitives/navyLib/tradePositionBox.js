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
        const [_, take] = this.data.p3

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

        // --- Info box (like RangeTool) ---
        const tpAbs = take
        const slAbs = stop
        const tpPct = ((take - entry) / entry) * 100
        const slPct = ((stop - entry) / entry) * 100
        const rr = Math.abs((take - entry) / (entry - stop))

        const text1 = `TP: ${tpAbs.toFixed(2)} (${tpPct >= 0 ? '+' : ''}${tpPct.toFixed(2)}%)`
        const text2 = `SL: ${slAbs.toFixed(2)} (${slPct >= 0 ? '+' : ''}${slPct.toFixed(2)}%)`
        const text3 = `RR: ${rr.toFixed(2)}`
        const font = this.core.lib.rescaleFont(this.core.props.config.FONT, 14)
        ctx.font = font
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const textLines = [text1, text2, text3]
        const textWidth = Math.max(...textLines.map(line => ctx.measureText(line).width))
        const padding = 10
        const boxWidth = textWidth + 2 * padding
        const boxHeight = 60
        // Place above entry line if possible, else below
        const boxX = right - boxWidth / 2
        const boxY = Math.min(yEntry, yStop, yTake) - boxHeight - 12 > 0
            ? Math.min(yEntry, yStop, yTake) - boxHeight - 12
            : Math.max(yEntry, yStop, yTake) + 12
        // Draw rounded rect (reuse RangeTool style)
        ctx.fillStyle = '#222c'
        if (this.core.lib.roundRect) {
            this.core.lib.roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 6)
        } else {
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight)
        }
        // Draw text
        ctx.fillStyle = '#fff'
        ctx.font = font
        ctx.fillText(text1, boxX + boxWidth / 2, boxY + boxHeight / 4)
        ctx.fillText(text2, boxX + boxWidth / 2, boxY + boxHeight / 2)
        ctx.fillText(text3, boxX + boxWidth / 2, boxY + 3 * boxHeight / 4)

        if (this.hover || this.selected) {
            for (var pin of this.pins) {
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
        const [_, take] = this.data.p3

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
                let dv = layout.y2value(this.core.cursor.y)
                // SL must be <= entry
                const entry = this.data.p1[1]
                if (dv > entry) dv = entry
                this.data.p2 = [dt, dv]

                // set take profit level based on RR
                let take = this.takeProfitValue()
                // TP must be >= entry
                if (take < entry) take = entry
                this.data.p3 = [dt, take]
                this.pins[2].force_update('p3')
                break
            }

            case TradeBoxDrawState.REDRAW: {
                const dt = this.core.cursor.ti
                let dv = layout.y2value(this.core.cursor.y)
                const entry = this.data.p1[1]

                // if pin0 is tracking (entry)
                if (this.pins[0].state === 'tracking') {
                    this.data.p1 = [dt, dv]
                    // enforce SL <= entry
                    if (this.data.p2[1] > dv) {
                        this.data.p2[1] = dv
                        this.pins[1].force_update('p2')
                    }
                    // enforce TP >= entry
                    if (this.data.p3[1] < dv) {
                        this.data.p3[1] = dv
                        this.pins[2].force_update('p3')
                    }
                }

                // if pin1 is tracking (SL)
                if (this.pins[1].state === 'tracking') {
                    // SL must be <= entry
                    if (dv > entry) dv = entry
                    this.data.p2 = [dt, dv]
                    // update also take profit index
                    this.data.p3[0] = dt
                    // enforce TP >= entry
                    if (this.data.p3[1] < entry) this.data.p3[1] = entry
                    this.pins[2].force_update('p3')
                }

                // if pin2 is tracking (TP)
                if (this.pins[2].state === 'tracking') {
                    // TP must be >= entry
                    if (dv < entry) dv = entry
                    this.data.p3 = [dt, dv]
                    // update also take stop loss index
                    this.data.p2[0] = dt
                    // enforce SL <= entry
                    if (this.data.p2[1] > entry) this.data.p2[1] = entry
                    this.pins[1].force_update('p2')
                }
                break
            }
        }

        this.propagate('mousemove', event)
    }
}
