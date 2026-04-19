<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { showHref } from '$lib/helpers';
	import type { ShowBreakdown, ShowSeason, TorrentStatSnapshot } from '$lib/types';
	import LayersIcon from '@lucide/svelte/icons/layers-3';
	import ShowEpisodeRow from './ShowEpisodeRow.svelte';

	const props = $props<{
		show: ShowBreakdown;
		selectedSeason: ShowSeason;
		torrents: TorrentStatSnapshot[];
		onSelectSeason: (season: number) => void;
	}>();

	function liveTorrent(hash: string | undefined): TorrentStatSnapshot | undefined {
		if (!hash) return undefined;
		return props.torrents.find((t: TorrentStatSnapshot) => t.hash === hash);
	}

	const liveHashes = $derived(
		new Set<string>(props.torrents.map((t: TorrentStatSnapshot) => t.hash))
	);
</script>

<div class="border-border/80 bg-background/36 border-t px-5 py-5">
	<div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
		<div class="space-y-2">
			<p class="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
				Season drill-down
			</p>
			<h3 class="text-xl font-semibold tracking-[-0.03em]">Inline episode state</h3>
		</div>
		<div class="flex flex-wrap gap-2">
			{#each props.show.seasons as season (season.season)}
				<button
					type="button"
					class={`border-border bg-card/75 text-muted-foreground hover:border-primary/30 hover:text-foreground rounded-full border px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase transition-colors ${
						season.season === props.selectedSeason.season
							? 'border-primary/35 bg-primary/12 text-primary'
							: ''
					}`}
					onclick={() => props.onSelectSeason(season.season)}
				>
					Season {season.season}
				</button>
			{/each}
		</div>
	</div>

	{#if props.selectedSeason.episodes.length === 0}
		<div class="border-border bg-card/65 mt-5 rounded-3xl border border-dashed px-4 py-6">
			<p class="text-sm font-medium">No episodes tracked for this season yet.</p>
		</div>
	{:else}
		<div class="mt-5 space-y-3">
			{#each props.selectedSeason.episodes as episode (episode.identityKey)}
				<ShowEpisodeRow
					{episode}
					live={liveTorrent(episode.transmissionTorrentHash)}
					{liveHashes}
				/>
			{/each}
		</div>
	{/if}

	<div class="mt-5 flex justify-end">
		<Button href={showHref(props.show.normalizedTitle)} variant="ghost" class="rounded-full px-3">
			<LayersIcon class="mr-2 h-4 w-4" />
			Open full show detail
		</Button>
	</div>
</div>
