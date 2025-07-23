<!-- App.svelte -->
<script>
import.meta.hot
import { NightVision } from './index.js'
import { onMount } from 'svelte'
import data from '../data/data-ohlcv-rsi.json?id=main'
import data2 from '../data/data-area.json?id=main-2'
import data3 from '../data/data-aapl.json?id=main-3'
import TestStack from '../tests/testStack.js'


// Tests
import fullReset from '../tests/data-sync/fullReset.js'
import paneAddRem from '../tests/data-sync/paneAddRem.js'
import paneSettings from '../tests/data-sync/paneSettings.js'
import ovAddRem from '../tests/data-sync/ovAddRem.js'
import scaleChange from '../tests/data-sync/scaleChange.js'
import mainOverlay from '../tests/data-sync/mainOverlay.js'
import ovSettings from '../tests/data-sync/ovSettings.js'
import ovPropsChange from '../tests/data-sync/ovPropsChange.js'
import ovDataChange from '../tests/data-sync/ovDataChange.js'

// More tests
import realTime from '../tests/real-time/realTime.js'

// More tests
import timeBased from '../tests/tfs-test/allTimeBased.js'
import indexBased from '../tests/tfs-test/allIndexBased.js'

// More tests
import indicators from '../tests/indicators/indicators.js'
import rangeTool from '../tests/tools/rangeTool.js'
import lineTool from '../tests/tools/lineTool.js'
import watchPropTest from '../tests/navy/watchPropTest.js'

// More tests
import logScaleTest from '../tests/scales/logScale.js'
import memoryTest from '../tests/memory/memoryTest.js'

/*
TODO: data-api interface:
.getPanes()
.getAllOverlays()
.pane('main').getRenderers()
.pane(0).getOverlay('<name>').getRenderer() // id
...
*/

// TODO: Memory leak tests

let stack = new TestStack()
let chart = null

//data.indexBased = true

onMount(() => {
    chart = new NightVision('chart-container', {
        data: data,
        //autoResize: true,
        //indexBased: true
    })
    //chart.data = data2
    window.chart = chart
    window.stack = stack

    stack.setGroup('data-sync')

    fullReset(stack, chart)
    paneAddRem(stack, chart)
    paneSettings(stack, chart)
    ovAddRem(stack, chart)
    scaleChange(stack, chart)
    mainOverlay(stack, chart)
    ovSettings(stack, chart)
    ovPropsChange(stack, chart)
    ovDataChange(stack, chart)

    stack.setGroup('real-time')

    realTime(stack, chart)

    stack.setGroup('tfs-test')

    timeBased(stack, chart)
    indexBased(stack, chart)

    stack.setGroup('ind-test')

    indicators(stack, chart)

    stack.setGroup('tools-test')

    rangeTool(stack, chart)
    lineTool(stack, chart)

    stack.setGroup('navy-test')

    watchPropTest(stack, chart)

    stack.setGroup('scales-test')

    logScaleTest(stack, chart)

    stack.setGroup('memory-test')

    memoryTest(stack, chart)

    //  Type in the console: stack.execAll()
    //  or: stack.exec('<group>')

    console.log("*****")
    console.log(chart)
    console.log("*****")
    for (var p = 0; p < 2; p++) {
        chart.data.panes[p].overlays.push({
            name: 'RangeTool',
            type: 'RangeTool',
            data: [],
            props: {},
            settings: {
                zIndex: 1000
            }
        })
    }
    chart.update()

    console.log("*****")

})


function addLineTool() {
    console.log("Linie wurde hinzugefügt");
}

function addMessureTool() {
    console.log("Text wurde hinzugefügt");
}

function addBox() {
    console.log("Box wurde hinzugefügt");
}

</script>
<style>

.app {
    display: flex;
    height: 100%;
}

#chart-container {
    flex: 1;
    position: relative;
    height: 100%;
}

.toolbar {
    width: 40px;
    background-color: #14151c;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 10px;
    box-shadow: 1px 0 3px rgba(128, 128, 128, 0.1);
    z-index: 2;
}

.RowToolbar {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 20px;
}

.RowToolbar button {
    width: 35px;
    height: 35px;
    background-color: transparent;
    border-color: #adadad;
    border-width: 1px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    transition: background-color 0.2s ease;
}

.RowToolbar button:hover {
    border-color: #0083cf;
}

.RowToolbar svg {
    width: 16px;
    height: 16px;
    fill: #adadad;
}

.RowToolbar button:hover svg {
    fill: #0083cf;
}

</style>

<div class="app">
    <div class="toolbar">
        <div class="RowToolbar">
            <button on:click={addLineTool}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    <path d="M190.4 74.1c5.6-16.8-3.5-34.9-20.2-40.5s-34.9 3.5-40.5 20.2l-128 384c-5.6 16.8 3.5 34.9 20.2 40.5s34.9-3.5 40.5-20.2l128-384zm70.9-41.7c-17.4-2.9-33.9 8.9-36.8 26.3l-64 384c-2.9 17.4 8.9 33.9 26.3 36.8s33.9-8.9 36.8-26.3l64-384c2.9-17.4-8.9-33.9-26.3-36.8zM352 32c-17.7 0-32 14.3-32 32l0 384c0 17.7 14.3 32 32 32s32-14.3 32-32l0-384c0-17.7-14.3-32-32-32z"/>
                </svg>
            </button>
            <button on:click={addMessureTool}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M177.9 494.1c-18.7 18.7-49.1 18.7-67.9 0L17.9 401.9c-18.7-18.7-18.7-49.1 0-67.9l50.7-50.7 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 50.7-50.7c18.7-18.7 49.1-18.7 67.9 0l92.1 92.1c18.7 18.7 18.7 49.1 0 67.9L177.9 494.1z"/>
                </svg>
            </button>
            <button on:click={addBox}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path d="M384 80c8.8 0 16 7.2 16 16l0 320c0 8.8-7.2 16-16 16L64 432c-8.8 0-16-7.2-16-16L48 96c0-8.8 7.2-16 16-16l320 0zM64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32z"/>
                </svg>
            </button>
        </div>
    </div>
    <div id="chart-container"></div>
</div>
