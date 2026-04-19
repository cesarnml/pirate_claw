<script lang="ts">
	import StatusChip from '$lib/components/StatusChip.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import {
		formatLastWatched,
		formatRating,
		safeHttpsUrl,
		showDisplayTitle,
		showHref
	} from '$lib/helpers';
	import type { ShowBreakdown, ShowSeason, TorrentStatSnapshot } from '$lib/types';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import StarIcon from '@lucide/svelte/icons/star';
	import ShowSeasonDrillDown from './ShowSeasonDrillDown.svelte';

	const props = $props<{
		show: ShowBreakdown;
		torrents: TorrentStatSnapshot[];
		expanded: boolean;
		selectedSeason: ShowSeason | null;
		onToggleExpand: () => void;
		onSelectSeason: (season: number) => void;
	}>();

	const title = $derived(showDisplayTitle(props.show));
	const posterUrl = $derived(safeHttpsUrl(props.show.tmdb?.posterUrl));
	const pct = $derived(completionPct(props.show));
	const seasonCount = $derived(props.show.seasons.length);
	const episodeCount = $derived(
		props.show.seasons.reduce((sum: number, s: ShowSeason) => sum + s.episodes.length, 0)
	);
	const latestIntake = $derived(mostRecentQueuedAt(props.show));

	function completionPct(show: ShowBreakdown): number | null {
		const total = show.seasons.reduce((sum, s) => sum + s.episodes.length, 0);
		if (total === 0) return null;
		const done = show.seasons
			.flatMap((s) => s.episodes)
			.filter((ep) => ep.lifecycleStatus === 'completed').length;
		return Math.round((done / total) * 100);
	}

	function mostRecentQueuedAt(show: ShowBreakdown): number {
		return show.seasons.reduce((latest, s) => {
			for (const ep of s.episodes) {
				if (!ep.queuedAt) continue;
				const ts = Date.parse(ep.queuedAt);
				if (!Number.isNaN(ts) && ts > latest) latest = ts;
			}
			return latest;
		}, 0);
	}

	function networkLabel(show: ShowBreakdown): string {
		const overview = show.tmdb?.overview?.toLowerCase() ?? '';
		if (overview.includes('apple')) return 'APPLE TV+';
		if (overview.includes('hbo')) return 'HBO';
		if (overview.includes('fx')) return 'FX';
		if (overview) return 'TMDB METADATA';
		return 'Library target';
	}
</script>

<Card
	class={`bg-card/72 overflow-hidden rounded-[30px] border-white/10 shadow-[0_24px_80px_rgba(2,6,23,0.18)] transition-colors ${
		props.expanded ? 'border-primary/35 bg-card/85' : ''
	}`}
>
	<div class="relative">
		<button
			type="button"
			aria-expanded={props.expanded}
			class="group block w-full text-left"
			onclick={props.onToggleExpand}
		>
			<div class="grid gap-0 md:grid-cols-[200px_minmax(0,1fr)]">
				<div class="bg-background/70 relative min-h-76 overflow-hidden">
					{#if posterUrl}
						<img
							src={posterUrl}
							alt={`Poster for ${title}`}
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
							loading="lazy"
						/>
						<div
							class="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent"
						></div>
					{:else}
						<div
							class="from-primary/22 to-accent/10 text-muted-foreground flex h-full min-h-76 items-center justify-center bg-linear-to-br text-xs font-semibold tracking-[0.24em] uppercase"
						>
							No poster
						</div>
					{/if}
					<div class="absolute right-4 bottom-4 left-4 flex items-center justify-between gap-3">
						<Badge class="border-white/12 bg-slate-950/70 text-slate-100 backdrop-blur-sm">
							{networkLabel(props.show)}
						</Badge>
						<div class="rounded-full bg-slate-950/72 px-3 py-1 text-xs font-medium text-slate-100">
							{seasonCount} season{seasonCount === 1 ? '' : 's'}
						</div>
					</div>
				</div>

				<div class="flex min-w-0 flex-col justify-between p-5">
					<div class="space-y-4">
						<div class="flex items-start justify-between gap-3">
							<div class="min-w-0 space-y-2">
								<h2 class="truncate text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
								<div class="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs">
									<span>{episodeCount} episodes tracked</span>
									{#if props.show.tmdb?.voteAverage !== undefined}
										<span class="inline-flex items-center gap-1">
											<StarIcon class="h-3.5 w-3.5 fill-current" />
											{formatRating(props.show.tmdb.voteAverage)}
										</span>
									{/if}
									<span>{formatLastWatched(props.show.lastWatchedAt)}</span>
								</div>
							</div>
							{#if props.show.plexStatus !== 'unknown'}
								<StatusChip status={props.show.plexStatus} class="shrink-0" />
							{/if}
						</div>

						{#if props.show.tmdb?.overview}
							<p class="text-muted-foreground line-clamp-3 text-sm leading-6">
								{props.show.tmdb.overview}
							</p>
						{/if}

						<div class="grid gap-3 sm:grid-cols-3">
							<div class="border-border bg-background/42 rounded-2xl border px-3 py-3">
								<p
									class="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase"
								>
									Completion
								</p>
								<p class="mt-2 text-2xl font-semibold">{pct ?? 0}%</p>
							</div>
							<div class="border-border bg-background/42 rounded-2xl border px-3 py-3">
								<p
									class="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase"
								>
									Plex Plays
								</p>
								<p class="mt-2 text-2xl font-semibold">{props.show.watchCount ?? '—'}</p>
							</div>
							<div class="border-border bg-background/42 rounded-2xl border px-3 py-3">
								<p
									class="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase"
								>
									Latest Intake
								</p>
								<p class="mt-2 text-sm font-medium">
									{latestIntake > 0
										? new Date(latestIntake).toLocaleDateString()
										: 'Not queued yet'}
								</p>
							</div>
						</div>

						<div class="space-y-2">
							<div
								class="text-muted-foreground flex items-center justify-between text-[11px] font-semibold tracking-[0.18em] uppercase"
							>
								<span>Completion progress</span>
								<span>{pct ?? 0}% complete</span>
							</div>
							<div class="bg-background/70 h-2 rounded-full">
								<div
									class="from-primary to-secondary h-2 rounded-full bg-linear-to-r"
									style={`width: ${pct ?? 0}%`}
								></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</button>
	</div>

	<div class="border-border/70 flex flex-wrap justify-between gap-2 border-t px-5 py-4">
		<Button
			type="button"
			variant={props.expanded ? 'secondary' : 'default'}
			class="rounded-full px-4"
			onclick={props.onToggleExpand}
		>
			{#if props.expanded}
				<ChevronUpIcon class="mr-2 h-4 w-4" />
				Hide season drill-down
			{:else}
				<ChevronDownIcon class="mr-2 h-4 w-4" />
				Inspect seasons
			{/if}
		</Button>
		<Button
			href={showHref(props.show.normalizedTitle)}
			variant="outline"
			class="rounded-full px-4"
			aria-label={`Open ${title} detail page`}
		>
			<ExternalLinkIcon class="mr-2 h-4 w-4" />
			Open detail view
		</Button>
	</div>

	{#if props.expanded && props.selectedSeason}
		<ShowSeasonDrillDown
			show={props.show}
			selectedSeason={props.selectedSeason}
			torrents={props.torrents}
			onSelectSeason={props.onSelectSeason}
		/>
	{/if}
</Card>
