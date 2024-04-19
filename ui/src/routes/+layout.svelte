<script lang="ts">
    import type {Snippet} from 'svelte'
    import QwerkyRoot from '$lib/qwerky_root.svelte'

    let {children}: { children: Snippet } = $props()
</script>

<QwerkyRoot>
    {@render children()}
</QwerkyRoot>
