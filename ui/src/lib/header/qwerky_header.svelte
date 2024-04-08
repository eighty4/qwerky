<script lang="ts">
    interface AppHeaderProps {
        pageLoading: boolean
        url: string | null
    }

    let {pageLoading, url}: AppHeaderProps = $props()

    let pageLoaded = $state(false)

    $effect(() => {
        if (!pageLoading && url) {
            pageLoaded = true
        }
    })

    function onPageLoadedAnimationEnd() {
        pageLoaded = false
    }
</script>

<header>
    <div class="header">
        <div class="prefix">Being</div>
        <h1>
            <a class="app" href="https://qwerky.eighty4.tech">
                <span class="brackets" class:loading={pageLoading} class:loaded={pageLoaded}
                      style="--translate-x-dir-mod: -1">{'<'}</span>
                <span class:shimmer={pageLoaded} onanimationend={onPageLoadedAnimationEnd}>Qwerky</span>
                <span class="brackets" class:loading={pageLoading} class:loaded={pageLoaded}>{'>'}</span>
            </a>
        </h1>
        <div class="url">
            {#if url}
                <span>@ {url}</span>
            {/if}
        </div>
    </div>
    <div class="space"></div>
    <h2><a href="https://eighty4.tech">an <img alt="Eighty4" src="/eighty4.svg"/> app</a></h2>
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
        height: calc(var(--header-height) - var(--highlight-width));
        top: 0;
        left: 0;
        right: 0;

        display: flex;
        align-items: center;

        background: var(--panel-bg-color);
        padding: 0 4rem;
        z-index: var(--app-ui-z-index);
    }

    .space {
        flex: 1;
    }

    .header {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .prefix {
        font-size: 1.5rem;
        letter-spacing: .05rem;
        font-variant: petite-caps;
        font-style: italic;
    }

    .app {
        position: relative;
        top: -1px;
    }

    .url {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    h1 a {
        margin: 0 1rem;
    }

    h2 {
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

    h1, .prefix, .url {
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

    .brackets {
        display: inline-block;
    }

    .brackets.loading {
        --translate-x-length: calc(.075rem * var(--translate-x-dir-mod, 1));
        animation: radiate-color 4s infinite, brackets-bounce .5s ease-in-out infinite;
    }

    @keyframes brackets-bounce {
        0% {
            transform: translateX(0);
        }

        50% {
            transform: translateX(var(--translate-x-length));
        }

        100% {
            transform: translateX(0);
        }
    }

    @keyframes radiate-color {
        0% {
            color: #3cb9fc;
        }
        14.3% {
            color: #00fa36;
        }
        28.6% {
            color: #f3f900;
        }
        42.9% {
            color: #ff6700;
        }
        57.2% {
            color: #ff1493;
        }
        71.5% {
            color: #fb33db;
        }
        85.8% {
            color: #fa002e;
        }
        100% {
            color: #0310ea;
        }
    }

    .shimmer {
        background: linear-gradient(to right, #fff,
        #fff 25%,
        #3cb9fc 30%,
        #00fa36 35%,
        #f3f900 40%,
        #ff6700 45%,
        #ff1493 50%,
        #fb33db 60%,
        #fa002e 65%,
        #0310ea 70%,
        #fff 75%);
        background-size: 400% auto;
        color: #000;
        text-fill-color: transparent;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        -webkit-background-clip: text;
        animation: shimmer-color 1.5s linear forwards;
    }

    @keyframes shimmer-color {
        to {
            background-position: 100% center;
        }
    }
</style>
