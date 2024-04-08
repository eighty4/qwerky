<script lang="ts">

</script>

<footer>
    <a href="https://github.com/eighty4/qwerky">Qwerky is on <img alt="GitHub logo" src="/github.svg"/></a>
</footer>

<style>
    footer {
        position: fixed;
        height: calc(var(--footer-height) - var(--highlight-width));
        right: 0;
        left: 0;
        bottom: 0;
        background: var(--panel-bg-color);
        z-index: var(--app-ui-z-index);

        display: flex;
        justify-content: center;
        align-items: center;
    }

    a {
        color: #fff;
        text-decoration: none;
        font-family: 'Acme', sans-serif;
        display: inline-flex;
        align-items: center;
        gap: .5rem;
    }

    img {
        height: calc(var(--footer-height) * .5);
    }
</style>
