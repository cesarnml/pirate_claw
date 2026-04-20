<script lang="ts">
	interface Props {
		label: string;
		options: string[];
		selected: string[];
		disabled?: boolean;
		title?: string;
		onToggle: (value: string) => void;
	}

	let { label, options, selected, disabled = false, title, onToggle }: Props = $props();

	function pillClass(active: boolean): string {
		return active
			? 'border-primary bg-primary/12 text-primary'
			: 'border-border bg-card/60 text-muted-foreground hover:border-primary/25 hover:text-foreground';
	}
</script>

<div class="space-y-2">
	<p class="text-muted-foreground text-sm font-medium">{label}</p>
	<div class="flex flex-wrap gap-2" {title}>
		{#each options as option}
			<button
				type="button"
				aria-pressed={selected.includes(option)}
				class={`rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.16em] uppercase transition-colors ${pillClass(
					selected.includes(option)
				)}`}
				{disabled}
				onclick={() => onToggle(option)}
			>
				{option}
			</button>
		{/each}
	</div>
</div>
