<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import type { SubmitFunction } from '@sveltejs/kit';
	import XIcon from '@lucide/svelte/icons/x';

	interface Props {
		showRows: string[];
		showAddDraftActive: boolean;
		showAddDraftName: string;
		canWrite: boolean;
		currentEtag: string | null;
		showsMessage?: string;
		writeDisabledTooltip: string;
		enhanceSaveShows: SubmitFunction;
		setShowsFormEl: (element: HTMLFormElement | null) => void;
		setShowsSubmitButtonEl: (element: HTMLButtonElement | null) => void;
		setShowAddDraftInputEl: (element: HTMLInputElement | null) => void;
		onUpdateShowName: (index: number, value: string) => void;
		onHandleShowEnter: (index: number) => void;
		onStartAddShowDraft: () => void;
		onCancelAddShowDraft: () => void;
		onSubmitAddShowDraft: () => void | Promise<void>;
		onRemoveShow: (index: number) => void;
		onShowAddDraftNameChange: (value: string) => void;
	}

	const {
		showRows,
		showAddDraftActive,
		showAddDraftName,
		canWrite,
		currentEtag,
		showsMessage,
		writeDisabledTooltip,
		enhanceSaveShows,
		setShowsFormEl,
		setShowsSubmitButtonEl,
		setShowAddDraftInputEl,
		onUpdateShowName,
		onHandleShowEnter,
		onStartAddShowDraft,
		onCancelAddShowDraft,
		onSubmitAddShowDraft,
		onRemoveShow,
		onShowAddDraftNameChange
	}: Props = $props();

	let showsFormEl = $state<HTMLFormElement | null>(null);
	let showsSubmitButtonEl = $state<HTMLButtonElement | null>(null);
	let showAddDraftInputEl = $state<HTMLInputElement | null>(null);

	$effect(() => {
		setShowsFormEl(showsFormEl);
	});

	$effect(() => {
		setShowsSubmitButtonEl(showsSubmitButtonEl);
	});

	$effect(() => {
		setShowAddDraftInputEl(showAddDraftInputEl);
	});
</script>

<form
	bind:this={showsFormEl}
	method="POST"
	action="?/saveShows"
	class="space-y-4 border-t border-white/8 pt-5"
	use:enhance={enhanceSaveShows}
>
	<input type="hidden" name="ifMatch" value={currentEtag ?? ''} />

	<div class="space-y-2">
		<p class="text-muted-foreground text-sm font-medium">Active watchlist</p>
		<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
			{#if showRows.length === 0}
				<p class="text-muted-foreground text-sm">No tracked shows configured yet.</p>
			{:else}
				{#each showRows as name, index}
					<div
						class="border-border bg-background/50 focus-within:border-primary/70 focus-within:ring-primary/30 flex w-full items-center gap-3 rounded-full px-4 transition-colors focus-within:ring-2"
					>
						<input
							name="showName"
							type="text"
							value={name}
							autocomplete="off"
							aria-label={`TV show ${index + 1}`}
							disabled={!canWrite}
							title={!canWrite ? writeDisabledTooltip : undefined}
							class="min-w-0 flex-1 bg-transparent py-2 text-sm text-ellipsis whitespace-nowrap outline-none disabled:opacity-50"
							oninput={(event) => onUpdateShowName(index, event.currentTarget.value)}
							onkeydown={(event) => {
								if (event.key === 'Enter') {
									event.preventDefault();
									onHandleShowEnter(index);
								}
							}}
						/>
						<button
							type="button"
							class="border-border text-muted-foreground hover:border-primary/60 hover:text-primary hover:bg-muted inline-flex size-5 items-center justify-center rounded-full border text-xs transition-colors disabled:opacity-50"
							disabled={!canWrite || showRows.length <= 1}
							title={!canWrite ? writeDisabledTooltip : undefined}
							aria-label="Remove show"
							onclick={() => onRemoveShow(index)}
						>
							<XIcon class="size-3.5" />
						</button>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<div class="flex flex-wrap items-center gap-3">
		{#if showAddDraftActive}
			<div
				class="border-border bg-background/50 focus-within:border-primary/70 focus-within:ring-primary/30 flex items-center gap-3 rounded-full border px-4 transition-colors focus-within:ring-2"
			>
				<input
					bind:this={showAddDraftInputEl}
					type="text"
					placeholder="New show name"
					autocomplete="off"
					class="w-auto min-w-[12ch] bg-transparent py-2 text-sm outline-none"
					value={showAddDraftName}
					oninput={(event) => onShowAddDraftNameChange(event.currentTarget.value)}
					onkeydown={(event) => {
						if (event.key === 'Escape') {
							event.preventDefault();
							onCancelAddShowDraft();
						} else if (event.key === 'Enter') {
							event.preventDefault();
							void onSubmitAddShowDraft();
						}
					}}
				/>
				<button
					type="button"
					class="border-border text-muted-foreground hover:border-primary/60 hover:text-primary hover:bg-muted inline-flex size-7 items-center justify-center rounded-full border transition-colors"
					aria-label="Cancel add show"
					onclick={onCancelAddShowDraft}
				>
					<XIcon class="size-4" />
				</button>
			</div>
		{:else}
			<Button
				type="button"
				variant="outline"
				class="rounded-full px-5"
				disabled={!canWrite}
				title={!canWrite ? writeDisabledTooltip : undefined}
				onclick={onStartAddShowDraft}
			>
				Add show
			</Button>
		{/if}
		<button
			bind:this={showsSubmitButtonEl}
			type="submit"
			class="hidden"
			tabindex="-1"
			aria-hidden="true"
		></button>
	</div>

	{#if showsMessage}
		<p class="text-destructive text-xs">{showsMessage}</p>
	{/if}
</form>
