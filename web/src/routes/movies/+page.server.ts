import { apiFetch } from '$lib/server/api';
import type { MovieBreakdown, TorrentStatSnapshot } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [moviesResult, torrentsResult] = await Promise.allSettled([
		apiFetch<{ movies: MovieBreakdown[] }>('/api/movies'),
		apiFetch<{ torrents: TorrentStatSnapshot[] }>('/api/transmission/torrents')
	]);

	if (moviesResult.status === 'rejected') {
		console.error('[movies] failed to load /api/movies:', moviesResult.reason);
		return { movies: [] as MovieBreakdown[], torrents: null, error: 'Could not reach the API.' };
	}

	if (torrentsResult.status === 'rejected') {
		console.error('[movies] failed to load /api/transmission/torrents:', torrentsResult.reason);
	}

	return {
		movies: moviesResult.value.movies,
		torrents: torrentsResult.status === 'fulfilled' ? torrentsResult.value.torrents : null,
		error: null
	};
};
