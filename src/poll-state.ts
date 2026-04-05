import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

import type { FeedConfig, RuntimeConfig } from './config';

export type FeedPollRecord = {
  lastPolledAt: string;
};

export type PollState = {
  feeds: Record<string, FeedPollRecord>;
};

export function loadPollState(path: string): PollState {
  if (!existsSync(path)) {
    return { feeds: {} };
  }

  try {
    const raw = readFileSync(path, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;

    const feeds = (parsed as Record<string, unknown>)?.feeds;

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof feeds === 'object' &&
      feeds !== null &&
      !Array.isArray(feeds)
    ) {
      return parsed as PollState;
    }

    return { feeds: {} };
  } catch {
    return { feeds: {} };
  }
}

export function savePollState(path: string, state: PollState): void {
  const dir = dirname(path);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const tmpPath = join(dir, `.poll-state.${process.pid}.tmp`);
  writeFileSync(tmpPath, JSON.stringify(state, null, 2) + '\n');
  renameSync(tmpPath, path);
}

export function isDueFeed(
  feed: FeedConfig,
  state: PollState,
  runtime: RuntimeConfig,
  now: number,
): boolean {
  const record = state.feeds[feed.name];

  if (!record) {
    return true;
  }

  const intervalMs =
    (feed.pollIntervalMinutes ?? runtime.runIntervalMinutes) * 60 * 1000;
  const lastPolled = Date.parse(record.lastPolledAt);

  if (Number.isNaN(lastPolled)) {
    return true;
  }

  return now - lastPolled >= intervalMs;
}

export function filterDueFeeds(
  feeds: FeedConfig[],
  state: PollState,
  runtime: RuntimeConfig,
  now: number,
): FeedConfig[] {
  return feeds.filter((feed) => isDueFeed(feed, state, runtime, now));
}

export function recordFeedPolled(
  state: PollState,
  feedName: string,
  polledAt: string,
): PollState {
  return {
    ...state,
    feeds: {
      ...state.feeds,
      [feedName]: { lastPolledAt: polledAt },
    },
  };
}
