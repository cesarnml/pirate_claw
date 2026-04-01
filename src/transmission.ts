import type { TransmissionConfig } from './config';

export type SubmitDownloadInput = {
  downloadUrl: string;
};

export type SubmissionSuccess = {
  ok: true;
  status: 'queued';
  torrentId?: number;
  torrentName?: string;
  torrentHash?: string;
};

export type TorrentLifecycle = 'queued' | 'downloading' | 'failed';

export type LookupTorrentInput = {
  torrentId?: number;
  torrentHash?: string;
};

export type LookupTorrentSuccess =
  | {
      ok: true;
      found: true;
      lifecycle: TorrentLifecycle;
      torrentId?: number;
      torrentName?: string;
      torrentHash?: string;
    }
  | {
      ok: true;
      found: false;
    };

export type SubmissionFailureCode =
  | 'network_error'
  | 'session_error'
  | 'http_error'
  | 'invalid_response'
  | 'rpc_error';

export type SubmissionFailure = {
  ok: false;
  code: SubmissionFailureCode;
  message: string;
};

export type SubmissionResult = SubmissionSuccess | SubmissionFailure;
export type LookupTorrentResult = LookupTorrentSuccess | SubmissionFailure;

export type Downloader = {
  submit(input: SubmitDownloadInput): Promise<SubmissionResult>;
};

export type ReconcileDownloader = {
  lookup(input: LookupTorrentInput): Promise<LookupTorrentResult>;
};

export function createTransmissionDownloader(
  config: TransmissionConfig,
): Downloader & ReconcileDownloader {
  return {
    submit(input) {
      return submitToTransmission(config, input);
    },
    lookup(input) {
      return lookupTorrentInTransmission(config, input);
    },
  };
}

async function submitToTransmission(
  config: TransmissionConfig,
  input: SubmitDownloadInput,
): Promise<SubmissionResult> {
  const firstResponse = await sendRpcRequest(
    config,
    buildRequestBody(config, input),
  );

  if (!firstResponse.ok) {
    return firstResponse.error;
  }

  let response = firstResponse.response;

  if (response.status === 409) {
    const sessionId = response.headers.get('x-transmission-session-id');

    if (!sessionId) {
      return {
        ok: false,
        code: 'session_error',
        message:
          'Transmission session negotiation failed: missing X-Transmission-Session-Id header.',
      };
    }

    const retryResponse = await sendRpcRequest(
      config,
      buildRequestBody(config, input),
      sessionId,
    );

    if (!retryResponse.ok) {
      return retryResponse.error;
    }

    response = retryResponse.response;
  }

  if (!response.ok) {
    return {
      ok: false,
      code: 'http_error',
      message: `Transmission RPC request failed with HTTP ${response.status}.`,
    };
  }

  let parsed: unknown;

  try {
    parsed = await response.json();
  } catch {
    return {
      ok: false,
      code: 'invalid_response',
      message: 'Transmission RPC response was not valid JSON.',
    };
  }

  return parseSubmissionResult(parsed);
}

async function sendRpcRequest(
  config: TransmissionConfig,
  requestBody: RequestBody,
  sessionId?: string,
): Promise<
  | {
      ok: true;
      response: Response;
    }
  | {
      ok: false;
      error: SubmissionFailure;
    }
> {
  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: buildHeaders(config, sessionId),
      body: JSON.stringify(requestBody),
    });

    return {
      ok: true,
      response,
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        ok: false,
        code: 'network_error',
        message: `Transmission RPC request failed: ${formatErrorMessage(error)}.`,
      },
    };
  }
}

function buildHeaders(
  config: TransmissionConfig,
  sessionId?: string,
): HeadersInit {
  const headers: Record<string, string> = {
    authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
    'content-type': 'application/json',
  };

  if (sessionId) {
    headers['x-transmission-session-id'] = sessionId;
  }

  return headers;
}

function buildRequestBody(
  config: TransmissionConfig,
  input: SubmitDownloadInput,
): TorrentAddRequestBody {
  return {
    method: 'torrent-add',
    arguments: {
      filename: input.downloadUrl,
      ...(config.downloadDir ? { 'download-dir': config.downloadDir } : {}),
    },
  };
}

function buildLookupRequestBody(
  input: LookupTorrentInput,
): TorrentGetRequestBody {
  return {
    method: 'torrent-get',
    arguments: {
      ids: [input.torrentHash ?? input.torrentId].filter(
        (value): value is number | string => value !== undefined,
      ),
      fields: ['id', 'name', 'hashString', 'status', 'percentDone', 'error'],
    },
  };
}

function parseSubmissionResult(parsed: unknown): SubmissionResult {
  if (!isTransmissionResponse(parsed)) {
    return {
      ok: false,
      code: 'invalid_response',
      message: 'Transmission RPC response was missing required fields.',
    };
  }

  if (parsed.result !== 'success') {
    return {
      ok: false,
      code: 'rpc_error',
      message: `Transmission rejected torrent submission: ${parsed.result}.`,
    };
  }

  const addedTorrent = parsed.arguments['torrent-added'];
  const duplicateTorrent = parsed.arguments['torrent-duplicate'];
  const torrent = addedTorrent ?? duplicateTorrent;

  if (!torrent || typeof torrent !== 'object') {
    return {
      ok: false,
      code: 'invalid_response',
      message: 'Transmission RPC success response was missing torrent details.',
    };
  }

  return {
    ok: true,
    status: 'queued',
    torrentId: typeof torrent?.id === 'number' ? torrent.id : undefined,
    torrentName: typeof torrent?.name === 'string' ? torrent.name : undefined,
    torrentHash:
      typeof torrent?.hashString === 'string' ? torrent.hashString : undefined,
  };
}

async function lookupTorrentInTransmission(
  config: TransmissionConfig,
  input: LookupTorrentInput,
): Promise<LookupTorrentResult> {
  if (input.torrentHash === undefined && input.torrentId === undefined) {
    return {
      ok: true,
      found: false,
    };
  }

  const firstResponse = await sendRpcRequest(
    config,
    buildLookupRequestBody(input),
  );

  if (!firstResponse.ok) {
    return firstResponse.error;
  }

  let response = firstResponse.response;

  if (response.status === 409) {
    const sessionId = response.headers.get('x-transmission-session-id');

    if (!sessionId) {
      return {
        ok: false,
        code: 'session_error',
        message:
          'Transmission session negotiation failed: missing X-Transmission-Session-Id header.',
      };
    }

    const retryResponse = await sendRpcRequest(
      config,
      buildLookupRequestBody(input),
      sessionId,
    );

    if (!retryResponse.ok) {
      return retryResponse.error;
    }

    response = retryResponse.response;
  }

  if (!response.ok) {
    return {
      ok: false,
      code: 'http_error',
      message: `Transmission RPC request failed with HTTP ${response.status}.`,
    };
  }

  let parsed: unknown;

  try {
    parsed = await response.json();
  } catch {
    return {
      ok: false,
      code: 'invalid_response',
      message: 'Transmission RPC response was not valid JSON.',
    };
  }

  return parseLookupResult(parsed);
}

function parseLookupResult(parsed: unknown): LookupTorrentResult {
  if (!isTransmissionResponse(parsed)) {
    return {
      ok: false,
      code: 'invalid_response',
      message: 'Transmission RPC response was missing required fields.',
    };
  }

  if (parsed.result !== 'success') {
    return {
      ok: false,
      code: 'rpc_error',
      message: `Transmission rejected torrent lookup: ${parsed.result}.`,
    };
  }

  const torrents = parsed.arguments.torrents;

  if (!Array.isArray(torrents)) {
    return {
      ok: false,
      code: 'invalid_response',
      message: 'Transmission RPC success response was missing torrent list.',
    };
  }

  const torrent = torrents[0];

  if (!torrent || typeof torrent !== 'object') {
    return {
      ok: true,
      found: false,
    };
  }

  return {
    ok: true,
    found: true,
    lifecycle: mapTorrentLifecycle(torrent),
    torrentId: typeof torrent.id === 'number' ? torrent.id : undefined,
    torrentName: typeof torrent.name === 'string' ? torrent.name : undefined,
    torrentHash:
      typeof torrent.hashString === 'string' ? torrent.hashString : undefined,
  };
}

function isTransmissionResponse(value: unknown): value is TransmissionResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (!('result' in value) || typeof value.result !== 'string') {
    return false;
  }

  if (
    !('arguments' in value) ||
    !value.arguments ||
    typeof value.arguments !== 'object'
  ) {
    return false;
  }

  return true;
}

function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

type TransmissionTorrent = {
  id?: number;
  name?: string;
  hashString?: string;
  status?: number;
  percentDone?: number;
  error?: number;
};

type TransmissionResponse = {
  result: string;
  arguments: {
    'torrent-added'?: TransmissionTorrent;
    'torrent-duplicate'?: TransmissionTorrent;
    torrents?: TransmissionTorrent[];
  };
};

type TorrentAddRequestBody = {
  method: 'torrent-add';
  arguments: {
    filename: string;
    'download-dir'?: string;
  };
};

type TorrentGetRequestBody = {
  method: 'torrent-get';
  arguments: {
    ids: Array<number | string>;
    fields: string[];
  };
};

type RequestBody = TorrentAddRequestBody | TorrentGetRequestBody;

function mapTorrentLifecycle(torrent: TransmissionTorrent): TorrentLifecycle {
  if (typeof torrent.error === 'number' && torrent.error !== 0) {
    return 'failed';
  }

  if (
    torrent.status === 3 ||
    torrent.status === 4 ||
    (typeof torrent.percentDone === 'number' && torrent.percentDone > 0)
  ) {
    return 'downloading';
  }

  return 'queued';
}
