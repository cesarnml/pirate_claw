<script lang="ts">
	import XIcon from '@lucide/svelte/icons/x';

	interface Props {
		onclick?: () => void;
		onclose?: () => void;
	}
	let { onclick, onclose }: Props = $props();
</script>

<div class="border-border flex items-center justify-between border-b px-4 py-5 md:px-3 lg:px-4">
	<a
		href="/"
		{onclick}
		class="focus-visible:ring-ring flex items-center gap-3 rounded-2xl focus-visible:ring-2 focus-visible:outline-none"
	>
		<img
			src="/pirate-claw-logo.png"
			alt=""
			width="44"
			height="44"
			class="h-11 w-11 rounded-2xl object-cover shadow-[0_12px_30px_rgba(5,10,21,0.35)]"
		/>
		<div class="min-w-0 md:hidden lg:block">
			<p class="text-primary font-mono text-sm font-semibold tracking-[0.24em] uppercase">
				Pirate Claw
			</p>
			<p class="text-muted-foreground mt-1 text-xs">Command & Control</p>
		</div>
	</a>
	{#if onclose}
		<button
			type="button"
			class="border-border bg-background text-foreground hover:text-primary inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border md:hidden"
			aria-label="Close navigation menu"
			onclick={onclose}
		>
			<XIcon class="h-5 w-5" />
		</button>
	{/if}
</div>
