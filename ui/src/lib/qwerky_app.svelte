<script lang="ts">
    import {onMount} from 'svelte'
    import {InspectPoint, OpenPage, type Point, type Size} from '@eighty4/qwerky-contract'
    import {type BoundingBox, buildBoundingBoxes} from '$lib/data/BoundingBox'
    import type {InspectResult} from '$lib/data/InspectResult'
    import {QwerkyClient} from '$lib/data/QwerkyClient.js'
    import {getColorPalette} from '$lib/data/colors'
    import QwerkyInterface from '$lib/qwerky_interface.svelte'

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

    function onUrl(_url: string) {
        pageLoading = true
        url = _url
        console.log(JSON.stringify(url))
        qwerkyClient!.sendMessage(new OpenPage(qwerkyClient!.sessionId, url))
    }

    function onInspectPoint(point: Point) {
        inspectResult = null
        console.log(JSON.stringify(point))
        qwerkyClient!.sendMessage(new InspectPoint(qwerkyClient!.sessionId, point))
    }
</script>

<QwerkyInterface boundingBoxes={boundingBoxes}
                 currentPageImage={currentPageImage}
                 focusedInspectIndex={focusedInspectIndex}
                 highlightPalette={highlightPalette}
                 inspectResults={inspectResults}
                 onInspectPoint={onInspectPoint}
                 onUrl={onUrl}
                 pageLoading={pageLoading}
                 url={url}/>

<style>
    :root {
        --panel-width: max(25vw, 20rem);
        --highlight-width: 3px;
        --panel-bg-color: rgba(0 0 0 / 93%);
    }
</style>
