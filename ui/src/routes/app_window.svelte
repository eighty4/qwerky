<script lang="ts">
</script>

<div class="app-window">
    <slot/>
</div>

<style>
    .app-window {
        /* style */
        background: #000;
        border: 1px solid #fff;
        box-shadow: inset 0 0 0 1px hsla(0, 0%, 100%, .5), inset 0 0 0 2px hsla(0, 0%, 100%, .25), 0 0 0 1px hsla(0, 0%, 100%, .3), 0 0 0 2px hsla(0, 0%, 100%, .15);
        box-sizing: border-box;
        padding: 1rem;

        /* position */
        position: fixed;
        left: 50%;
        top: 20%;
    }
</style>
