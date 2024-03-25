<script lang="ts">
    import type {Rect} from 'qwerky-contract'

    interface BoundingBoxProps {
        color: string
        rect: Rect
    }

    let {color, rect}: BoundingBoxProps = $props()

    let hover: boolean = $state(false)

    $inspect(color, rect)
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->

<div style="--highlight-color: {color}; --element-x: {rect.x}; --element-y: {rect.y}; --element-w: {rect.w}; --element-h: {rect.h};"
     class:hover
     onfocus={() => hover = true}
     onblur={() => hover = false}
     onmouseover={() => {hover = true; return true}}
     onmouseout={() => {hover = false; return true}}>
</div>

<style>
    div {
        pointer-events: none;
        z-index: var(--page-ui-z-index);
        position: absolute;
        border: 3px solid var(--highlight-color);
        top: calc(var(--header-height) + (((var(--page-img-scaled-h) / var(--page-img-src-h)) * var(--element-y)) * 1px));
        left: calc(var(--page-img-scale-w-r) * var(--element-x));
        width: calc(var(--page-img-scale-w-r) * var(--element-w));
        aspect-ratio: var(--element-w, 1) / var(--element-h, 1);
    }
</style>
