<script lang="ts">
    import {onMount} from 'svelte'
    import {InspectPoint, OpenPage, type Point, type Size} from '@eighty4/qwerky-contract'
    import {QwerkyClient} from '$lib/data/QwerkyClient.js'
    import UrlForm from '$lib/components/url_form.svelte'
    import {AppData} from '$lib/data/AppData.svelte'
    import Footer from '$lib/footer/qwerky_footer.svelte'
    import Header from '$lib/header/qwerky_header.svelte'
    import Panel from '$lib/panel/app_panel.svelte'
    import PageImage from '$lib/page/open_page.svelte'

    const appData: AppData = new AppData()
    let qwerkyClient: QwerkyClient | null = $state(null)
    let pageLoading: boolean = $state(false)
    let currentPageImage: { base64: string, size: Size } | null = $state(null)

    onMount(() => QwerkyClient.connect({
        onImageData(base64, size: Size) {
            pageLoading = false
            currentPageImage = {base64, size}
        },
        onDescribePoint(point, elements) {
            console.log('describe', point, elements)
            appData.addInspectResult({point, elements})
        },
        onDescribeSelector(selector, elements) {
            console.log('describe', selector, elements)
            appData.addInspectResult({selector, elements})
        },
        onConnectionLost() {
            document.body.innerHTML = '<div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: maroon; display: flex; justify-content: center; align-items: center"><span>ERRCONN: reload webpage</span></div>'
        },
    }).then(qc => qwerkyClient = qc))

    function onUrl(event: CustomEvent<string>) {
        pageLoading = true
        appData.url = event.detail
        qwerkyClient!.sendMessage(new OpenPage(qwerkyClient!.sessionId, event.detail))
    }

    function onInspectPoint(event: CustomEvent<Point>) {
        qwerkyClient!.sendMessage(new InspectPoint(qwerkyClient!.sessionId, event.detail))
    }
</script>

{#if qwerkyClient}
    {#if !appData.url}
        <UrlForm on:url={onUrl}/>
    {:else if currentPageImage !== null}
        <PageImage boundingBoxes={appData.focusedInspection?.boundingBoxes}
                   imageBase64={currentPageImage.base64}
                   imageSize={currentPageImage.size}
                   on:inspectPoint={onInspectPoint}/>
    {/if}
{/if}

<Header pageLoading={pageLoading} url={appData.url}/>
<Panel appData={appData}/>
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
