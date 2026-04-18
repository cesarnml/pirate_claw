<script lang="ts">
	import type { Component } from 'svelte';
	import { page } from '$app/stores';

	export interface NavLink {
		href: string;
		label: string;
		icon: Component;
	}

	interface Props {
		nav: NavLink[];
		onclick?: () => void;
	}
	let { nav, onclick }: Props = $props();

	function isActive(href: string): boolean {
		return $page.url.pathname === href;
	}
</script>

<nav class="flex-1 px-3 py-4" aria-label="Main navigation">
	<ul class="flex flex-col space-y-2">
		{#each nav as link}
			<li class="flex md:justify-center lg:justify-start">
				<a
					href={link.href}
					{onclick}
					class="focus-visible:ring-ring flex flex-1 items-center gap-3 rounded-2xl px-3 py-3 transition-colors focus-visible:ring-2 focus-visible:outline-none {isActive(
						link.href
					)
						? 'text-primary'
						: 'text-muted-foreground hover:text-foreground hover:bg-primary/30'}"
				>
					<link.icon class="h-5 w-5 shrink-0" />
					<span class="text-sm font-medium md:sr-only lg:not-sr-only">{link.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
