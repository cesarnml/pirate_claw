<script lang="ts">
	import { archiveHref, candidatePosterUrl, candidateTitle, formatShortDate } from '$lib/helpers';
	import StatusChip from '$lib/components/StatusChip.svelte';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import type { CandidateStateRecord } from '$lib/types';
	import { Badge } from '$lib/components/ui/badge';

	type ArchiveItem = CandidateStateRecord & { queuedAt: string };

	const { archiveItems }: { archiveItems: ArchiveItem[] } = $props();
</script>

<Card class="bg-card/70 rounded-[30px] border-white/10" data-testid="archive-strip">
	<CardHeader class="pb-4">
		<p class="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
			Completed Downloads
		</p>
		<h2 class="mt-2 text-2xl font-semibold tracking-[-0.03em]">Your Haul</h2>
	</CardHeader>
	<CardContent>
		{#if archiveItems.length === 0}
			<div class="border-border bg-background/55 rounded-3xl border border-dashed px-5 py-8">
				<p class="text-sm font-medium">Nothing has finished downloading yet.</p>
				<p class="text-muted-foreground mt-2 text-sm">
					Completed items will collect here once Pirate Claw starts finishing matches.
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6" data-testid="archive-grid">
				{#each archiveItems as item}
					{@const posterUrl = candidatePosterUrl(item)}
					<a
						href={archiveHref(item)}
						aria-label={`${candidateTitle(item)} COMPLETED ${formatShortDate(item.queuedAt)}`}
						class="group border-border bg-background/45 relative overflow-hidden rounded-3xl border transition-transform hover:-translate-y-0.5"
					>
						<StatusChip
							status="completed"
							class="absolute top-3 left-2 z-1 bg-emerald-800/80 text-[9px]"
						/>
						{#if item.mediaType === 'tv' && item.season != null && item.episode != null}
							<Badge
								class="absolute top-3.5 right-2.5 z-1 bg-red-900/60 text-[10px] font-bold text-amber-50"
							>
								S{`${item.season}`.padStart(2, '0')}E{`${item.episode}`.padStart(2, '0')}
							</Badge>
						{/if}
						<img
							src={posterUrl}
							alt={candidateTitle(item)}
							class="aspect-2/3 w-full object-cover"
							loading="lazy"
						/>
						<div class="relative space-y-2 p-3">
							<Badge
								variant="outline"
								class="absolute bottom-12 left-1/2 -translate-x-1/2 bg-slate-800/30"
								>{formatShortDate(item.queuedAt)}</Badge
							>
							<p class="truncate text-sm font-medium">{candidateTitle(item)}</p>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>
