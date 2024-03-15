<script lang="ts">
    import {createEventDispatcher} from 'svelte'
    import {Point, type Rect, type Size} from 'qwerky-contract'
    import BoundingBox from './bounding_box.svelte'

    interface OpenPageProps {
        boundingBoxes: Array<Rect>
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

<img alt={`Screenshot of ${url}`} src={imageSrc} bind:this={imageElem} onclick={onClick}/>

{#if boundingBoxes}
    {#each boundingBoxes as boundingBox}
        <BoundingBox rect={boundingBox}/>
    {/each}
{/if}

<style>
    img {
        box-sizing: border-box;
        position: relative;
        top: var(--header-height);
        padding-bottom: var(--footer-height);
        z-index: var(--page-img-z-index);
        width: calc(100% - var(--panel-width));
        aspect-ratio: var(--img-width, 1) / var(--img-height, 1);
    }
</style>
