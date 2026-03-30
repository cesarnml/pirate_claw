import type { FeedConfig } from './config';

export type NormalizedFeedItem = {
  mediaType: FeedConfig['mediaType'];
  rawTitle: string;
  normalizedTitle: string;
  season?: number;
  episode?: number;
  year?: number;
  resolution?: string;
  codec?: 'x264' | 'x265';
};

export function normalizeFeedItem(input: {
  mediaType: FeedConfig['mediaType'];
  rawTitle: string;
}): NormalizedFeedItem {
  const seasonEpisode =
    input.mediaType === 'tv' ? extractSeasonEpisode(input.rawTitle) : undefined;
  const year = extractYear(input.rawTitle);
  const resolution = extractResolution(input.rawTitle);
  const codec = extractCodec(input.rawTitle);
  const normalizedTitle =
    input.mediaType === 'tv'
      ? extractNormalizedTitle(input.rawTitle, seasonEpisode?.index)
      : extractNormalizedTitle(input.rawTitle, year?.index);

  return {
    mediaType: input.mediaType,
    rawTitle: input.rawTitle,
    normalizedTitle,
    season: seasonEpisode?.season,
    episode: seasonEpisode?.episode,
    year: year?.value,
    resolution,
    codec,
  };
}

function extractSeasonEpisode(
  value: string,
): { season: number; episode: number; index: number } | undefined {
  const match = tvEpisodePattern.exec(value);

  if (!match) {
    return undefined;
  }

  const season = Number(match.groups?.season ?? match.groups?.seasonAlt);
  const episode = Number(match.groups?.episode ?? match.groups?.episodeAlt);

  if (Number.isNaN(season) || Number.isNaN(episode)) {
    return undefined;
  }

  return {
    season,
    episode,
    index: match.index,
  };
}

function extractYear(
  value: string,
): { value: number; index: number } | undefined {
  const match = yearPattern.exec(value);

  if (!match) {
    return undefined;
  }

  return {
    value: Number(match[0]),
    index: match.index,
  };
}

function extractResolution(value: string): string | undefined {
  const match = resolutionPattern.exec(value);
  return match?.[1]?.toLowerCase();
}

function extractCodec(value: string): 'x264' | 'x265' | undefined {
  const match = codecPattern.exec(value);

  if (!match) {
    return undefined;
  }

  return x265CodecTokens.has(match[1].toLowerCase()) ? 'x265' : 'x264';
}

function extractNormalizedTitle(value: string, cutoff?: number): string {
  const titleSegment = cutoff === undefined ? value : value.slice(0, cutoff);

  return normalizeTitleWhitespace(titleSegment);
}

function normalizeTitleWhitespace(value: string): string {
  return value
    .replace(separatorPattern, ' ')
    .replace(extraSymbolPattern, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const tvEpisodePattern =
  /\b(?:s(?<season>\d{1,2})e(?<episode>\d{1,2})|(?<seasonAlt>\d{1,2})x(?<episodeAlt>\d{1,2}))\b/i;

const yearPattern = /\b(?:19|20)\d{2}\b/;

const resolutionPattern = /\b(2160p|1080p|720p|480p)\b/i;

const codecPattern = /\b(x265|h265|hevc|x264|h264|avc)\b/i;

const separatorPattern = /[._-]+/g;

const extraSymbolPattern = /[()[\]{}]+/g;

const x265CodecTokens = new Set(['x265', 'h265', 'hevc']);
