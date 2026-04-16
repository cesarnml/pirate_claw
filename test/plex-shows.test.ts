import { Database } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';

import { createApiFetch, createHealthState } from '../src/api';
import { PlexCache } from '../src/plex/cache';
import {
  enrichShowBreakdownsFromPlexCache,
  isPlexShowCacheExpired,
  refreshShowLibraryCache,
} from '../src/plex/shows';
import { ensurePlexSchema } from '../src/plex/schema';
import type { Repository } from '../src/repository';

function stubRepository(): Repository {
  return {
    startRun: () => ({ id: 1, startedAt: '', status: 'running' }),
    getRun: () => undefined,
    completeRun: () => ({ id: 1, startedAt: '', status: 'completed' }),
    failRun: () => ({ id: 1, startedAt: '', status: 'failed' }),
    recordFeedItem: () => ({}) as never,
    getCandidateState: () => undefined,
    isCandidateQueued: () => false,
    recordCandidateOutcome: () => ({}) as never,
    recordCandidateReconciliation: () => ({}) as never,
    recordFeedItemOutcome: () => ({}) as never,
    listFeedItemOutcomes: () => [],
    listRecentRunSummaries: () => [],
    listCandidateStates: () => [],
    listReconcilableCandidates: () => [],
    listRetryableCandidates: () => [],
    listSkippedNoMatchOutcomes: () => [],
  };
}

describe('plex show enrichment', () => {
  it('writes an in-library show cache row when Plex returns a strong match', async () => {
    const db = new Database(':memory:');
    ensurePlexSchema(db);
    const cache = new PlexCache(db);

    await refreshShowLibraryCache(
      [
        {
          normalizedTitle: 'Example Show',
          seasons: [],
          plexStatus: 'unknown',
          watchCount: null,
          lastWatchedAt: null,
        },
      ],
      {
        cache,
        client: {
          searchShows: async () => [
            {
              ratingKey: '456',
              title: 'Example Show',
              type: 'show',
              viewCount: 6,
              lastViewedAt: 1_712_793_600,
            },
          ],
        } as never,
        refreshIntervalMinutes: 30,
        log: () => {},
      },
    );

    expect(cache.getTv('Example Show')).toMatchObject({
      inLibrary: true,
      plexRatingKey: '456',
      watchCount: 6,
      lastWatchedAt: '2024-04-11T00:00:00.000Z',
    });
  });

  it('writes a missing show cache row when Plex returns no match', async () => {
    const db = new Database(':memory:');
    ensurePlexSchema(db);
    const cache = new PlexCache(db);

    await refreshShowLibraryCache(
      [
        {
          normalizedTitle: 'Missing Show',
          seasons: [],
          plexStatus: 'unknown',
          watchCount: null,
          lastWatchedAt: null,
        },
      ],
      {
        cache,
        client: {
          searchShows: async () => [],
        } as never,
        refreshIntervalMinutes: 30,
        log: () => {},
      },
    );

    expect(cache.getTv('Missing Show')).toMatchObject({
      inLibrary: false,
      watchCount: 0,
      lastWatchedAt: null,
    });
  });

  it('treats stale show cache rows as unknown on API enrichment', () => {
    const db = new Database(':memory:');
    ensurePlexSchema(db);
    const cache = new PlexCache(db);
    cache.upsertTv({
      normalizedTitle: 'Stale Show',
      plexRatingKey: '456',
      inLibrary: true,
      watchCount: 3,
      lastWatchedAt: '2026-04-01T00:00:00.000Z',
      cachedAt: '2026-04-01T00:00:00.000Z',
    });

    const shows = enrichShowBreakdownsFromPlexCache(
      [
        {
          normalizedTitle: 'Stale Show',
          seasons: [],
          plexStatus: 'unknown',
          watchCount: null,
          lastWatchedAt: null,
        },
      ],
      {
        cache,
        refreshIntervalMinutes: 30,
      },
    );

    expect(shows[0]).toMatchObject({
      plexStatus: 'unknown',
      watchCount: null,
      lastWatchedAt: null,
    });
    expect(isPlexShowCacheExpired('2026-04-01T00:00:00.000Z', 30)).toBe(true);
  });

  it('surfaces Plex cache fields in GET /api/shows', async () => {
    const db = new Database(':memory:');
    ensurePlexSchema(db);
    const cache = new PlexCache(db);
    cache.upsertTv({
      normalizedTitle: 'Example Show',
      plexRatingKey: '456',
      inLibrary: true,
      watchCount: 5,
      lastWatchedAt: '2026-04-15T00:00:00.000Z',
      cachedAt: new Date().toISOString(),
    });

    const handler = createApiFetch({
      repository: {
        ...stubRepository(),
        listCandidateStates: () =>
          [
            {
              identityKey: 'tv:example show|1|1',
              mediaType: 'tv',
              status: 'queued',
              ruleName: 'Example Show',
              score: 100,
              reasons: ['matched'],
              rawTitle: 'Example.Show.S01E01.1080p',
              normalizedTitle: 'Example Show',
              season: 1,
              episode: 1,
              feedName: 'TV Feed',
              guidOrLink: 'https://example.test/show',
              publishedAt: '2026-01-01T00:00:00Z',
              downloadUrl: 'https://example.test/show.torrent',
              firstSeenRunId: 1,
              lastSeenRunId: 1,
              updatedAt: '2026-01-01T00:00:00Z',
            },
          ] as never,
      },
      health: createHealthState(),
      config: {
        feeds: [],
        tv: [],
        movies: {
          years: [2024],
          resolutions: ['1080p'],
          codecs: ['x265'],
          codecPolicy: 'prefer',
        },
        transmission: {
          url: 'http://localhost:9091/transmission/rpc',
          username: 'user',
          password: 'pass',
        },
        runtime: {
          runIntervalMinutes: 30,
          reconcileIntervalMinutes: 1,
          artifactDir: '.pirate-claw/runtime',
          artifactRetentionDays: 7,
        },
      },
      configPath: '/nonexistent/pirate-claw.config.json',
      pollStatePath: '/nonexistent/poll-state.json',
      loadPollState: () => ({ feeds: {} }),
      plexShows: {
        cache,
        client: {} as never,
        refreshIntervalMinutes: 30,
        log: () => {},
      },
    });

    const response = await handler(new Request('http://localhost/api/shows'));
    const body = await response.json();

    expect(body.shows[0]).toMatchObject({
      plexStatus: 'in_library',
      watchCount: 5,
      lastWatchedAt: '2026-04-15T00:00:00.000Z',
    });
  });
});
