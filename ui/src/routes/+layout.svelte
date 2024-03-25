<slot/>

<style>
    :root {
        --header-height: 4rem;
        --panel-width: calc(100% - var(--page-img-scaled-w));
        --page-img-scaled-w: min(75vw, calc(100% - 20rem));
        --footer-height: 3rem;
        --panel-bg-color: rgba(0 0 0 / 93%);
        --app-ui-z-index: 3;
        --page-ui-z-index: 2;
        --page-img-z-index: 1;
    }
</style>
