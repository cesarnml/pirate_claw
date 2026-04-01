import type { ReconcileDownloader } from './transmission';
import type { Repository } from './repository';

export type ReconcileResult = {
  reconciled: number;
  queued: number;
  downloading: number;
  failed: number;
  unresolved: number;
};

export async function reconcileTrackedCandidates(input: {
  repository: Repository;
  downloader: ReconcileDownloader;
}): Promise<ReconcileResult> {
  const result = createEmptyResult();

  for (const candidate of input.repository.listTrackedCandidates()) {
    const lookup = await input.downloader.lookup({
      torrentId: candidate.transmissionTorrentId,
      torrentHash: candidate.transmissionTorrentHash,
    });

    if (!lookup.ok) {
      throw new Error(lookup.message);
    }

    if (!lookup.found) {
      result.unresolved += 1;
      continue;
    }

    input.repository.recordCandidateLifecycle({
      identityKey: candidate.identityKey,
      lifecycleState: lookup.lifecycle,
    });

    result.reconciled += 1;
    result[lookup.lifecycle] += 1;
  }

  return result;
}

function createEmptyResult(): ReconcileResult {
  return {
    reconciled: 0,
    queued: 0,
    downloading: 0,
    failed: 0,
    unresolved: 0,
  };
}
