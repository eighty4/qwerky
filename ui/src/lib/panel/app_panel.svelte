<script lang="ts">
    import {getIndexedColor} from '$lib/data/colors'
    import type {InspectResult} from '$lib/data/InspectResult'
    import PanelElement from '$lib/panel/panel_element.svelte'

    interface AppPanelProps {
        inspectResult: InspectResult | null
    }

    let {inspectResult}: AppPanelProps = $props()
</script>

<aside>
    {#if inspectResult}
        <div class="inspect-source">
            {#if inspectResult.point}
                Point ({inspectResult.point.x}, {inspectResult.point.y})
            {:else if inspectResult.selector}
                Selector {`\`${inspectResult.selector}\``}
            {/if}
        </div>
        {#each inspectResult.elements as element, i}
            <div class="element-container">
                <PanelElement color={getIndexedColor(i)} element={element}/>
            </div>
            <div class="divider" style="--highlight-color: {getIndexedColor(i)}"></div>
        {/each}
    {/if}
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

    .inspect-source {
        margin-bottom: 1.5rem;
    }

    .divider {
        width: 100%;
        height: 1px;
        background: linear-gradient(to left, var(--panel-bg-color), var(--highlight-color), var(--panel-bg-color));
        margin: 1.5rem 0 1.5rem;
    }
</style>
