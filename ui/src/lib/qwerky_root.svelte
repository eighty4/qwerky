<script>
    let { children } = $props();
</script>

{@render children()}

<style>
    :root {
        --header-height: 4rem;
        --edge-width: 2rem;
        --panel-width: max(25vw, 20rem);
        --footer-height: 4rem;
        --highlight-width: 3px;
        --panel-bg-color: rgba(0 0 0 / 93%);
        --app-ui-z-index: 5;
        --page-highlight-z-index: 4;
        --page-img-z-index: 2;
        --panel-bg-z-index: 1;
    }
</style>
