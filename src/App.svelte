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

data.indexBased = true

onMount(() => {
    chart = new NightVision('chart-container', {
        data: data,
        colors: { back: 'black' },
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

    // activate range tool script
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

    // activate boundingbox box tool script
    for (var p = 0; p < 2; p++) {
        chart.data.panes[p].overlays.push({
            name: 'BoxTool',
            type: 'BoxTool',
            data: [],
            dataExt: {
                lines: [{}]
            }, // Here we place non-timeseries data
            props: {},
            settings: {
                zIndex: 1
            }
        })
    }
    chart.update()

    // for (var p = 0; p < 2; p++) {
    //     chart.data.panes[p].overlays.push({
    //         name: 'LineTool',
    //         type: 'LineTool',
    //         data: [],
    //         dataExt: {
    //             lines: [
    //                     {
    //                         type: 'segment',
    //                         p1: [4116, 4.84],
    //                         p2: [4163, 4.54],
    //                         uuid: '123'
    //                     }
    //                 ]
    //         }, // Here we place non-timeseries data
    //         props: {},
    //         settings: {
    //             zIndex: 1
    //         }
    //     })
    // }
    // chart.update()


})

let isDark = false;
function toggleTheme() {
    chart.destroy()

    isDark = !isDark;
    let backgroundColor = "#ffffff";
    if (isDark){
        backgroundColor = "#000023";
    }

    chart = new NightVision('chart-container', {
        data: data,
        colors: { back: backgroundColor },
        //autoResize: true,
        //indexBased: true
    })
}

</script>

<style>

.app {
    display: flex;
    height: 100%;
}

.chart-wrapper {
    position: relative; /* Referenz für den Button */
    width: 100%;
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

.btnTool {
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

.btnTool:hover {
    border-color: #0083cf;
}

.btnTool.active {
    background-color: #6ab2ff56;
}

.RowToolbar svg {
    width: 16px;
    height: 16px;
    fill: #adadad;
}

.crosshair-icon line {
  stroke: #adadad;
  stroke-width: 4;
}

.RowToolbar button:hover line {
    stroke: #0083cf;
}

.RowToolbar button:hover svg {
    fill: #0083cf;
}

.theme-toggle-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10; /* sicherstellen, dass Button über Chart liegt */
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    background: #eee;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

</style>

<div class="app">

    <div class="toolbar">
        <div class="RowToolbar">
            <button class="btnTool" id="idBtnToolCursor">
                <svg class="crosshair-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="20" height="20">
                    <line x1="50" y1="0" x2="50" y2="100"/>
                    <line x1="0" y1="50" x2="100" y2="50"/>
                </svg>
            </button>
            <button class="btnTool" id="idBtnToolLine">   <!-- on:click={addLineTool} -->
                <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!-- Linie (länger & deutlicher) -->
                <path
                  d="M3 21 L21 3"
                  stroke="white"
                  stroke-width="3.5"
                  stroke-linecap="round"
                />

                <!-- Punkt links unten (größer) -->
                <path
                  d="M3 21
                     m -3.5,0
                     a 3.5,3.5 0 1,0 7,0
                     a 3.5,3.5 0 1,0 -7,0"
                />

                <!-- Punkt rechts oben (größer) -->
                <path
                  d="M21 3
                     m -3.5,0
                     a 3.5,3.5 0 1,0 7,0
                     a 3.5,3.5 0 1,0 -7,0"
                />
              </svg>


            </button>
            <button class="btnTool" id="idBtnToolRange">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M177.9 494.1c-18.7 18.7-49.1 18.7-67.9 0L17.9 401.9c-18.7-18.7-18.7-49.1 0-67.9l50.7-50.7 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 50.7-50.7c18.7-18.7 49.1-18.7 67.9 0l92.1 92.1c18.7 18.7 18.7 49.1 0 67.9L177.9 494.1z"/>
                </svg>
            </button>
            <button class="btnTool" id="idBtnToolBox">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path d="M384 80c8.8 0 16 7.2 16 16l0 320c0 8.8-7.2 16-16 16L64 432c-8.8 0-16-7.2-16-16L48 96c0-8.8 7.2-16 16-16l320 0zM64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32z"/>
                </svg>
            </button>
        </div>
    </div>

    <!-- Chart + Button Wrapper -->
    <div class="chart-wrapper">
        <button class="theme-toggle-btn" on:click={toggleTheme}>
            {isDark ? "🌙 Dark" : "☀️ Light"}
        </button>
        <div id="chart-container"></div>
    </div>

</div>
