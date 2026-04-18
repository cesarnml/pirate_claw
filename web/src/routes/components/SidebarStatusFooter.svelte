<script lang="ts">
	interface Props {
		daemonUptime: string;
		daemonHealthy: boolean;
		transmissionConnected: boolean;
	}
	let { daemonUptime, daemonHealthy, transmissionConnected }: Props = $props();
</script>

<!-- collapsed sidebar: dots only with custom hover tooltip -->
<div class="border-border bg-card/55 mt-auto hidden border-t p-3 md:block lg:hidden">
	<div class="group relative rounded-2xl border border-white/8 bg-black/10 p-3 backdrop-blur-sm">
		<div class="flex flex-col items-center gap-3">
			<div
				class="h-2.5 w-2.5 shrink-0 rounded-full"
				class:bg-emerald-400={daemonHealthy}
				class:bg-rose-400={!daemonHealthy}
			></div>
			<div
				class="h-2.5 w-2.5 shrink-0 rounded-full"
				class:bg-emerald-400={transmissionConnected}
				class:bg-amber-400={!transmissionConnected}
			></div>
		</div>

		<!-- tooltip: appears on hover of the whole panel -->
		<div
			class="pointer-events-none absolute bottom-0 left-full ml-2 w-44 rounded-xl border border-white/20 bg-slate-950 p-3 opacity-0 shadow-xl transition-opacity delay-75 duration-200 group-hover:opacity-100"
		>
			<div class="flex items-center justify-between gap-2">
				<span class="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase"
					>Daemon</span
				>
				<div class="flex items-center gap-1.5">
					<span class="text-foreground text-xs">{daemonHealthy ? daemonUptime : 'Unavailable'}</span
					>
					<div
						class="h-2 w-2 shrink-0 rounded-full"
						class:bg-emerald-400={daemonHealthy}
						class:bg-rose-400={!daemonHealthy}
					></div>
				</div>
			</div>
			<div class="mt-2 flex items-center justify-between gap-2">
				<span class="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase"
					>Torrent</span
				>
				<div class="flex items-center gap-1.5">
					<span class="text-foreground text-xs"
						>{transmissionConnected ? 'Connected' : 'Unavailable'}</span
					>
					<div
						class="h-2 w-2 shrink-0 rounded-full"
						class:bg-emerald-400={transmissionConnected}
						class:bg-amber-400={!transmissionConnected}
					></div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- expanded sidebar: full card -->
<div class="border-border bg-card/55 mt-auto hidden border-t p-3 lg:block">
	<div class="rounded-2xl border border-white/8 bg-black/10 p-3 backdrop-blur-sm">
		<div class="flex items-center justify-between gap-3">
			<div class="min-w-0">
				<p class="text-muted-foreground text-[11px] font-semibold tracking-[0.22em] uppercase">
					Daemon
				</p>
				<p class="text-foreground mt-1 text-sm font-medium">
					{daemonUptime}
				</p>
			</div>
			<div
				class="h-2.5 w-2.5 shrink-0 rounded-full"
				class:bg-emerald-400={daemonHealthy}
				class:bg-rose-400={!daemonHealthy}
				title={daemonHealthy ? `Daemon · up ${daemonUptime}` : 'Daemon unavailable'}
			></div>
		</div>

		<div class="mt-3 flex items-center justify-between gap-3">
			<div class="min-w-0">
				<p class="text-muted-foreground text-[11px] font-semibold tracking-[0.22em] uppercase">
					Transmission
				</p>
				<p class="text-foreground mt-1 text-sm font-medium">
					{transmissionConnected ? 'Connected' : 'Unavailable'}
				</p>
			</div>
			<div
				class="h-2.5 w-2.5 shrink-0 rounded-full"
				class:bg-emerald-400={transmissionConnected}
				class:bg-amber-400={!transmissionConnected}
				title={transmissionConnected ? 'Transmission · connected' : 'Transmission unavailable'}
			></div>
		</div>
	</div>
</div>
