<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import { tick } from 'svelte';
	import ApiUnavailableAlert from '$lib/components/ApiUnavailableAlert.svelte';
	import {
		formatCycleLoad,
		formatTransferRate,
		maskConfiguredValue,
		parseHostPortFromUrl,
		totalRunItems
	} from '$lib/helpers';
	import { toast } from '$lib/toast';
	import type { FeedConfig } from '$lib/types';
	import Clock3Icon from '@lucide/svelte/icons/clock-3';
	import CpuIcon from '@lucide/svelte/icons/cpu';
	import HardDriveIcon from '@lucide/svelte/icons/hard-drive';
	import RadarIcon from '@lucide/svelte/icons/radar';
	import type { Component } from 'svelte';
	import type { ActionData, PageData } from './$types';
	import ConfigMetricsGrid from './components/ConfigMetricsGrid.svelte';
	import ConfigPageHeader from './components/ConfigPageHeader.svelte';
	import DeleteShowModal from './components/DeleteShowModal.svelte';
	import FeedsCard from './components/FeedsCard.svelte';
	import MoviePolicyCard from './components/MoviePolicyCard.svelte';
	import RestartDaemonBanner from './components/RestartDaemonBanner.svelte';
	import ShowWatchlistEditor from './components/ShowWatchlistEditor.svelte';
	import TransmissionCard from './components/TransmissionCard.svelte';
	import TvConfigCard from './components/TvConfigCard.svelte';

	const ALL_RESOLUTIONS = ['2160p', '1080p', '720p', '480p'];
	const ALL_CODECS = ['x264', 'x265'];
	const WRITE_DISABLED_TOOLTIP = 'Configure PIRATE_CLAW_API_WRITE_TOKEN to enable editing';

	type ShowIntent =
		| { type: 'add'; name: string }
		| { type: 'edit'; name: string }
		| { type: 'delete'; name: string };

	type Metric = {
		label: string;
		value: string;
		detail: string;
		icon: Component;
	};

	const { data, form }: { data: PageData; form?: ActionData } = $props();
	const currentEtag = $derived(
		form?.feedsEtag ??
			form?.moviesEtag ??
			form?.tvDefaultsEtag ??
			form?.showsEtag ??
			form?.runtimeEtag ??
			data.etag ??
			null
	);
	const canWrite = $derived(data.canWrite);

	let showRows = $state<string[]>([]);
	let tvResolutions = $state<string[]>([]);
	let tvCodecs = $state<string[]>([]);
	let movieYears = $state<number[]>([]);
	let movieResolutions = $state<string[]>([]);
	let movieCodecs = $state<string[]>([]);
	let movieCodecPolicy = $state<'prefer' | 'require'>('prefer');
	let movieYearInput = $state('');
	let feedsList = $state<FeedConfig[]>([]);
	let newFeedName = $state('');
	let newFeedUrl = $state('');
	let newFeedMediaType = $state<'tv' | 'movie'>('tv');
	let feedsSubmitting = $state(false);
	let testingConnection = $state(false);
	let showsSubmitting = $state(false);
	let pendingShowIntent = $state<ShowIntent | null>(null);
	let showsFormEl = $state<HTMLFormElement | null>(null);
	let showsSubmitButtonEl = $state<HTMLButtonElement | null>(null);
	let showDeleteConfirm = $state<{ index: number; name: string } | null>(null);
	let showAddDraftActive = $state(false);
	let showAddDraftName = $state('');
	let showAddDraftInputEl = $state<HTMLInputElement | null>(null);
	let showRestartOffer = $state(false);
	let restarting = $state(false);
	let restartOfferId = $state<ReturnType<typeof setTimeout> | null>(null);

	function offerRestart() {
		showRestartOffer = true;
		if (restartOfferId) clearTimeout(restartOfferId);
		restartOfferId = setTimeout(() => {
			showRestartOffer = false;
		}, 10000);
	}

	$effect(() => {
		if (!showAddDraftActive) return;
		tick().then(() => showAddDraftInputEl?.focus());
	});

	$effect(() => {
		return () => {
			if (restartOfferId) clearTimeout(restartOfferId);
		};
	});

	$effect(() => {
		const config = data.config;
		if (!config) return;
		showRows = config.tv.map((rule) => rule.matchPattern ?? rule.name);
		tvResolutions = [...(config.tvDefaults?.resolutions ?? [])];
		tvCodecs = [...(config.tvDefaults?.codecs ?? [])];
		movieYears = [...config.movies.years];
		movieResolutions = [...config.movies.resolutions];
		movieCodecs = [...config.movies.codecs];
		movieCodecPolicy = config.movies.codecPolicy;
		feedsList = [...config.feeds];
	});

	function startAddShowDraft() {
		if (!canWrite || showsSubmitting) return;
		showAddDraftActive = true;
		showAddDraftName = '';
	}

	function submitShows(intent: ShowIntent) {
		if (!canWrite || !currentEtag || showsSubmitting || !showsFormEl || !showsSubmitButtonEl)
			return;
		pendingShowIntent = intent;
		showsFormEl.requestSubmit(showsSubmitButtonEl);
	}

	function handleShowEnter(index: number) {
		const name = showRows[index]?.trim() ?? '';
		if (!name) return;
		submitShows({ type: 'edit', name });
	}

	async function submitAddShowDraft() {
		const name = showAddDraftName.trim();
		if (!name) return;
		showRows = [...showRows, name];
		showAddDraftActive = false;
		showAddDraftName = '';
		await tick();
		submitShows({ type: 'add', name });
	}

	function cancelAddShowDraft() {
		showAddDraftActive = false;
		showAddDraftName = '';
	}

	function removeShow(index: number) {
		if (showRows.length <= 1) return;
		const deletedName = showRows[index]?.trim() ?? '';
		if (!deletedName) return;
		showDeleteConfirm = { index, name: deletedName };
	}

	function cancelDeleteShow() {
		showDeleteConfirm = null;
	}

	function handleDeleteModalKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && showDeleteConfirm) {
			event.preventDefault();
			cancelDeleteShow();
		}
	}

	async function confirmDeleteShow() {
		if (!showDeleteConfirm) return;
		const { index, name } = showDeleteConfirm;
		showRows = showRows.filter((_, i) => i !== index);
		showDeleteConfirm = null;
		await tick();
		submitShows({ type: 'delete', name });
	}

	function updateShowName(index: number, value: string) {
		showRows = showRows.map((row, i) => (i === index ? value : row));
	}

	function toggleSelection(values: string[], value: string): string[] {
		return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
	}

	function toggleResolution(resolution: string) {
		tvResolutions = toggleSelection(tvResolutions, resolution);
	}

	function toggleCodec(codec: string) {
		tvCodecs = toggleSelection(tvCodecs, codec);
	}

	function addMovieYear() {
		const value = Number(movieYearInput.trim());
		if (Number.isInteger(value) && value >= 1900 && value <= 2100 && !movieYears.includes(value)) {
			movieYears = [...movieYears, value].sort((left, right) => left - right);
			movieYearInput = '';
		}
	}

	function removeMovieYear(year: number) {
		movieYears = movieYears.filter((value) => value !== year);
	}

	function toggleMovieResolution(resolution: string) {
		movieResolutions = toggleSelection(movieResolutions, resolution);
	}

	function toggleMovieCodec(codec: string) {
		movieCodecs = toggleSelection(movieCodecs, codec);
	}

	function removeFeed(index: number) {
		feedsList = feedsList.filter((_, i) => i !== index);
	}

	function transmissionAuthConfigured(): boolean {
		if (!data.config) return false;
		return !!(data.config.transmission.username || data.config.transmission.password);
	}

	function storagePoolLabel(): string {
		if (!data.config) return 'Unavailable';
		return (
			data.config.transmission.downloadDirs?.movie ??
			data.config.transmission.downloadDir ??
			data.config.runtime.artifactDir
		);
	}

	function formatDaemonUptime(value: number | undefined | null): string {
		if (typeof value !== 'number' || value <= 0) return 'Unavailable';
		const totalMinutes = Math.floor(value / 60_000);
		const days = Math.floor(totalMinutes / 1440);
		const hours = Math.floor((totalMinutes % 1440) / 60);
		const minutes = totalMinutes % 60;
		if (days > 0) return `${days}d ${hours}h`;
		if (hours > 0) return `${hours}h ${minutes}m`;
		return `${minutes}m`;
	}

	const transmissionEndpoint = $derived(
		data.config
			? parseHostPortFromUrl(data.config.transmission.url)
			: { host: 'Unavailable', port: '—' }
	);
	const latestRunSummary = $derived(data.runSummaries?.[0] ?? null);
	const metrics = $derived<Metric[]>([
		{
			label: 'Storage Pool',
			value: storagePoolLabel(),
			detail: 'Active transfer target',
			icon: HardDriveIcon
		},
		{
			label: 'Transfer Rate',
			value: formatTransferRate(data.transmissionSession?.downloadSpeed),
			detail:
				typeof data.transmissionSession?.uploadSpeed === 'number'
					? `Upload ${formatTransferRate(data.transmissionSession.uploadSpeed)}`
					: 'Download telemetry',
			icon: RadarIcon
		},
		{
			label: 'CPU Load',
			value: formatCycleLoad(data.health?.lastRunCycle?.durationMs),
			detail:
				totalRunItems(latestRunSummary) !== null
					? `${totalRunItems(latestRunSummary)} items in last run`
					: 'Last automation cycle',
			icon: CpuIcon
		},
		{
			label: 'Uptime',
			value: formatDaemonUptime(data.health?.uptime),
			detail: data.health?.startedAt
				? `Started ${new Date(data.health.startedAt).toLocaleString()}`
				: 'Daemon availability',
			icon: Clock3Icon
		}
	]);

	const enhanceTestConnection: SubmitFunction = () => {
		testingConnection = true;
		return async ({ result, update }) => {
			testingConnection = false;
			if (result.type === 'success') {
				const version = (result.data as { version?: string })?.version ?? '';
				toast(`Transmission reachable — version ${version}`, 'success');
			} else if (result.type === 'failure') {
				const pingError = (result.data as { pingError?: string })?.pingError;
				toast(pingError ?? 'Transmission unreachable — check .env credentials and host', 'error');
			}
			await update({ reset: false });
		};
	};

	const enhanceSaveRuntime: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast('Saved — restart the daemon for this change to take effect', 'success');
				offerRestart();
			} else if (result.type === 'failure') {
				if (result.status === 409) {
					toast('Config changed elsewhere — reload and try again', 'error');
				} else {
					toast('Save failed — see errors above', 'error');
				}
			}
			await update();
		};
	};

	const enhanceSaveFeeds: SubmitFunction = () => {
		feedsSubmitting = true;
		return async ({ result, update }) => {
			feedsSubmitting = false;
			if (result.type === 'success') {
				newFeedName = '';
				newFeedUrl = '';
				newFeedMediaType = 'tv';
				toast('Saved', 'success');
			} else if (result.type === 'failure') {
				if (result.status === 409) {
					toast('Config changed elsewhere — reload and try again', 'error');
				} else {
					toast('Save failed — see errors above', 'error');
				}
			}
			await update();
		};
	};

	const enhanceSaveTvDefaults: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast('Saved', 'success');
			} else if (result.type === 'failure') {
				if (result.status === 409) {
					toast('Config changed elsewhere — reload and try again', 'error');
				} else {
					toast('Save failed — see errors above', 'error');
				}
			}
			await update();
		};
	};

	const enhanceSaveShows: SubmitFunction = () => {
		showsSubmitting = true;
		return async ({ result, update }) => {
			showsSubmitting = false;
			if (result.type === 'success') {
				if (pendingShowIntent?.type === 'add') {
					toast(`TV show added: ${pendingShowIntent.name}`, 'success');
				} else if (pendingShowIntent?.type === 'edit') {
					toast(`TV show edited: ${pendingShowIntent.name}`, 'success');
				} else if (pendingShowIntent?.type === 'delete') {
					toast(`TV show deleted: ${pendingShowIntent.name}`, 'success');
				}
			} else if (result.type === 'failure') {
				if (result.status === 409) {
					toast('Config changed elsewhere — reload and try again', 'error');
				} else {
					toast('Save failed — see errors above', 'error');
				}
			}
			pendingShowIntent = null;
			await update({ reset: false });
		};
	};

	const enhanceSaveMovies: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast('Saved', 'success');
			} else if (result.type === 'failure') {
				if (result.status === 409) {
					toast('Config changed elsewhere — reload and try again', 'error');
				} else {
					const detail =
						typeof result.data?.moviesMessage === 'string' ? result.data.moviesMessage : undefined;
					toast('Save failed — see errors above', 'error', detail);
				}
			}
			await update();
		};
	};

	const enhanceRestartDaemon: SubmitFunction = () => {
		restarting = true;
		return async ({ result, update }) => {
			showRestartOffer = false;
			restarting = false;
			if (result.type === 'success') {
				toast('Restarting… the page may become temporarily unavailable', 'success');
			} else {
				toast('Restart failed — try again or restart manually', 'error');
			}
			await update({ reset: false });
		};
	};
</script>

<svelte:window onkeydown={handleDeleteModalKeydown} />

<section class="space-y-6">
	<ConfigPageHeader {canWrite} onboarding={data.onboarding} />

	{#if data.error}
		<ApiUnavailableAlert message={data.error} />
	{:else if data.config}
		<div class="grid gap-5 xl:grid-cols-2">
			<TransmissionCard
				{canWrite}
				{currentEtag}
				writeDisabledTooltip={WRITE_DISABLED_TOOLTIP}
				connected={!!data.transmissionSession}
				host={transmissionEndpoint.host}
				port={transmissionEndpoint.port}
				version={data.transmissionSession?.version ?? 'Unavailable'}
				authToken={maskConfiguredValue(transmissionAuthConfigured())}
				url={data.config.transmission.url}
				downloadTarget={storagePoolLabel()}
				runtime={data.config.runtime}
				{showRows}
				{testingConnection}
				runtimeMessage={form?.runtimeMessage}
				{enhanceTestConnection}
				{enhanceSaveRuntime}
			/>

			<FeedsCard
				{feedsList}
				{newFeedName}
				{newFeedUrl}
				{newFeedMediaType}
				{canWrite}
				{currentEtag}
				{feedsSubmitting}
				writeDisabledTooltip={WRITE_DISABLED_TOOLTIP}
				feedsMessage={form?.feedsMessage}
				feedsUrlError={form?.feedsUrlError}
				{enhanceSaveFeeds}
				onRemoveFeed={removeFeed}
				onNewFeedNameChange={(value) => (newFeedName = value)}
				onNewFeedUrlChange={(value) => (newFeedUrl = value)}
				onNewFeedMediaTypeChange={(value) => (newFeedMediaType = value)}
			/>

			<div class="space-y-5">
				<TvConfigCard
					resolutions={tvResolutions}
					codecs={tvCodecs}
					allResolutions={ALL_RESOLUTIONS}
					allCodecs={ALL_CODECS}
					{canWrite}
					{currentEtag}
					writeDisabledTooltip={WRITE_DISABLED_TOOLTIP}
					{enhanceSaveTvDefaults}
					onToggleResolution={toggleResolution}
					onToggleCodec={toggleCodec}
				/>

				<div class="bg-card/75 rounded-[30px] border border-white/10 p-6">
					<p class="text-primary font-mono text-xs font-semibold tracking-[0.2em] uppercase">
						03B · Active Watchlist
					</p>
					<h3 class="mt-2 text-2xl font-semibold tracking-[-0.03em]">Tracked Shows</h3>
					<ShowWatchlistEditor
						{showRows}
						{showAddDraftActive}
						{showAddDraftName}
						{canWrite}
						{currentEtag}
						showsMessage={form?.showsMessage}
						writeDisabledTooltip={WRITE_DISABLED_TOOLTIP}
						{enhanceSaveShows}
						setShowsFormEl={(element) => (showsFormEl = element)}
						setShowsSubmitButtonEl={(element) => (showsSubmitButtonEl = element)}
						setShowAddDraftInputEl={(element) => (showAddDraftInputEl = element)}
						onUpdateShowName={updateShowName}
						onHandleShowEnter={handleShowEnter}
						onStartAddShowDraft={startAddShowDraft}
						onCancelAddShowDraft={cancelAddShowDraft}
						onSubmitAddShowDraft={submitAddShowDraft}
						onRemoveShow={removeShow}
						onShowAddDraftNameChange={(value) => (showAddDraftName = value)}
					/>
				</div>
			</div>

			<MoviePolicyCard
				{movieYears}
				{movieYearInput}
				{movieResolutions}
				{movieCodecs}
				{movieCodecPolicy}
				allResolutions={ALL_RESOLUTIONS}
				allCodecs={ALL_CODECS}
				{canWrite}
				{currentEtag}
				writeDisabledTooltip={WRITE_DISABLED_TOOLTIP}
				moviesMessage={form?.moviesMessage}
				{enhanceSaveMovies}
				onRemoveMovieYear={removeMovieYear}
				onMovieYearInputChange={(value) => (movieYearInput = value)}
				onAddMovieYear={addMovieYear}
				onToggleMovieResolution={toggleMovieResolution}
				onToggleMovieCodec={toggleMovieCodec}
				onMovieCodecPolicyChange={(value) => (movieCodecPolicy = value)}
			/>
		</div>

		<ConfigMetricsGrid {metrics} />

		<RestartDaemonBanner
			show={showRestartOffer}
			{canWrite}
			{restarting}
			writeDisabledTooltip={WRITE_DISABLED_TOOLTIP}
			{enhanceRestartDaemon}
		/>

		<DeleteShowModal
			open={!!showDeleteConfirm}
			name={showDeleteConfirm?.name}
			onCancel={cancelDeleteShow}
			onConfirm={confirmDeleteShow}
		/>
	{/if}
</section>
