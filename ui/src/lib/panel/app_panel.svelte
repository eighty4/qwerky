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
        height: 100%;
        width: 100%;
        background: var(--panel-bg-color);
        box-sizing: border-box;
        padding: 2rem;
    }
</style>
