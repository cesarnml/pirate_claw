import type { Database } from 'bun:sqlite';

export function ensurePlexSchema(database: Database): void {
  database.transaction(() => {
    database.run(`
      CREATE TABLE IF NOT EXISTS plex_movie_cache (
        title TEXT NOT NULL,
        year INTEGER NOT NULL,
        plex_rating_key TEXT,
        in_library INTEGER NOT NULL DEFAULT 0,
        watch_count INTEGER,
        last_watched_at TEXT,
        cached_at TEXT NOT NULL,
        PRIMARY KEY (title, year)
      );
    `);
    database.run(`
      CREATE TABLE IF NOT EXISTS plex_tv_cache (
        normalized_title TEXT PRIMARY KEY NOT NULL,
        plex_rating_key TEXT,
        in_library INTEGER NOT NULL DEFAULT 0,
        watch_count INTEGER,
        last_watched_at TEXT,
        cached_at TEXT NOT NULL
      );
    `);
  })();
}
