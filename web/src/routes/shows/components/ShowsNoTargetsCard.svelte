<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
</script>

<Card class="bg-card/75 rounded-[30px] border-white/10">
	<CardContent class="space-y-4 pt-8">
		<div class="space-y-2">
			<p class="text-lg font-semibold">No tracked shows yet.</p>
			<p class="text-muted-foreground max-w-xl text-sm leading-6">
				Add a TV target in Config and the library grid will populate with poster art, progress, and
				inline season state.
			</p>
		</div>
		<Button href="/config#tv-shows" class="w-fit rounded-full px-5">Go to TV shows in Config</Button
		>
	</CardContent>
</Card>
