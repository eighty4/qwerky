<script lang="ts">
    import {onMount} from 'svelte'
    import {InspectPoint, OpenPage, type Point, type Size} from 'qwerky-contract'
    import {type BoundingBox, buildBoundingBoxes} from '$lib/data/BoundingBox'
    import type {InspectResult} from '$lib/data/InspectResult'
    import {QwerkyClient} from '$lib/data/QwerkyClient.js'
    import UrlForm from '$lib/components/url_form.svelte'
    import Footer from '$lib/footer/qwerky_footer.svelte'
    import Header from '$lib/header/qwerky_header.svelte'
    import Panel from '$lib/panel/app_panel.svelte'
    import PageImage from '$lib/page/open_page.svelte'

    let qwerkyClient: QwerkyClient | null = $state(null)
    let pageLoading: boolean = $state(false)
    let url: string | null = $state(null)
    let currentPageImage: { base64: string, size: Size } | null = $state(null)
    let inspectResult: InspectResult | null = $state(null)
    let boundingBoxes: Array<BoundingBox> | null = $derived.by(() => buildBoundingBoxes(inspectResult?.elements))

    onMount(() => QwerkyClient.connect({
        onImageData(base64, size: Size) {
            pageLoading = false
            currentPageImage = {base64, size}
        },
        onDescribePoint(point, elements) {
            console.log('describe', point, elements)
            inspectResult = {point, elements}
        },
        onDescribeSelector(selector, elements) {
            console.log('describe', selector, elements)
            inspectResult = {selector, elements}
        },
        onConnectionLost() {
            document.body.innerHTML = '<div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: maroon; display: flex; justify-content: center; align-items: center"><span>ERRCONN: reload webpage</span></div>'
        },
    }).then(qc => qwerkyClient = qc))

    function onUrl(event: CustomEvent<string>) {
        pageLoading = true
        url = event.detail
        console.log(JSON.stringify(url))
        qwerkyClient!.sendMessage(new OpenPage(qwerkyClient!.sessionId, url))
    }

    function onInspectPoint(event: CustomEvent<Point>) {
        inspectResult = null
        console.log(JSON.stringify(event.detail))
        qwerkyClient!.sendMessage(new InspectPoint(qwerkyClient!.sessionId, event.detail))
    }
</script>

<Header pageLoading={pageLoading} url={url}/>
<Panel inspectResult={inspectResult}/>
{#if qwerkyClient}
    {#if !url}
        <UrlForm on:url={onUrl}/>
    {:else if currentPageImage !== null}
        <PageImage imageBase64={currentPageImage.base64}
                   imageSize={currentPageImage.size}
                   boundingBoxes={boundingBoxes}
                   on:inspectPoint={onInspectPoint}/>
    {/if}
{/if}
<Footer/>
