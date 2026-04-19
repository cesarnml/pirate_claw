<script lang="ts">
	import StatusChip from '$lib/components/StatusChip.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { formatPercent, formatSpeed, torrentDisplayState } from '$lib/helpers';
	import type { ShowEpisode, TorrentStatSnapshot } from '$lib/types';

	const props = $props<{
		episode: ShowEpisode;
		live: TorrentStatSnapshot | undefined;
		liveHashes: Set<string>;
	}>();

	const percentDone = $derived(
		props.live ? props.live.percentDone : (props.episode.transmissionPercentDone ?? 0)
	);
	const active = $derived(
		props.live?.status === 'downloading' ||
			torrentDisplayState(props.episode, props.liveHashes) === 'downloading'
	);
</script>

<div
	class="border-border bg-card/72 grid gap-4 rounded-[26px] border p-4 lg:grid-cols-[144px_minmax(0,1fr)_auto]"
>
	<div class="bg-background/75 overflow-hidden rounded-2xl">
		{#if props.episode.tmdb?.stillUrl}
			<img
				src={props.episode.tmdb.stillUrl}
				alt={props.episode.tmdb?.name
					? `Still for ${props.episode.tmdb.name}`
					: `Episode ${props.episode.episode}`}
				class="h-full min-h-[5.6rem] w-full object-cover"
				loading="lazy"
			/>
		{:else}
			<div
				class="text-muted-foreground flex h-full min-h-[5.6rem] items-center justify-center text-xs font-semibold tracking-[0.18em] uppercase"
			>
				Still pending
			</div>
		{/if}
	</div>

	<div class="min-w-0 space-y-3">
		<div class="flex flex-wrap items-start justify-between gap-3">
			<div class="min-w-0">
				<p class="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
					Episode {String(props.episode.episode).padStart(2, '0')}
				</p>
				<p class="truncate text-lg font-semibold">
					{props.episode.tmdb?.name ?? 'Untitled episode'}
				</p>
			</div>
			<StatusChip status={props.episode.status} />
		</div>

		<div class="flex flex-wrap gap-2">
			{#if props.episode.tmdb?.airDate}
				<Badge variant="outline">{props.episode.tmdb.airDate}</Badge>
			{/if}
			{#if props.episode.pirateClawDisposition}
				<Badge variant="outline">{props.episode.pirateClawDisposition}</Badge>
			{/if}
			{#if props.episode.transmissionTorrentHash}
				<Badge variant="secondary">Torrent linked</Badge>
			{/if}
		</div>

		<div class="space-y-2">
			<div class="text-muted-foreground flex items-center justify-between text-xs">
				<span>Transfer progress</span>
				<span>{formatPercent(percentDone)}</span>
			</div>
			<div class="bg-background/70 h-2 rounded-full">
				<div
					class={`h-2 rounded-full ${active ? 'bg-secondary' : 'bg-primary'}`}
					style={`width: ${Math.round(percentDone * 100)}%`}
				></div>
			</div>
			{#if props.live && props.live.status === 'downloading'}
				<p class="text-muted-foreground text-xs">{formatSpeed(props.live.rateDownload)} downlink</p>
			{/if}
		</div>
	</div>

	<div
		class="border-border/80 bg-background/42 flex min-w-32 flex-col justify-between rounded-2xl border px-3 py-3 text-right"
	>
		<div>
			<p class="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
				Torrent state
			</p>
			<p class="mt-2 text-sm font-medium">{active ? 'Live transfer' : 'Idle'}</p>
		</div>
		<div class="mt-4">
			<p class="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
				Speed
			</p>
			<p class="mt-2 text-sm font-medium">
				{props.live && props.live.status === 'downloading'
					? formatSpeed(props.live.rateDownload)
					: '—'}
			</p>
		</div>
	</div>
</div>
