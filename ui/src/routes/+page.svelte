<script lang="ts">
    import {onMount} from 'svelte'
    import {InspectPoint, OpenPage, type Point, type Size} from 'qwerky-contract'
    import {type BoundingBox, buildBoundingBoxes} from '$lib/BoundingBox'
    import type {InspectResult} from '$lib/InspectResult'
    import {QwerkyClient} from '$lib/QwerkyClient.js'
    import Header from './app_header.svelte'
    import Panel from './app_panel.svelte'
    import Footer from './app_footer.svelte'
    import PageImage from './open_page.svelte'
    import UrlForm from './url_form.svelte'

    let qc: QwerkyClient
    let pageLoading: boolean = $state(false)
    let url: string | null = $state(null)
    let currentPageImage: { base64: string, size: Size } | null = $state(null)
    let inspectResult: InspectResult | null = $state(null)
    let boundingBoxes: Array<BoundingBox> | null = $derived(buildBoundingBoxes(inspectResult?.elements))

    onMount(() => {
        qc = QwerkyClient.connect({
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
        })
    })

    function onUrl(event: CustomEvent<string>) {
        pageLoading = true
        url = event.detail
        console.log(JSON.stringify(url))
        qc.sendMessage(new OpenPage(undefined, url))
    }

    function onInspectPoint(event: CustomEvent<Point>) {
        inspectResult = null
        console.log(JSON.stringify(event.detail))
        qc.sendMessage(new InspectPoint(undefined, event.detail))
    }
</script>

<Header pageLoading={pageLoading} url={url}/>
<Panel inspectResult={inspectResult}/>
{#if !url}
    <UrlForm on:url={onUrl}/>
{:else if currentPageImage !== null}
    <PageImage url={url}
               imageBase64={currentPageImage.base64}
               imageSize={currentPageImage.size}
               boundingBoxes={boundingBoxes}
               on:inspectPoint={onInspectPoint}/>
{/if}
<Footer/>
