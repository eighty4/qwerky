<script lang="ts">
    import {InspectPoint, OpenPage, type Point, type Rect, type Size} from 'qwerky-contract'
    import {onMount} from 'svelte'
    import Header from './app_header.svelte'
    import Panel from './app_panel.svelte'
    import Footer from './app_footer.svelte'
    import PageImage from './open_page.svelte'
    import UrlForm from './url_form.svelte'
    import {QwerkyClient} from '$lib/QwerkyClient.js'

    let qc: QwerkyClient
    let url: string | undefined
    let pageImageData: string
    let pageImageSize: Size
    let boundingBoxData: Array<Rect>

    onMount(() => {
        qc = QwerkyClient.connect({
            onBoundingBoxes(boundingBoxes: Array<Rect>) {
                boundingBoxData = boundingBoxes
            },
            onImageData(image, size: Size) {
                pageImageSize = size
                pageImageData = image
            },
            onDescribePoint(point, elements) {
                console.log('describe', point, elements)
            },
            onDescribeSelector(selector, elements) {
                console.log('describe', selector, elements)
            },
            onConnectionLost() {
                document.body.innerHTML = '<div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: maroon; display: flex; justify-content: center; align-items: center"><span>ERRCONN: reload webpage</span></div>'
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

<Header url={url}/>
<Panel/>
{#if !url}
    <UrlForm on:url={onUrl}/>
{:else if pageImageData}
    <PageImage boundingBoxes={boundingBoxData}
               url={url}
               imageBase64={pageImageData}
               imageSize={pageImageSize}
               on:inspectPoint={onInspectPoint}
               --img-width={pageImageSize.width}
               --img-height={pageImageSize.height}/>
{/if}
<Footer/>
