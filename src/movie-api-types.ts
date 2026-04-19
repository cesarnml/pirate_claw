export type PlexStatus = 'in_library' | 'missing' | 'unknown';

/** TMDB fields exposed on movie API responses (dashboard + JSON). */
export type TmdbMoviePublic = {
  tmdbId?: number;
  title?: string;
  posterUrl?: string;
  backdropUrl?: string;
  overview?: string;
  voteAverage?: number;
  voteCount?: number;
};

export type MovieBreakdown = {
  normalizedTitle: string;
  year?: number;
  resolution?: string;
  codec?: string;
  identityKey: string;
  status: string;
  pirateClawDisposition?: 'removed' | 'deleted';
  queuedAt?: string;
  transmissionPercentDone?: number;
  transmissionStatusCode?: number;
  transmissionTorrentHash?: string;
  plexStatus: PlexStatus;
  watchCount: number | null;
  lastWatchedAt: string | null;
  tmdb?: TmdbMoviePublic;
};
