<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import type { Component } from 'svelte';

	type StatusCard = {
		label: string;
		value: number | null;
		detail: string;
		icon: Component;
	};

	const { statusCards }: { statusCards: StatusCard[] } = $props();
</script>

<div class="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
	{#each statusCards as card}
		<Card
			class="bg-card/40 rounded-[28px] border-white/10 shadow-[0_20px_60px_rgba(2,6,23,0.22)] sm:pt-4"
		>
			<CardContent class="flex flex-col items-start justify-between gap-2 pt-2 md:gap-4">
				<div class="relative flex w-full items-start justify-between gap-2">
					<div class="flex flex-col gap-1">
						<p class="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
							{card.label}
						</p>
						<p class="mt-3 pl-2 text-2xl font-semibold tracking-[-0.04em] lg:text-3xl xl:text-4xl">
							{card.value ?? '—'}
						</p>
					</div>
					<div class="bg-primary/15 text-primary relative bottom-3.5 rounded-2xl p-3">
						<card.icon class="h-4 w-4 md:h-5 md:w-5" />
					</div>
				</div>
				<p class="text-muted-foreground mt-2 text-xs">{card.detail}</p>
			</CardContent>
		</Card>
	{/each}
</div>
