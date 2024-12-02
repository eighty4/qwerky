<script lang="ts">
    import type {Point, Size} from '@eighty4/qwerky-contract'
    import UrlForm from '$lib/components/url_form.svelte'
    import Footer from '$lib/footer/qwerky_footer.svelte'
    import Header from '$lib/header/qwerky_header.svelte'
    import PageImage from '$lib/page/open_page.svelte'
    import Panel from '$lib/panel/app_panel.svelte'
    import type {InspectResult} from '$lib/data/InspectResult'
    import type {BoundingBox} from '$lib/data/BoundingBox'

    interface QwerkyInterfaceProps {
        boundingBoxes: Array<BoundingBox> | null
        currentPageImage: { base64: string, size: Size } | null
        focusedInspectIndex: number
        highlightPalette: Array<string>
        inspectResults: Array<InspectResult>
        onInspectPoint: (point: Point) => void
        onUrl: (url: string) => void
        pageLoading: boolean
        url: string | null
    }

    const {
        boundingBoxes,
        currentPageImage,
        focusedInspectIndex,
        highlightPalette,
        inspectResults,
        onInspectPoint,
        onUrl,
        pageLoading,
        url,
    }: QwerkyInterfaceProps = $props()
</script>

<div class="grid">
    <div class="top">
        <Header pageLoading={pageLoading} url={url}/>
    </div>
    <div class="edge"></div>
    <div class="page">
        {#if !url}
            <UrlForm onUrl={onUrl}/>
        {:else if currentPageImage !== null}
            <PageImage imageBase64={currentPageImage.base64}
                       imageSize={currentPageImage.size}
                       boundingBoxes={boundingBoxes}
                       highlightPalette={highlightPalette}
                       onInspectPoint={onInspectPoint}/>
        {/if}
    </div>
    <div class="panel">
        <Panel focusedInspectIndex={focusedInspectIndex}
               highlightPalette={highlightPalette}
               inspectResults={inspectResults}/>
    </div>
    <div class="bottom">
        <Footer/>
    </div>
</div>

<style>
    .grid {
        display: grid;
        grid-template-columns: 2rem 5fr 2fr;
        grid-template-rows: 10rem 1fr 10rem;
        width: 100vw;
        height: 100vh;
        position: relative;
    }

    .top {
        grid-area: 1 / 1 / 2 / 3;
    }

    .edge {
        grid-area: 2 / 1 / 3 / 2;
        background: var(--panel-bg-color);
    }

    .page {
        grid-area: 2 / 2 / 3 / 3;
    }

    .panel {
        grid-area: 2 / 3 / 3 / 4;
    }

    .bottom {
        grid-area: 3 / 1 / 4 / 3;
    }
</style>
