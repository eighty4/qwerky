<script lang="ts">
    import PanelElement from '$lib/components/panel_element.svelte'
    import {getIndexedColor} from '$lib/colors'
    import type {InspectResult} from '$lib/InspectResult'

    interface AppPanelProps {
        inspectResult?: InspectResult
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
        width: var(--panel-width);
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
