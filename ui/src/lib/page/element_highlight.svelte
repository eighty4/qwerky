<script lang="ts">
    import type {BoundingBox} from '$lib/data/BoundingBox'

    interface BoundingBoxProps {
        boundingBox: BoundingBox
        color: string
    }

    let {boundingBox, color}: BoundingBoxProps = $props()

    let hover: boolean = $state(false)
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->

<div class="highlight"
     class:hover
     style="
        --highlight-color: {color};
        --element-x: {boundingBox.rect.x};
        --element-y: {boundingBox.rect.y};
        --element-w: {boundingBox.rect.w};
        --element-h: {boundingBox.rect.h};
        --stacked-x: {boundingBox.stacked.x};
        --stacked-y: {boundingBox.stacked.y};
        --stacked-w: {boundingBox.stacked.w};
        --stacked-h: {boundingBox.stacked.h};
     "
     onfocus={() => hover = true}
     onblur={() => hover = false}
     onmouseover={() => {hover = true; return true}}
     onmouseout={() => {hover = false; return true}}>
</div>

<style>
    .highlight {
        pointer-events: none;
        position: absolute;
        border: var(--highlight-width) solid var(--highlight-color);
        top: calc((var(--page-scale-ar) * var(--element-y)) - (var(--highlight-width) * var(--stacked-y)) + var(--page-scroll-y));
        left: calc((var(--page-scale-ar) * var(--element-x)) - (var(--highlight-width) * var(--stacked-x)));
        width: calc((var(--page-scale-ar) * var(--element-w)) - (var(--highlight-width) * var(--stacked-w)));
        height: calc((var(--page-scale-ar) * var(--element-h)) - (var(--highlight-width) * var(--stacked-h)));
    }
</style>
