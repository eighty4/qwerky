<script lang="ts">
    import {Point, type Size} from '@eighty4/qwerky-contract'
    import type {BoundingBox} from '$lib/data/BoundingBox'
    import ElementHighlight from './element_highlight.svelte'

    interface OpenPageProps {
        boundingBoxes: Array<BoundingBox> | null
        highlightPalette: Array<string>
        imageBase64: string
        imageSize: Size
        onInspectPoint: (point: Point) => void
    }

    let {boundingBoxes, highlightPalette, imageBase64, imageSize, onInspectPoint}: OpenPageProps = $props()

    let pageElem: HTMLDivElement

    $effect(() => {
        pageElem.style.backgroundImage = `url('data:image/png;base64,${imageBase64}')`
        pageElem.style.setProperty('--page-img-w', String(imageSize.width))
        pageElem.style.setProperty('--page-img-h', String(imageSize.height))
    })

    let panning: boolean = $state(false)
    let mouseDownY: false | number
    let panStartY: number = 0
    let panY: number = 0
    let scrollY: number = 0

    function onMouseDown(e: MouseEvent) {
        mouseDownY = e.offsetY
    }

    function onClick(e: MouseEvent) {
        if (panning) {
            clearPanning()
            return
        }
        mouseDownY = false
        if (scrollY > 0 && scrollY > e.offsetY) {
            return
        }
        const pageRatio = pageElem.clientWidth / imageSize.width
        const imageScaledHeight = pageRatio * imageSize.height
        const viewportClickY = Math.abs(scrollY - e.offsetY)
        if (viewportClickY > imageScaledHeight) {
            return
        }
        const clickY = Math.floor((viewportClickY / imageScaledHeight) * imageSize.height)
        const clickX = Math.floor((e.offsetX * imageSize.width) / pageElem.clientWidth)
        onInspectPoint(new Point(clickX, clickY))
    }

    function onMouseMove(e: MouseEvent) {
        if (!panning) {
            if (mouseDownY !== false && Math.abs(mouseDownY - e.offsetY) > 5) {
                startPanning(e.offsetY)
            }
            return
        }
        panY = (panStartY - e.offsetY) * -2
        pageElem.style.setProperty('--page-scroll-y', (panY + scrollY) + 'px')
    }

    function startPanning(y: number) {
        console.log('start panning')
        mouseDownY = false
        panning = true
        panStartY = y
    }

    function clearPanning() {
        if (panning) {
            console.log('stop panning')
            mouseDownY = false
            panning = false
            scrollY += panY
            pageElem.style.setProperty('--page-scroll-y', scrollY + 'px')
        }
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_mouse_events_have_key_events, a11y_no_noninteractive_element_interactions -->

<div id="page"
     class:panning={panning}
     bind:this={pageElem}
     role="img"
     onclick={onClick}
     onmousedown={onMouseDown}
     onmouseleave={clearPanning}
     onmousemove={onMouseMove}
     onmouseout={clearPanning}>

    {#if boundingBoxes}
        {#each boundingBoxes.reverse() as boundingBox, i}
            <ElementHighlight color={highlightPalette[boundingBoxes.length - 1 - i]} boundingBox={boundingBox}/>
        {/each}
    {/if}
</div>

<style>
    #page {
        --page-viewport-h: calc(100vh - var(--header-height) - var(--footer-height));
        --page-viewport-w: calc(100vw - var(--edge-width) - var(--panel-width));
        --page-img-ar: calc(var(--page-img-w) / var(--page-img-h));
        --page-scale-ar: calc(var(--page-scaled-w) / var(--page-img-w));
        --page-scaled-w: var(--page-viewport-w);
        --page-scaled-h: calc((var(--page-viewport-w) / var(--page-img-w)) * var(--page-img-h));
        --page-scroll-y: 0px;
        background-position-y: var(--page-scroll-y);
        background-repeat: no-repeat;
        background-size: 100%;
        height: 100%;
        width: 100%;
        user-select: none;
        cursor: grab;
    }

    #page.panning {
        cursor: grabbing;
    }
</style>
