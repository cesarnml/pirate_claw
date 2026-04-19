<script lang="ts">
	import { formatDateParts } from '$lib/helpers';
	import type { DaemonHealth } from '$lib/types';

	const { health }: { health: DaemonHealth | null } = $props();
</script>

<div class="space-y-3">
	<p class="text-primary f≈ont-mono text-xs font-semibold tracking-[0.28em] uppercase">Dashboard</p>
	<div class="flex justify-start gap-3 lg:justify-end">
		{#if health}
			<div class="flex justify-between gap-2 sm:w-full sm:justify-end">
				{#each [{ label: 'Last feed intake', value: health.lastRunCycle?.completedAt }, { label: 'Last reconcile', value: health.lastReconcileCycle?.completedAt }] as card}
					<div
						class="bg-card/65 flex max-w-xs min-w-45 flex-col justify-between rounded-3xl border border-[color-mix(in_srgb,var(--primary)_60%,#23293a_40%)] px-4 py-3 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] backdrop-blur-sm"
					>
						<p
							class="text-muted-foreground text-[10px] font-semibold tracking-[0.22em] uppercase sm:text-[11px]"
						>
							{card.label}
						</p>
						{#if card.value}
							{@const parts = formatDateParts(card.value)}
							<div class="mt-2 flex flex-col items-start">
								<span class="text-foreground/80 text-xs leading-tight font-medium"
									>{parts.date}</span
								>
								<span class="text-lg leading-tight font-semibold sm:text-xl"
									>{parts.time}
									<span class="text-muted-foreground text-[10px] font-normal sm:text-[11px]"
										>{parts.tz}</span
									></span
								>
							</div>
						{:else}
							<span class="mt-2 text-2xl font-semibold">—</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
