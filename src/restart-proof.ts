import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

type RestartProofRecord =
  | {
      version: 1;
      state: 'requested';
      requestId: string;
      requestedAt: string;
      requestedByStartedAt: string;
    }
  | {
      version: 1;
      state: 'back_online';
      requestId: string;
      requestedAt: string;
      requestedByStartedAt: string;
      returnedAt: string;
      returnedStartedAt: string;
    };

export type RestartStatus =
  | {
      state: 'idle';
      currentDaemonStartedAt: string;
    }
  | {
      state: 'requested';
      requestId: string;
      requestedAt: string;
      requestedByStartedAt: string;
      currentDaemonStartedAt: string;
    }
  | {
      state: 'back_online';
      requestId: string;
      requestedAt: string;
      requestedByStartedAt: string;
      returnedAt: string;
      returnedStartedAt: string;
      currentDaemonStartedAt: string;
    };

function restartProofPath(artifactDir: string): string {
  return join(artifactDir, 'restart-proof.json');
}

async function readRestartProofRecord(
  artifactDir: string,
): Promise<RestartProofRecord | null> {
  try {
    const raw = await readFile(restartProofPath(artifactDir), 'utf8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (
      parsed.version !== 1 ||
      (parsed.state !== 'requested' && parsed.state !== 'back_online') ||
      typeof parsed.requestId !== 'string' ||
      typeof parsed.requestedAt !== 'string' ||
      typeof parsed.requestedByStartedAt !== 'string'
    ) {
      return null;
    }

    if (parsed.state === 'requested') {
      return {
        version: 1,
        state: 'requested',
        requestId: parsed.requestId,
        requestedAt: parsed.requestedAt,
        requestedByStartedAt: parsed.requestedByStartedAt,
      };
    }

    if (
      typeof parsed.returnedAt !== 'string' ||
      typeof parsed.returnedStartedAt !== 'string'
    ) {
      return null;
    }

    return {
      version: 1,
      state: 'back_online',
      requestId: parsed.requestId,
      requestedAt: parsed.requestedAt,
      requestedByStartedAt: parsed.requestedByStartedAt,
      returnedAt: parsed.returnedAt,
      returnedStartedAt: parsed.returnedStartedAt,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function writeRestartProofRecord(
  artifactDir: string,
  record: RestartProofRecord,
): Promise<void> {
  await mkdir(artifactDir, { recursive: true });
  await writeFile(
    restartProofPath(artifactDir),
    `${JSON.stringify(record, null, 2)}\n`,
    'utf8',
  );
}

export async function recordRestartRequested(
  artifactDir: string,
  currentDaemonStartedAt: string,
): Promise<RestartStatus> {
  const record: RestartProofRecord = {
    version: 1,
    state: 'requested',
    requestId: randomUUID(),
    requestedAt: new Date().toISOString(),
    requestedByStartedAt: currentDaemonStartedAt,
  };
  await writeRestartProofRecord(artifactDir, record);
  return {
    state: 'requested',
    requestId: record.requestId,
    requestedAt: record.requestedAt,
    requestedByStartedAt: record.requestedByStartedAt,
    currentDaemonStartedAt,
  };
}

export async function readRestartStatus(
  artifactDir: string,
  currentDaemonStartedAt: string,
): Promise<RestartStatus> {
  const record = await readRestartProofRecord(artifactDir);
  if (!record) {
    return {
      state: 'idle',
      currentDaemonStartedAt,
    };
  }

  if (record.state === 'back_online') {
    return {
      state: 'back_online',
      requestId: record.requestId,
      requestedAt: record.requestedAt,
      requestedByStartedAt: record.requestedByStartedAt,
      returnedAt: record.returnedAt,
      returnedStartedAt: record.returnedStartedAt,
      currentDaemonStartedAt,
    };
  }

  if (record.requestedByStartedAt === currentDaemonStartedAt) {
    return {
      state: 'requested',
      requestId: record.requestId,
      requestedAt: record.requestedAt,
      requestedByStartedAt: record.requestedByStartedAt,
      currentDaemonStartedAt,
    };
  }

  const resolvedRecord: RestartProofRecord = {
    version: 1,
    state: 'back_online',
    requestId: record.requestId,
    requestedAt: record.requestedAt,
    requestedByStartedAt: record.requestedByStartedAt,
    returnedAt: new Date().toISOString(),
    returnedStartedAt: currentDaemonStartedAt,
  };
  await writeRestartProofRecord(artifactDir, resolvedRecord);
  return {
    state: 'back_online',
    requestId: resolvedRecord.requestId,
    requestedAt: resolvedRecord.requestedAt,
    requestedByStartedAt: resolvedRecord.requestedByStartedAt,
    returnedAt: resolvedRecord.returnedAt,
    returnedStartedAt: resolvedRecord.returnedStartedAt,
    currentDaemonStartedAt,
  };
}
