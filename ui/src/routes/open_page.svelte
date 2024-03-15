<script lang="ts">
    import {createEventDispatcher} from 'svelte'
    import {Point, type Rect} from 'qwerky-contract'
    import BoundingBox from './bounding_box.svelte'

    export let boundingBoxes: Array<Rect> | undefined = undefined
    export let imageBase64: string
    export let url: string

    const dispatch = createEventDispatcher<{ inspectPoint: Point }>()

    let imageSrc: string
    $: imageSrc = 'data:image/png;base64,' + imageBase64

    function onClick(e: MouseEvent) {
        const boundingRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const point = new Point(e.clientX - boundingRect.left, e.clientY - boundingRect.top)
        dispatch('inspectPoint', point)
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->

<img alt={`Screenshot of ${url}`} src={imageSrc} onclick={onClick}/>

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
    }
</style>
