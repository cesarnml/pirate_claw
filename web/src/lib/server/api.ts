import { env } from '$env/dynamic/private';

export function buildApiUrl(path: string): string {
	const baseUrl = (env.PIRATE_CLAW_API_URL ?? '').replace(/\/$/, '');
	if (!baseUrl) {
		throw new Error('PIRATE_CLAW_API_URL is required but not set');
	}
	return `${baseUrl}${path}`;
}

export async function apiRequest(
	path: string,
	init?: Parameters<typeof fetch>[1]
): Promise<Response> {
	return fetch(buildApiUrl(path), init);
}

export async function apiFetch<T>(path: string): Promise<T> {
	const url = buildApiUrl(path);
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`API request failed: ${res.status} ${res.statusText} — ${url}`);
	}
	return res.json() as Promise<T>;
}
