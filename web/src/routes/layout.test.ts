import { render, screen, within } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { describe, expect, it, vi } from 'vitest';
import type { DaemonHealth, SessionInfo } from '$lib/types';
import Layout from './+layout.svelte';

vi.mock('$app/stores', () => ({
	page: writable({ url: new URL('http://localhost/') })
}));

vi.mock('$lib/components/ui/sonner', () => ({
	Toaster: vi.fn()
}));

vi.mock('$app/stores', () => ({
	page: {
		subscribe: vi.fn((cb: (val: { url: { pathname: string } }) => void) => {
			cb({ url: { pathname: '/' } });
			return () => {};
		})
	}
}));

const mockHealth: DaemonHealth = {
	uptime: 3661000,
	startedAt: '2024-01-01T00:00:00Z'
};

const mockSession: SessionInfo = {
	version: '3.00 (bb6b5a062ef)',
	downloadSpeed: 0,
	uploadSpeed: 0,
	activeTorrentCount: 0
};

describe('+layout.svelte', () => {
	it('renders the phase 19 shell nav and footer status strip', () => {
		render(Layout, {
			props: {
				children: (() => {}) as unknown as import('svelte').Snippet,
				data: {
					health: mockHealth,
					transmissionSession: mockSession,
					plexConfigured: true,
					setupState: 'ready' as const
				}
			}
		});

		const nav = screen.getByRole('navigation', { name: 'Main navigation' });
		const sidebar = nav.closest('aside');
		expect(nav).toBeInTheDocument();
		expect(sidebar).not.toBeNull();

		const labels = ['Dashboard', 'TV Shows', 'Movies', 'Config'] as const;
		const hrefs = ['/', '/shows', '/movies', '/config'] as const;
		const sidebarQueries = within(sidebar as HTMLElement);

		for (let i = 0; i < labels.length; i++) {
			const link = sidebarQueries.getByRole('link', { name: labels[i] });
			expect(link).toHaveAttribute('href', hrefs[i]);
		}

		// Footer renders in collapsed + expanded breakpoints; assert content without viewport coupling.
		expect(screen.getAllByText('Daemon').length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText('1h 1m 1s').length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText('Transmission').length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText('Connected').length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText('Plex').length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText('Configured').length).toBeGreaterThanOrEqual(1);
	});

	it('surfaces unavailable shell status when shared API data is missing', () => {
		render(Layout, {
			props: {
				children: (() => {}) as unknown as import('svelte').Snippet,
				data: {
					health: null,
					transmissionSession: null,
					plexConfigured: false,
					setupState: 'partially_configured' as const
				}
			}
		});

		const nav = screen.getByRole('navigation', { name: 'Main navigation' });
		const sidebar = nav.closest('aside');
		expect(sidebar).not.toBeNull();
		const sidebarQueries = within(sidebar as HTMLElement);

		expect(sidebarQueries.getAllByText('Unavailable').length).toBeGreaterThanOrEqual(2);
		expect(sidebarQueries.getByText('Transmission')).toBeInTheDocument();
	});

	it('renders starter-mode splash and hides children when setupState is starter', () => {
		render(Layout, {
			props: {
				children: (() => {}) as unknown as import('svelte').Snippet,
				data: {
					health: null,
					transmissionSession: null,
					plexConfigured: false,
					setupState: 'starter' as const
				}
			}
		});

		expect(screen.getByTestId('starter-mode-splash')).toBeInTheDocument();
		expect(screen.getByText('Pirate Claw is not yet configured')).toBeInTheDocument();
		expect(screen.queryByTestId('partial-config-banner')).not.toBeInTheDocument();
	});

	it('renders partial-config banner when setupState is partially_configured', () => {
		render(Layout, {
			props: {
				children: (() => {}) as unknown as import('svelte').Snippet,
				data: {
					health: mockHealth,
					transmissionSession: mockSession,
					plexConfigured: true,
					setupState: 'partially_configured' as const
				}
			}
		});

		expect(screen.getByTestId('partial-config-banner')).toBeInTheDocument();
		expect(screen.queryByTestId('starter-mode-splash')).not.toBeInTheDocument();
	});

	it('renders no setup indicator when setupState is ready', () => {
		render(Layout, {
			props: {
				children: (() => {}) as unknown as import('svelte').Snippet,
				data: {
					health: mockHealth,
					transmissionSession: mockSession,
					plexConfigured: true,
					setupState: 'ready' as const
				}
			}
		});

		expect(screen.queryByTestId('starter-mode-splash')).not.toBeInTheDocument();
		expect(screen.queryByTestId('partial-config-banner')).not.toBeInTheDocument();
	});
});
