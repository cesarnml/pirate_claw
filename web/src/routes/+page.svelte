<script lang="ts">
	// Map TorrentStatSnapshot to display status for StatusChip
	function getTorrentDisplayStatus(torrent: { status: string; percentDone: number }): string {
		if (torrent.status === 'error') return 'ERROR';
		if (torrent.status === 'seeding') return 'SEEDING';
		if (torrent.percentDone === 1) return 'COMPLETED';
		if (torrent.status === 'stopped' && torrent.percentDone < 1) return 'PAUSED';
		if (torrent.status === 'downloading' && torrent.percentDone < 1) return 'DOWNLOADING';
		return torrent.status.toUpperCase(); // fallback
	}
	import ArrowDownToLineIcon from '@lucide/svelte/icons/arrow-down-to-line';
	import FilterIcon from '@lucide/svelte/icons/filter';
	import FlameIcon from '@lucide/svelte/icons/flame';
	import LibraryBigIcon from '@lucide/svelte/icons/library-big';
	import { browser } from '$app/environment';
	import StatusChip from '$lib/components/StatusChip.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { readOnboardingDismissed, writeOnboardingDismissed } from '$lib/onboarding';
	import type { CandidateStateRecord, RunSummaryRecord } from '$lib/types';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
	let onboardingDismissed = $state(false);

	// Returns { date: string, time: string, tz: string }
	function formatDateParts(iso: string): { date: string; time: string; tz: string } {
		const d = new Date(iso);
		// Use browser's local time zone
		const date = d.toLocaleDateString(undefined, { dateStyle: 'medium' });
		const time = d.toLocaleTimeString(undefined, { timeStyle: 'short' });
		// Try to get timezone abbreviation (not always supported)
		let tz = '';
		try {
			tz = d.toLocaleTimeString(undefined, { timeZoneName: 'short' }).split(' ').pop() || '';
		} catch (e) {
			console.log('e:', e);
			// ignore
		}
		return { date, time, tz };
	}

	// For event log table: keep a simple local time string
	function formatDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
	}

	function formatShortDate(iso: string): string {
		return new Date(iso).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			timeZone: 'UTC'
		});
	}

	function formatSpeed(bytesPerSec: number): string {
		if (bytesPerSec >= 1_048_576) return `${(bytesPerSec / 1_048_576).toFixed(1)} MB/s`;
		return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
	}

	function formatEta(eta: number): string {
		if (eta < 0) return '';
		if (eta < 60) return '<1m';
		const hours = Math.floor(eta / 3600);
		const minutes = Math.floor((eta % 3600) / 60);
		if (hours > 0) return `${hours}h ${minutes}m`;
		return `${minutes}m`;
	}

	function candidateTitle(candidate: CandidateStateRecord): string {
		if (
			candidate.mediaType === 'movie' &&
			candidate.tmdb &&
			'title' in candidate.tmdb &&
			candidate.tmdb.title
		) {
			return candidate.tmdb.title;
		}
		if (
			candidate.mediaType === 'tv' &&
			candidate.tmdb &&
			'name' in candidate.tmdb &&
			candidate.tmdb.name
		) {
			return candidate.tmdb.name;
		}
		return candidate.normalizedTitle;
	}

	function candidatePosterUrl(candidate: CandidateStateRecord): string | null {
		if (candidate.tmdb && 'posterUrl' in candidate.tmdb && candidate.tmdb.posterUrl) {
			return candidate.tmdb.posterUrl;
		}
		return null;
	}

	function initialBox(title: string): string {
		return title.charAt(0).toUpperCase();
	}

	function showSlug(title: string): string {
		return encodeURIComponent(title);
	}

	function archiveHref(candidate: CandidateStateRecord): string {
		return candidate.mediaType === 'tv'
			? `/shows/${showSlug(candidate.normalizedTitle)}`
			: '/movies';
	}

	function sumRunCounts(
		runs: RunSummaryRecord[] | null,
		key: 'failed' | 'skipped_duplicate' | 'skipped_no_match'
	): number | null {
		if (runs === null) return null;
		return runs.reduce((total, run) => total + run.counts[key], 0);
	}

	const candidates = $derived(data.candidates ?? []);
	const torrents = $derived(data.transmissionTorrents ?? []);
	const runSummaries = $derived(data.runSummaries);
	const outcomes = $derived(data.outcomes);

	// Pagination state for outcomes table
	let outcomesPage = $state(0);
	const OUTCOMES_PAGE_SIZE = 5;
	const outcomesPageCount = $derived(() =>
		outcomes ? Math.ceil(outcomes.length / OUTCOMES_PAGE_SIZE) : 0
	);
	function setOutcomesPage(page: number) {
		if (!outcomes) return;
		if (page < 0) page = 0;
		if (page >= outcomesPageCount()) page = outcomesPageCount() - 1;
		outcomesPage = page;
	}

	const activeDownloads = $derived(
		torrents.map((torrent) => {
			const candidate =
				candidates.find((item) => item.transmissionTorrentHash === torrent.hash) ?? null;
			return { torrent, candidate };
		})
	);

	const archiveItems = $derived(
		candidates
			.filter(
				(candidate): candidate is CandidateStateRecord & { queuedAt: string } =>
					candidate?.lifecycleStatus === 'completed' && !!candidate.queuedAt
			)
			.sort((a, b) => b.queuedAt.localeCompare(a.queuedAt))
			.slice(0, 6)
	);

	const totalTracked = $derived(candidates.length);
	const criticalFailures = $derived(sumRunCounts(runSummaries, 'failed'));
	const filteredSkipped = $derived(
		runSummaries === null
			? null
			: (sumRunCounts(runSummaries, 'skipped_duplicate') ?? 0) +
					(sumRunCounts(runSummaries, 'skipped_no_match') ?? 0)
	);

	const oneWeekAgo = $derived(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
	const completedThisWeek = $derived(
		candidates.filter((candidate) => {
			if (candidate.lifecycleStatus !== 'completed' || !candidate.transmissionDoneDate)
				return false;
			return new Date(candidate.transmissionDoneDate) >= oneWeekAgo;
		}).length
	);

	$effect(() => {
		if (!browser) return;
		onboardingDismissed = readOnboardingDismissed();
	});

	function dismissOnboardingPrompt() {
		if (!browser) return;
		writeOnboardingDismissed(true);
		onboardingDismissed = readOnboardingDismissed();
	}

	const showResumeCopy = $derived(
		data.onboarding?.state === 'partial_setup' ||
			(data.onboarding?.state === 'initial_empty' && onboardingDismissed)
	);
	const showOnboardingLink = $derived(data.onboarding?.state !== 'writes_disabled');

	const statusCards = $derived([
		{
			label: 'Total tracked',
			value: totalTracked,
			detail: `${candidates.filter((candidate) => candidate.lifecycleStatus === 'downloading').length} active torrents`,
			icon: LibraryBigIcon
		},
		{
			label: 'Weekly completed',
			value: completedThisWeek,
			detail: 'Finished during the last 7 days',
			icon: ArrowDownToLineIcon
		},
		{
			label: 'Critical failures',
			value: criticalFailures,
			detail:
				criticalFailures === null
					? 'Run summary data unavailable'
					: 'Recent failed daemon outcomes',
			icon: FlameIcon
		},
		{
			label: 'Filtered / skipped',
			value: filteredSkipped,
			detail:
				filteredSkipped === null
					? 'Run summary data unavailable'
					: 'Recent duplicate and no-match outcomes',
			icon: FilterIcon
		}
	]);
</script>

<section class="space-y-8">
	<div class="space-y-3">
		<p class="text-primary font-mono text-xs font-semibold tracking-[0.28em] uppercase">
			Overview Dashboard
		</p>
		<div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
			<div class="space-y-3">
				<h1 class="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-balance">
					Pirate Claw is watching the seas
				</h1>
				<p class="text-muted-foreground max-w-2xl text-sm leading-6">
					This dashboard gives you a real-time overview of what Pirate Claw is up to, including
					active downloads, recent feed outcomes, and more.
				</p>
			</div>

			{#if data.health}
				<div class="flex flex-row gap-2">
					{#each [{ label: 'Last feed intake', value: data.health.lastRunCycle?.completedAt }, { label: 'Last reconcile', value: data.health.lastReconcileCycle?.completedAt }] as card}
						<div
							class="bg-card/65 flex max-w-xs min-w-45 flex-col justify-between rounded-3xl border border-[color-mix(in_srgb,var(--primary)_60%,#23293a_40%)] px-4 py-3 shadow-[0_2px_12px_0_rgba(0,0,0,0.04)] backdrop-blur-sm"
						>
							<p
								class="text-muted-foreground text-[11px] font-semibold tracking-[0.22em] uppercase"
							>
								{card.label}
							</p>
							{#if card.value}
								{@const parts = formatDateParts(card.value)}
								<div class="mt-2 flex flex-col items-start">
									<span class="text-foreground/80 text-sm leading-tight font-medium"
										>{parts.date}</span
									>
									<span class="text-2xl leading-tight font-semibold"
										>{parts.time}
										<span class="text-muted-foreground text-xs font-normal">{parts.tz}</span></span
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

	{#if data.onboarding && data.onboarding.state !== 'ready'}
		<Alert class="border-primary/20 bg-primary/8">
			<AlertTitle>{showResumeCopy ? 'Resume onboarding' : 'Finish first-time setup'}</AlertTitle>
			<AlertDescription class="flex flex-wrap items-center gap-3">
				<span>
					{#if data.onboarding.state === 'writes_disabled'}
						Config writes are disabled, so guided setup is unavailable until write access is
						enabled.
					{:else if showResumeCopy}
						Continue the guided setup flow from where you left off, or keep configuring manually.
					{:else}
						Start onboarding to save your first feed and finish the rest of setup without editing
						JSON.
					{/if}
				</span>
				{#if showOnboardingLink}
					<a href="/onboarding" class="text-primary text-sm font-medium hover:underline">
						{showResumeCopy ? 'Resume onboarding' : 'Start onboarding'}
					</a>
				{:else}
					<a href="/config" class="text-primary text-sm font-medium hover:underline">Open config</a>
				{/if}
				{#if data.onboarding.state === 'initial_empty' && !onboardingDismissed}
					<button
						type="button"
						class="text-muted-foreground text-sm hover:underline"
						onclick={dismissOnboardingPrompt}
					>
						Skip for now
					</button>
				{/if}
			</AlertDescription>
		</Alert>
	{/if}

	{#if data.error}
		<Alert variant="destructive" role="alert">
			<AlertTitle>API unavailable</AlertTitle>
			<AlertDescription>{data.error}</AlertDescription>
		</Alert>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			{#each statusCards as card}
				<Card
					class="bg-card/40 rounded-[28px] border-white/10 shadow-[0_20px_60px_rgba(2,6,23,0.22)]"
				>
					<CardContent class="flex items-start justify-between gap-4 pt-6">
						<div>
							<p
								class="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase"
							>
								{card.label}
							</p>
							<p class="mt-3 text-4xl font-semibold tracking-[-0.04em]">{card.value ?? '—'}</p>
							<p class="text-muted-foreground mt-2 text-xs">{card.detail}</p>
						</div>
						<div class="bg-primary/15 text-primary rounded-2xl p-3">
							<card.icon class="h-5 w-5" />
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>

		<div class="grid grid-cols-1 gap-6 min-[1280px]:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
			<Card
				class="bg-card/70 scrollbar-none max-h-136 min-w-[420px] overflow-y-auto rounded-[30px] border-white/10 [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				<CardHeader class="pb-4">
					<div class="flex items-start justify-between gap-4">
						<div>
							<p
								class="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase"
							>
								Transmission activity
							</p>
							<h2 class="mt-2 text-2xl font-semibold tracking-[-0.03em]">Torrent Manager</h2>
						</div>
						{#if data.transmissionSession}
							<div class="text-right">
								<p
									class="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase"
								>
									Live throughput
								</p>
								<p class="mt-2 flex flex-col items-end gap-0.5 text-sm font-medium">
									<span
										><span class="text-muted-foreground">↓</span>
										{formatSpeed(data.transmissionSession.downloadSpeed)}</span
									>
									<span
										><span class="text-muted-foreground">↑</span>
										{formatSpeed(data.transmissionSession.uploadSpeed)}</span
									>
								</p>
							</div>
						{/if}
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					{#if activeDownloads.length === 0}
						<div class="border-border bg-background/55 rounded-3xl border border-dashed px-5 py-8">
							<p class="text-sm font-medium">No active downloads right now.</p>
							<p class="text-muted-foreground mt-2 text-sm">
								Queued torrents will surface here once Transmission starts pulling them down.
							</p>
						</div>
					{:else}
						<ul class="space-y-4">
							{#each activeDownloads as { torrent, candidate }}
								{@const title = candidate ? candidateTitle(candidate) : torrent.name}
								{@const posterUrl = candidate ? candidatePosterUrl(candidate) : null}
								<li class="border-border bg-background/45 flex gap-4 rounded-[26px] border p-4">
									{#if posterUrl}
										<img
											src={posterUrl}
											alt={title}
											class="h-24 w-16 shrink-0 rounded-2xl object-cover"
											loading="lazy"
										/>
									{:else}
										<div
											class="bg-muted text-muted-foreground flex h-24 w-16 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold"
										>
											{initialBox(title)}
										</div>
									{/if}

									<div class="min-w-0 flex-1">
										<div class="flex flex-wrap items-start justify-between gap-3">
											<div class="min-w-0">
												<p class="truncate text-lg font-medium">{title}</p>
												<div class="text-muted-foreground mt-2 flex flex-wrap gap-2 text-xs">
													{#if candidate?.resolution}
														<span class="rounded-full bg-white/6 px-2 py-1"
															>{candidate.resolution}</span
														>
													{/if}
													{#if candidate?.codec}
														<span class="rounded-full bg-white/6 px-2 py-1">{candidate.codec}</span>
													{/if}
													<StatusChip status={getTorrentDisplayStatus(torrent)} />
												</div>
											</div>
											<div class="text-right text-sm">
												<p class="font-medium">{formatSpeed(torrent.rateDownload)}</p>
												<p class="text-muted-foreground mt-1">{formatEta(torrent.eta)}</p>
											</div>
										</div>

										<div class="mt-4">
											<div class="mb-2 flex items-center justify-end text-xs">
												<p class="font-medium">{(torrent.percentDone * 100).toFixed(0)}%</p>
											</div>
											<div class="bg-muted h-2 rounded-full">
												<div
													class="bg-primary h-2 rounded-full"
													style="width: {(torrent.percentDone * 100).toFixed(0)}%"
												></div>
											</div>
										</div>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</CardContent>
			</Card>

			<Card class="bg-card/70 max-h-136 rounded-[30px] border-white/10">
				<CardHeader class="pb-4">
					<p class="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
						Event log
					</p>
					<h2 class="mt-2 text-2xl font-semibold tracking-[-0.03em]">
						Recent unmatched feed events
					</h2>
				</CardHeader>
				<CardContent>
					{#if outcomes === null}
						<div class="border-border bg-background/55 rounded-3xl border border-dashed px-5 py-8">
							<p class="text-sm font-medium">Recent outcome data is unavailable.</p>
							<p class="text-muted-foreground mt-2 text-sm">
								The dashboard could not load `/api/outcomes`, so unmatched feed events are not shown
								right now.
							</p>
						</div>
					{:else if outcomes.length === 0}
						<div class="border-border bg-background/55 rounded-3xl border border-dashed px-5 py-8">
							<p class="text-sm font-medium">No filtered or skipped feed events yet.</p>
							<p class="text-muted-foreground mt-2 text-sm">
								When items miss every rule, they will land here with their source feed and
								timestamp.
							</p>
						</div>
					{:else}
						<div class="border-border overflow-hidden rounded-3xl border">
							<Table class="w-full table-fixed">
								<TableHeader>
									<TableRow class="hover:bg-transparent">
										<TableHead class="pl-4">Title</TableHead>
										<TableHead class="w-26 whitespace-nowrap">Status</TableHead>
										<TableHead class="w-20 text-right"></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{#each outcomes.slice(outcomesPage * OUTCOMES_PAGE_SIZE, (outcomesPage + 1) * OUTCOMES_PAGE_SIZE) as outcome (outcome.id)}
										<TableRow>
											<TableCell class="min-w-0 pl-4 text-sm font-medium">
												<p class="truncate">{outcome.title ?? '—'}</p>
												<p class="text-muted-foreground mt-0.5 text-[11px] font-normal">
													{formatDate(outcome.recordedAt)}
												</p>
											</TableCell>
											<TableCell class="whitespace-nowrap"
												><StatusChip status={outcome.status} /></TableCell
											>
											<TableCell class="pr-4 text-right">
												<button
													type="button"
													class="bg-primary/15 text-primary border-primary/30 hover:bg-primary/22 inline-flex h-6 cursor-pointer items-center rounded-md border px-2 text-[11px] font-medium transition"
												>
													Queue
												</button>
											</TableCell>
										</TableRow>
									{/each}
								</TableBody>
							</Table>
						</div>
						<div class="flex items-center justify-end gap-2 px-4 py-2">
							<button
								class="bg-muted/30 rounded px-2 py-1 text-xs font-semibold disabled:opacity-40"
								onclick={() => setOutcomesPage(outcomesPage - 1)}
								disabled={outcomesPage === 0}>&larr; Prev</button
							>
							<span class="text-muted-foreground text-xs"
								>Page {outcomesPage + 1} of {outcomesPageCount()}</span
							>
							<button
								class="bg-muted/30 rounded px-2 py-1 text-xs font-semibold disabled:opacity-40"
								onclick={() => setOutcomesPage(outcomesPage + 1)}
								disabled={outcomesPage + 1 >= outcomesPageCount()}>Next &rarr;</button
							>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		<Card class="bg-card/70 rounded-[30px] border-white/10" data-testid="archive-strip">
			<CardHeader class="pb-4">
				<p class="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
					Archive commit
				</p>
				<h2 class="mt-2 text-2xl font-semibold tracking-[-0.03em]">Recently completed grabs</h2>
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
					<div
						class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6"
						data-testid="archive-grid"
					>
						{#each archiveItems as item}
							{@const posterUrl = candidatePosterUrl(item)}
							<a
								href={archiveHref(item)}
								class="group border-border bg-background/45 overflow-hidden rounded-3xl border transition-transform hover:-translate-y-0.5"
							>
								{#if posterUrl}
									<img
										src={posterUrl}
										alt={candidateTitle(item)}
										class="aspect-2/3 w-full object-cover"
										loading="lazy"
									/>
								{:else}
									<div
										class="bg-muted text-muted-foreground flex aspect-2/3 w-full items-center justify-center text-xs font-medium"
									>
										No poster
									</div>
								{/if}

								<div class="space-y-2 p-3">
									<p class="truncate text-sm font-medium">{candidateTitle(item)}</p>
									<div class="flex items-center justify-between gap-3">
										<StatusChip status="completed" />
										<p class="text-muted-foreground text-xs">
											{formatShortDate(item.queuedAt)}
										</p>
									</div>
								</div>
							</a>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>
	{/if}
</section>
