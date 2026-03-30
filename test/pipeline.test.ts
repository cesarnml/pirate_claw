import type { Database } from 'bun:sqlite';
import { afterEach, describe, expect, it } from 'bun:test';
import { mkdtemp as createTempDir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { AppConfig } from '../src/config';
import { FeedError } from '../src/feed';
import { runPipeline } from '../src/pipeline';
import {
  createRepository,
  ensureSchema,
  openDatabase,
} from '../src/repository';

const tempDirs: string[] = [];
const openDatabases: Database[] = [];

describe('runPipeline', () => {
  afterEach(async () => {
    while (openDatabases.length > 0) {
      openDatabases.pop()?.close();
    }

    while (tempDirs.length > 0) {
      const directory = tempDirs.pop();

      if (directory) {
        await Bun.$`rm -rf ${directory}`;
      }
    }
  });

  it('marks a run as failed when feed fetching throws', async () => {
    const repository = createTestRepository(await createDatabasePath());

    await expect(
      runPipeline({
        config: createConfig(),
        repository,
        downloader: {
          submit: async () => ({
            ok: true as const,
            status: 'queued' as const,
          }),
        },
        fetchFeed: async () => {
          throw new FeedError('boom');
        },
      }),
    ).rejects.toThrow(new FeedError('boom'));

    expect(repository.getRun(1)).toMatchObject({
      id: 1,
      status: 'failed',
      completedAt: expect.any(String),
    });
  });
});

function createTestRepository(path: string) {
  const database = openDatabase(path);

  openDatabases.push(database);
  ensureSchema(database);
  return createRepository(database);
}

async function createDatabasePath(): Promise<string> {
  const directory = await createTempDir(join(tmpdir(), 'media-sync-pipeline-'));

  tempDirs.push(directory);
  return join(directory, 'media-sync.db');
}

function createConfig(): AppConfig {
  return {
    feeds: [
      {
        name: 'TV Feed',
        url: 'https://example.test/tv.rss',
        mediaType: 'tv',
      },
    ],
    tv: [
      {
        name: 'Example Show',
        resolutions: ['1080p'],
        codecs: ['x265'],
      },
    ],
    movies: {
      years: [2024],
      resolutions: ['1080p'],
      codecs: ['x265'],
    },
    transmission: {
      url: 'http://localhost:9091/transmission/rpc',
      username: 'user',
      password: 'pass',
    },
  };
}
