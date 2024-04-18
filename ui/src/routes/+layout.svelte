<script lang="ts">
    import QwerkyRoot from '$lib/qwerky_root.svelte'
    let { children } = $props();
</script>

<QwerkyRoot>
    {@render children()}
</QwerkyRoot>
