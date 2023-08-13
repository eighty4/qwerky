<script lang="ts">
    import type {Rect} from 'qwerky-contract'

    export let rect: Rect
    let hover: boolean = false
</script>

<div style="height: {rect.h}px; width: {rect.w}px; top: {rect.y}px; left: {rect.x}px"
     class:hover
     on:mouseover={() => {hover = true; return true}} on:mouseout={() => {hover = false; return true}}>
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
