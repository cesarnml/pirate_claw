<script lang="ts">
	interface Props {
		label: string;
		options: string[];
		value: string;
		disabled?: boolean;
		title?: string;
		onChange: (value: string) => void;
	}

	let { label, options, value, disabled = false, title, onChange }: Props = $props();
</script>

<div class="space-y-2">
	<p class="text-muted-foreground text-sm font-medium">{label}</p>
	<div class="grid grid-cols-2 gap-2" {title}>
		{#each options as option}
			<button
				type="button"
				aria-pressed={value === option}
				class={`rounded-2xl border px-4 py-3 text-sm font-semibold uppercase transition-colors ${
					value === option
						? 'border-primary bg-primary/12 text-primary'
						: 'border-border bg-background/50 text-muted-foreground hover:border-primary/25 hover:text-foreground'
				}`}
				{disabled}
				onclick={() => onChange(option)}
			>
				{option}
			</button>
		{/each}
	</div>
</div>
