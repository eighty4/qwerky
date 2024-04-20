<script lang="ts">
    import type {InspectResult} from '$lib/data/InspectResult'
    import PanelElement from '$lib/panel/panel_element.svelte'

    interface AppPanelProps {
        focused: boolean
        highlightPalette: Array<string>
        inspectResult: InspectResult
    }

    let {focused, highlightPalette, inspectResult}: AppPanelProps = $props()
</script>

<div class="inspect-type">
    {#if inspectResult.point}
        Point ({inspectResult.point.x}, {inspectResult.point.y})
    {:else if inspectResult.selector}
        Selector {`\`${inspectResult.selector}\``}
    {/if}
</div>
{#if focused}
    {#each inspectResult.elements as element, i}
        <div class="element-container">
            <PanelElement color={highlightPalette[i]} element={element}/>
        </div>
        <div class="element-divider" style="--highlight-color: {highlightPalette[i]}"></div>
    {/each}
{/if}

<style>
    .inspect-type {
        margin-bottom: 1.5rem;
    }

    .element-divider {
        width: 100%;
        height: 1px;
        background: linear-gradient(to left, var(--panel-bg-color), var(--highlight-color), var(--panel-bg-color));
        margin: 1.5rem 0 1.5rem;
    }
</style>
