<script lang="ts">
    import type {InspectResult} from '$lib/data/InspectResult'
    import InspectSummary from '$lib/panel/inspect_summary.svelte'

    interface AppPanelProps {
        focusedInspectIndex: number
        highlightPalette: Array<string>
        inspectResults: Array<InspectResult>
    }

    let {focusedInspectIndex, highlightPalette, inspectResults}: AppPanelProps = $props()
</script>

<aside>
    {#each inspectResults as inspectResult, i}
        <InspectSummary focused={i === focusedInspectIndex} highlightPalette={highlightPalette} inspectResult={inspectResult}/>
    {/each}
</aside>

<style>
    aside {
        position: fixed;
        width: calc(var(--panel-width) - var(--highlight-width));
        top: var(--header-height);
        right: 0;
        bottom: var(--footer-height);
        background: var(--panel-bg-color);
        z-index: var(--app-ui-z-index);
        box-sizing: border-box;
        padding: 2rem;
    }
</style>
