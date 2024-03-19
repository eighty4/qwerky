<script lang="ts">
    interface TagNameProps {
        color: string
        label: string
    }

    let {color, label}: TagNameProps = $props()
</script>

<span style="--highlight-color: {color}">
    <span class="bracket">{'<'}</span>
    <span class="label">{label}</span>
    <span class="bracket">{'>'}</span>
</span>

<style>
    .bracket {
        color: var(--highlight-color);
    }
</style>
