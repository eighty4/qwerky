<script lang="ts">
    import {createEventDispatcher} from 'svelte'

    const dispatch = createEventDispatcher<{ url: string }>()

    let url = ''
    let sentToApi = false

    function onInputKeydown(e: KeyboardEvent) {
        if (e.code === 'Enter') {
            onButtonClick()
        }
    }

    function onButtonClick() {
        if (url.length) {
            if (!url.startsWith('http')) {
                url = 'https://' + url
            }
            sentToApi = true
            dispatch('url', url)
        }
    }
</script>

<!-- svelte-ignore a11y-autofocus -->

<div class="form-window">
    <div class="form-content">
        {#if !sentToApi}
            <h3>Welcome to Qwerky!</h3>
            <div>
                <label for="url-input">Url</label>
                <input id="url-input" autofocus placeholder="type a url here" bind:value={url} onkeydown={onInputKeydown}/>
            </div>
            <div>
                <button onclick={onButtonClick}>Click to start</button>
            </div>
        {:else}
            <h3 class="loading">Waiting for the page</h3>
        {/if}
    </div>
</div>

<style>
    .form-window {
        background: #000;
        border: 1px solid #fff;
        box-shadow: inset 0 0 0 1px hsla(0, 0%, 100%, .5), inset 0 0 0 2px hsla(0, 0%, 100%, .25), 0 0 0 1px hsla(0, 0%, 100%, .3), 0 0 0 2px hsla(0, 0%, 100%, .15);
        box-sizing: border-box;
        padding: 5rem;

        /* position */
        position: fixed;
        left: 50%;
        top: 20%;
    }

    .form-content {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        height: 100%;
    }

    .form-content div {
        margin-top: 1rem;
    }

    h3 {
        font-family: 'Acme', sans-serif;
        font-size: 2rem;
    }

    h3.loading:after {
        display: inline-block;
        animation: dotty steps(1, end) 2s infinite;
        content: '';
    }

    @keyframes dotty {
        0% {
            content: '';
        }
        16% {
            content: '.';
        }
        44% {
            content: '..';
        }
        72% {
            content: '...';
        }
        100% {
            content: '';
        }
    }

    label {
        display: none;
    }

    input {
        box-sizing: border-box;
        width: 100%;
        padding: .5rem;
        font-size: 1rem;
    }

    button {
        float: right;
        padding: .5rem;
        font-family: 'Acme', sans-serif;
        font-size: 1rem;
        letter-spacing: .04rem;
    }
</style>
