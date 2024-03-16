import adapter from '@sveltejs/adapter-static'
import {vitePreprocess} from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
    compilerOptions: {
        runes: true,
    },
    kit: {
        // https://kit.svelte.dev/docs/adapters
        adapter: adapter({
            assets: 'build',
            pages: 'build',
            precompress: true,
            strict: true,
        }),
    },
    preprocess: vitePreprocess(),
}

export default config
