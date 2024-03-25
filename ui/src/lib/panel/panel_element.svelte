<script lang="ts">
    import type {Element} from 'qwerky-contract'
    import TagName from '$lib/components/tag_name.svelte'

    interface PanelElementProps {
        color: string
        element: Element
    }

    let {color, element}: PanelElementProps = $props()
</script>

<div>
    <div class="element-header">
        <TagName color={color} label={element.tagName}/>
        {#if element.id && element.id.length}
            #{element.id}
        {/if}
        {#if element.classes && element.classes.length}
            .{element.classes.join('.')}
        {/if}
    </div>
</div>

<style>
    .element-header {
        width: 100%;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
</style>
