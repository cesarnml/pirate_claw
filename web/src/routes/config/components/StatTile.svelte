<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		label: string;
		value: string;
		detail: string;
		icon: Component;
	}

	const { label, value, detail, icon: Icon }: Props = $props();
</script>

<article class="bg-card/70 border-border/70 rounded-[24px] border p-4">
	<div class="flex items-start justify-between gap-3">
		<div class="space-y-2">
			<p class="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">{label}</p>
			<p class="text-xl font-semibold tracking-[-0.03em] break-all">{value}</p>
			<p class="text-muted-foreground text-xs leading-5">{detail}</p>
		</div>
		<Icon class="text-primary size-4 shrink-0"></Icon>
	</div>
</article>
