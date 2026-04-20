<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import type { SubmitFunction } from '@sveltejs/kit';
	import SelectablePillGroup from './SelectablePillGroup.svelte';

	interface Props {
		resolutions: string[];
		codecs: string[];
		allResolutions: string[];
		allCodecs: string[];
		canWrite: boolean;
		currentEtag: string | null;
		writeDisabledTooltip: string;
		enhanceSaveTvDefaults: SubmitFunction;
		onToggleResolution: (value: string) => void;
		onToggleCodec: (value: string) => void;
	}

	const {
		resolutions,
		codecs,
		allResolutions,
		allCodecs,
		canWrite,
		currentEtag,
		writeDisabledTooltip,
		enhanceSaveTvDefaults,
		onToggleResolution,
		onToggleCodec
	}: Props = $props();
</script>

<Card class="bg-card/75 rounded-[30px] border-white/10">
	<CardHeader class="space-y-4">
		<p class="text-primary font-mono text-xs font-semibold tracking-[0.2em] uppercase">
			03 · TV Serial Parameters
		</p>
		<h2 class="text-2xl font-semibold tracking-[-0.03em]">TV Configuration</h2>
	</CardHeader>
	<CardContent class="space-y-6">
		<form
			method="POST"
			action="?/saveTvDefaults"
			class="space-y-4"
			use:enhance={enhanceSaveTvDefaults}
		>
			<input type="hidden" name="tvDefaultsIfMatch" value={currentEtag ?? ''} />
			{#each resolutions as resolution}
				<input type="hidden" name="tvResolution" value={resolution} />
			{/each}
			{#each codecs as codec}
				<input type="hidden" name="tvCodec" value={codec} />
			{/each}

			<SelectablePillGroup
				label="Target resolutions"
				options={allResolutions}
				selected={resolutions}
				disabled={!canWrite}
				title={!canWrite ? writeDisabledTooltip : undefined}
				onToggle={onToggleResolution}
			/>

			<SelectablePillGroup
				label="Preferred codecs"
				options={allCodecs}
				selected={codecs}
				disabled={!canWrite}
				title={!canWrite ? writeDisabledTooltip : undefined}
				onToggle={onToggleCodec}
			/>

			<Button
				type="submit"
				class="rounded-full px-5"
				disabled={!canWrite || !currentEtag}
				title={!canWrite ? writeDisabledTooltip : undefined}
			>
				Save TV defaults
			</Button>
		</form>
	</CardContent>
</Card>
