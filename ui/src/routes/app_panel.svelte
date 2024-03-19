<script lang="ts">
    import type {Element} from 'qwerky-contract'
    import PanelElement from '$lib/components/panel_element.svelte'
    import {getIndexedColor} from '$lib/colors'

    // todo add inspect pointer/selector
    interface AppPanelProps {
        elements: Array<Element>
    }

    let {elements}: AppPanelProps = $props()
</script>

<aside>
    {#each elements as element, i}
        <div class="element-container">
            <PanelElement color={getIndexedColor(i)} element={element}/>
        </div>
        <div class="divider" style="--highlight-color: {getIndexedColor(i)}"></div>
    {/each}
</aside>

<style>
    aside {
        position: fixed;
        width: var(--panel-width);
        top: var(--header-height);
        right: 0;
        bottom: 0;
        background: var(--panel-bg-color);
        z-index: var(--app-ui-z-index);
        box-sizing: border-box;
        padding: 2rem;
    }

    .divider {
        width: 100%;
        height: 1px;
        background: linear-gradient(to left, var(--panel-bg-color), var(--highlight-color), var(--panel-bg-color));
        margin: 1rem 0 1.5rem;
    }
</style>
