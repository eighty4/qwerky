<script lang="ts">
    import {onMount} from 'svelte'
    import {InspectPoint, OpenPage, type Point, type Size} from '@eighty4/qwerky-contract'
    import {type BoundingBox, buildBoundingBoxes} from '$lib/data/BoundingBox'
    import type {InspectResult} from '$lib/data/InspectResult'
    import {QwerkyClient} from '$lib/data/QwerkyClient.js'
    import UrlForm from '$lib/components/url_form.svelte'
    import Footer from '$lib/footer/qwerky_footer.svelte'
    import Header from '$lib/header/qwerky_header.svelte'
    import Panel from '$lib/panel/app_panel.svelte'
    import PageImage from '$lib/page/open_page.svelte'
    import {getColorPalette} from '$lib/data/colors'

    let qwerkyClient: QwerkyClient | null = $state(null)
    let pageLoading: boolean = $state(false)
    let url: string | null = $state(null)
    let currentPageImage: { base64: string, size: Size } | null = $state(null)
    let inspectResults: Array<InspectResult> = $state([])
    let focusedInspectIndex: number = $state(-1)
    let focusedInspect: InspectResult | null = $derived.by(() => {
        if (inspectResults[focusedInspectIndex]) {
            return inspectResults[focusedInspectIndex]
        } else {
            return null
        }
    })
    let inspectResult: InspectResult | null = $state(null)
    let boundingBoxes: Array<BoundingBox> | null = $derived.by(() => buildBoundingBoxes(focusedInspect?.elements))
    let highlightPalette: Array<string> = $derived.by(() => getColorPalette(boundingBoxes?.length || 0))

    onMount(() => QwerkyClient.connect({
        onImageData(base64, size: Size) {
            pageLoading = false
            currentPageImage = {base64, size}
        },
        onDescribePoint(point, elements) {
            addInspectResult({point, elements})
        },
        onDescribeSelector(selector, elements) {
            addInspectResult({selector, elements})
        },
        onConnectionLost() {
            document.body.innerHTML = '<div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: maroon; display: flex; justify-content: center; align-items: center"><span>ERRCONN: reload webpage</span></div>'
        },
    }).then(qc => qwerkyClient = qc))

    function addInspectResult(inspectResult: InspectResult) {
        if (inspectResults.length === 8) {
            inspectResults.slice(1)
        }
        console.log('describe', inspectResult)
        inspectResults.push(inspectResult)
        focusedInspectIndex++
    }

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

{#if qwerkyClient}
    {#if !url}
        <UrlForm on:url={onUrl}/>
    {:else if currentPageImage !== null}
        <PageImage imageBase64={currentPageImage.base64}
                   imageSize={currentPageImage.size}
                   boundingBoxes={boundingBoxes}
                   highlightPalette={highlightPalette}
                   on:inspectPoint={onInspectPoint}/>
    {/if}
{/if}

<Header pageLoading={pageLoading} url={url}/>
<Panel highlightPalette={highlightPalette} inspectResult={focusedInspect}/>
<Footer/>

<!-- todo offsetting stacked highlights to not overlap requires extending highlight buffer by highlight count -->
<div class="hb t"></div>
<div class="hb l"></div>
<div class="hb b"></div>
<div class="hb r"></div>

<style>
    .hb {
        background: var(--panel-bg-color);
        position: fixed;
        z-index: var(--panel-bg-z-index);
    }

    .hb.t {
        height: var(--highlight-width);
        top: calc(var(--header-height) - var(--highlight-width));
        left: 0;
        right: 0;
    }

    .hb.l {
        top: var(--header-height);
        left: 0;
        bottom: var(--footer-height);
        width: var(--edge-width);
    }

    .hb.b {
        height: var(--highlight-width);
        bottom: calc(var(--footer-height) - var(--highlight-width));
        left: 0;
        right: 0;
    }

    .hb.r {
        top: var(--header-height);
        right: calc(var(--panel-width) - var(--highlight-width));
        bottom: var(--footer-height);
        width: var(--highlight-width);
    }
</style>
