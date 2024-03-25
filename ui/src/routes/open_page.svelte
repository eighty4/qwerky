<script lang="ts">
    import {createEventDispatcher} from 'svelte'
    import {Point, type Size} from 'qwerky-contract'
    import type {BoundingBox} from '$lib/BoundingBox'
    import ElementHighlight from './element_highlight.svelte'

    interface OpenPageProps {
        boundingBoxes?: Array<BoundingBox>
        imageBase64: string
        imageSize: Size
        url: string
    }

    let {boundingBoxes, imageBase64, imageSize, url}: OpenPageProps = $props()

    const dispatch = createEventDispatcher<{ inspectPoint: Point }>()

    let imageSrc = $derived('data:image/png;base64,' + imageBase64)
    let imageElem: HTMLImageElement

    function onClick(e: MouseEvent) {
        const scaledClickX = Math.floor((e.offsetX * imageSize.width) / imageElem.width)
        const scaledClickY = Math.floor((e.offsetY * imageSize.height) / imageElem.height)
        // todo this scaled click point is miscalculated by ~(+10, +3) px
        dispatch('inspectPoint', new Point(scaledClickX, scaledClickY))
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->

<div id="page" style="--page-img-src-w: {imageSize.width}; --page-img-src-h: {imageSize.height}">
    <img alt={`Screenshot of ${url}`} src={imageSrc} bind:this={imageElem} onclick={onClick}/>

    {#if boundingBoxes}
        {#each boundingBoxes as boundingBox}
            <ElementHighlight color={boundingBox.color} rect={boundingBox.rect}/>
        {/each}
    {/if}
</div>

<style>
    #page {
        --page-img-src-ar: calc(var(--page-img-src-w) / var(--page-img-src-h));
        --page-img-scaled-h: calc(var(--page-img-src-h) * var(--page-img-src-ar));
        --page-img-scale-w-r: calc(var(--page-img-scaled-w) / var(--page-img-src-w));
        --page-img-scale-h-r: calc(var(--page-img-scaled-h) / var(--page-img-src-h));
    }

    #page img {
        box-sizing: border-box;
        position: relative;
        top: var(--header-height);
        padding-bottom: var(--footer-height);
        z-index: var(--page-img-z-index);
        width: var(--page-img-scaled-w);
        height: var(--page-img-scaled-h);
        /*aspect-ratio: var(--page-img-scaled-ar);*/
    }
</style>
