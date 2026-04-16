/**
 * Phase 18 foundation ticket: reserve the daemon hook and prove scheduling
 * works without introducing Plex matching behavior yet.
 */
export async function runPlexBackgroundRefresh(input: {
  log: (message: string) => void;
}): Promise<void> {
  input.log('[plex] background refresh noop');
}
