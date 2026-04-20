<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	interface Props {
		open: boolean;
		name?: string;
		onCancel: () => void;
		onConfirm: () => void;
	}

	const { open, name, onCancel, onConfirm }: Props = $props();
</script>

{#if open}
	<div class="fixed inset-0 z-[120] flex items-center justify-center p-4">
		<button
			type="button"
			class="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
			aria-label="Close delete confirmation"
			onclick={onCancel}
		></button>
		<div
			class="bg-card border-border relative z-[121] w-full max-w-md rounded-2xl border p-5 shadow-2xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="delete-show-title"
		>
			<h3 id="delete-show-title" class="text-lg font-semibold">Delete TV show?</h3>
			<p class="text-muted-foreground mt-2 text-sm">
				This removes <span class="text-foreground font-medium">{name}</span> from the active watchlist.
			</p>
			<div class="mt-5 flex items-center justify-end gap-3">
				<Button type="button" variant="outline" class="rounded-full px-5" onclick={onCancel}>
					Cancel
				</Button>
				<Button type="button" class="rounded-full px-5" onclick={onConfirm}>Delete show</Button>
			</div>
		</div>
	</div>
{/if}
