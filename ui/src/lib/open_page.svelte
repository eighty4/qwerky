<script lang="ts">
    import {createEventDispatcher} from 'svelte'
    import {Point} from 'qwerky-contract'

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

<style>
    img {
        box-sizing: border-box;
        position: relative;
    }
</style>
