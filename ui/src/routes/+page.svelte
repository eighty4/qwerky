<script lang="ts">
    import {InspectPoint, OpenPage, Point} from 'qwerky-contract'
    import {onMount} from 'svelte'
    import PageImage from '$lib/open_page.svelte'
    import UrlForm from '$lib/url_form.svelte'
    import {QwerkyClient} from '$lib/QwerkyClient.js'

    let qc: QwerkyClient
    let url: string | undefined
    let pageImageData: string

    onMount(() => {
        qc = new QwerkyClient(new WebSocket('ws://localhost:5394/api'), {
            onImageData(image, size) {
                pageImageData = image
            },
            onDescribePoint(point, element) {
                console.log('describe', point, element)
            },
            onDescribeSelector(selector, element) {
                console.log('describe', selector, element)
            },
        })
    })

    function onUrl(event: CustomEvent<string>) {
        url = event.detail
        console.log(JSON.stringify(url))
        qc.sendMessage(new OpenPage(undefined, url))
    }

    function onInspectPoint(event: CustomEvent<Point>) {
        console.log(JSON.stringify(event.detail))
        qc.sendMessage(new InspectPoint(undefined, event.detail))
    }
</script>

{#if !url}
    <UrlForm on:url={onUrl}/>
{:else}
    <PageImage url={url} imageBase64={pageImageData} on:inspectPoint={onInspectPoint}/>
{/if}
