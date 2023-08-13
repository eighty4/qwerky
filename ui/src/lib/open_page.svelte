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

    function onClick(e) {
        const boundingRect = e.currentTarget.getBoundingClientRect()
        const point = new Point(e.clientX - boundingRect.left, e.clientY - boundingRect.top)
        dispatch('inspectPoint', point)
    }
</script>

<img alt={`Screenshot of ${url}`} src={imageSrc} on:click={onClick}/>

{#if boundingBoxes}
    {#each boundingBoxes as boundingBox}
        <BoundingBox rect={boundingBox}/>
    {/each}
{/if}

<style>
    img {
        box-sizing: border-box;
        position: relative;
    }
</style>
