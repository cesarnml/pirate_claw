import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

export type CycleResult = {
  type: string;
  status: 'completed' | 'failed' | 'skipped';
  startedAt: string;
  completedAt: string;
  durationMs: number;
  skipReason?: string;
  error?: string;
};

export function writeCycleArtifact(
  artifactDir: string,
  result: CycleResult,
): void {
  const cyclesDir = join(artifactDir, 'cycles');

  if (!existsSync(cyclesDir)) {
    mkdirSync(cyclesDir, { recursive: true });
  }

  const stem = `${artifactTimestamp(result.startedAt)}-${result.type}`;

  writeFileSync(
    join(cyclesDir, `${stem}.json`),
    JSON.stringify(result, null, 2) + '\n',
  );

  writeFileSync(join(cyclesDir, `${stem}.md`), formatCycleMarkdown(result));
}

export function pruneArtifacts(
  artifactDir: string,
  retentionDays: number,
  now?: number,
): void {
  const cyclesDir = join(artifactDir, 'cycles');

  if (!existsSync(cyclesDir)) {
    return;
  }

  const cutoffMs = (now ?? Date.now()) - retentionDays * 24 * 60 * 60 * 1000;
  const files = readdirSync(cyclesDir);

  for (const file of files) {
    const filePath = join(cyclesDir, file);
    const stat = statSync(filePath);

    if (stat.mtimeMs < cutoffMs) {
      unlinkSync(filePath);
    }
  }
}

export function formatCycleMarkdown(result: CycleResult): string {
  const lines: string[] = [
    `# ${result.type} cycle — ${result.startedAt}`,
    '',
    `- **Status**: ${result.status}`,
  ];

  if (result.status === 'skipped' && result.skipReason) {
    lines.push(`- **Reason**: ${result.skipReason}`);
  }

  if (result.error) {
    lines.push(`- **Error**: ${result.error}`);
  }

  if (result.status !== 'skipped') {
    lines.push(`- **Duration**: ${result.durationMs}ms`);
    lines.push(`- **Started**: ${result.startedAt}`);
    lines.push(`- **Completed**: ${result.completedAt}`);
  }

  lines.push('');

  return lines.join('\n');
}

function artifactTimestamp(isoString: string): string {
  return isoString.replace(/:/g, '-').replace('.', '-');
}
