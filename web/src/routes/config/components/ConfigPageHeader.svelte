<script lang="ts">
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import type { OnboardingStatus } from '$lib/types';

	interface Props {
		canWrite: boolean;
		onboarding?: OnboardingStatus | null;
	}

	const { canWrite, onboarding }: Props = $props();
</script>

<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
	<div class="space-y-3">
		<p class="text-primary font-mono text-xs font-semibold tracking-[0.28em] uppercase">
			System Configuration
		</p>
		<div class="space-y-2">
			<h1 class="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-balance">Config</h1>
			<p class="text-muted-foreground max-w-3xl text-sm leading-6">
				Reconfigure ingestion, transfer rules, and acquisition policy without leaving the command
				deck.
			</p>
		</div>
	</div>

	<div
		class={`inline-flex items-center rounded-full border px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.18em] uppercase ${
			canWrite
				? 'border-primary/35 bg-primary/16 text-primary'
				: 'border-white/8 bg-white/6 text-slate-300'
		}`}
	>
		Write Access: {canWrite ? 'Active' : 'Restricted'}
	</div>
</div>

{#if onboarding && onboarding.state !== 'ready'}
	<Alert>
		<AlertTitle>
			{onboarding.state === 'partial_setup' ? 'Resume onboarding' : 'Start onboarding'}
		</AlertTitle>
		<AlertDescription class="flex flex-wrap items-center gap-3">
			<span>
				{#if onboarding.state === 'writes_disabled'}
					Config writes are disabled, so guided onboarding is unavailable until write access is
					enabled.
				{:else if onboarding.state === 'partial_setup'}
					Your setup is still incomplete. Resume onboarding or keep editing the config directly
					here.
				{:else}
					If you want the guided setup path, start onboarding here instead of editing JSON by hand.
				{/if}
			</span>
			{#if onboarding.state !== 'writes_disabled'}
				<a href="/onboarding" class="text-primary text-sm font-medium hover:underline">
					{onboarding.state === 'partial_setup' ? 'Resume onboarding' : 'Start onboarding'}
				</a>
			{/if}
		</AlertDescription>
	</Alert>
{/if}
