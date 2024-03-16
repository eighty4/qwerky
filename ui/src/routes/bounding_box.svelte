<script lang="ts">
    import type {Rect} from 'qwerky-contract'

    interface BoundingBoxProps {
        rect: Rect
    }

    let {rect}: BoundingBoxProps = $props()

    let hover: boolean = $state(false)
</script>

<div role="radio" tabindex="0" aria-checked={hover}
     style="height: {rect.h}px; width: {rect.w}px; top: {rect.y}px; left: {rect.x}px"
     class:hover
     onfocus={() => hover = true}
     onblur={() => hover = false}
     onmouseover={() => {hover = true; return true}}
     onmouseout={() => {hover = false; return true}}>
</div>

<style>
    div {
        z-index: 100;
        position: absolute;
        background: rgba(0 127 0 / 10%);
        border: 1px solid rgba(0 127 0 / 50%);
        opacity: 0;
    }

    div.hover {
        opacity: 1;
    }
</style>
