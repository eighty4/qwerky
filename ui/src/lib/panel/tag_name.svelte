<script lang="ts">
    interface TagNameProps {
        color: string
        label: string
    }

    let {color, label}: TagNameProps = $props()
</script>

<span style="--highlight-color: {color}">
    {label}
</span>

<style>
    span {
        border: 2px solid var(--highlight-color);
        display: inline-block;
        font-size: .8rem;
        font-weight: bold;
        padding: .25rem .5rem;
        border-radius: .25rem;
    }
</style>
