<script lang="ts">
    import {getIndexedColor} from '$lib/data/colors'
    import type {AppData} from '$lib/data/AppData.svelte'
    import PanelElement from '$lib/panel/panel_element.svelte'

    interface AppPanelProps {
        appData: AppData
    }

    let {appData}: AppPanelProps = $props()
</script>

<aside>
    {#if appData.focusedInspection}
        <div class="inspect-source">
            {#if appData.focusedInspection.result.point}
                Point ({appData.focusedInspection.result.point.x}, {appData.focusedInspection.result.point.y})
            {:else if appData.focusedInspection.result.selector}
                Selector {`\`${appData.focusedInspection.result.selector}\``}
            {/if}
        </div>
        {#each appData.focusedInspection.result.elements as element, i}
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
