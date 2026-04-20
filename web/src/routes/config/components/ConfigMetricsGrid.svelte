<script lang="ts">
	import type { Component } from 'svelte';
	import StatTile from './StatTile.svelte';

	interface Metric {
		label: string;
		value: string;
		detail: string;
		icon: Component;
	}

	interface Props {
		metrics: Metric[];
	}

	const { metrics }: Props = $props();
</script>

<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
	{#each metrics as metric}
		<StatTile {...metric} />
	{/each}
</div>
