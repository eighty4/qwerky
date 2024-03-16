import {sveltekit} from '@sveltejs/kit/vite'
import {defineConfig} from 'vitest/config'

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        port: 5395,
        proxy: {
            '/api': {
                target: 'http://localhost:5394',
                ws: true,
            },
        },
    },
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
    },
})
