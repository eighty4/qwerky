<script lang="ts">
    import type {Element} from '@eighty4/qwerky-contract'
    import TagName from '$lib/panel/tag_name.svelte'

    interface PanelElementProps {
        color: string
        element: Element
    }

    let {color, element}: PanelElementProps = $props()
</script>

<div>
    <div class="element-header">
        <span class="tag">
            <TagName color={color} label={element.tagName}/>
        </span>
        {#if element.id && element.id.length}
            <span class="id">#{element.id}</span>
        {/if}
        <!--{#if element.classes && element.classes.length}-->
        <!--    .{element.classes.join('.')}-->
        <!--{/if}-->
    </div>
</div>

<style>
    .element-header {
        width: 100%;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    .tag {
        min-height: 3rem;
    }

    .id {
        margin-left: 1rem;
    }
</style>
