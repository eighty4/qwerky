<script lang="ts">
    interface AppHeaderProps {
        url?: string
    }

    let {url}: AppHeaderProps = $props()
</script>

<header>
    <h1><a href="https://qwerky.eighty4.tech">Qwerky</a></h1>
    <h2><a href="https://eighty4.tech">an <img alt="Eighty4" src="/eighty4.svg"/> app</a></h2>
    <div class="url">
        {#if url}
            <span>@ {url}</span>
        {/if}
    </div>
    <!--    <div class="controls">-->
    <!--        <button class="control">-->
    <!--            <img alt="Play Qwerky script" src="/icons/play.svg"/>-->
    <!--        </button>-->
    <!--        <button class="control">-->
    <!--            <img alt="Record Qwerky script" src="/icons/record.svg"/>-->
    <!--        </button>-->
    <!--    </div>-->
</header>

<style>
    header {
        position: fixed;
        height: var(--header-height);
        top: 0;
        left: 0;
        right: 0;
        background: var(--panel-bg-color);
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        grid-template-rows: 1fr;
        grid-column-gap: 0;
        grid-row-gap: 0;
        padding: 0 3rem;
        z-index: var(--app-ui-z-index);
    }

    .url {
        grid-area: 1 / 2 / 2 / 5;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    h1 {
        grid-area: 1 / 1 / 2 / 2;
    }

    h2 {
        grid-area: 1 / -1 / 2 / -2;
        flex-direction: row-reverse;
    }

    h1, h2 {
        display: flex;
        align-items: center;
    }

    a {
        text-decoration: none;
        color: #fff;
    }

    h1, .url {
        font-family: 'Acme', sans-serif;
    }

    h2 a {
        display: inline-flex;
        align-items: center;
        gap: .5rem;
    }

    h2 img {
        height: calc(var(--header-height) * .5);
        aspect-ratio: 1 / 1;
    }

    /*.control {*/
    /*    border: 1px solid rgb(20, 30, 40);*/
    /*    background: rgb(30, 40, 50);*/
    /*    cursor: pointer;*/
    /*    display: inline-flex;*/
    /*    justify-content: center;*/
    /*    align-items: center;*/
    /*}*/

    /*.control:disabled {*/
    /*    cursor: no-drop;*/
    /*}*/
</style>
