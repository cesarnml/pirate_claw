import { describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import type { DeliveryState } from '../types';
import { materializeTicketContext } from '../ticket-flow';

async function writeFixture(path: string, content: string) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, 'utf8');
}

describe('ticket-flow', () => {
  it('materializes first-ticket continuation artifacts into the target worktree', async () => {
    const sourceDir = await mkdtemp(join(tmpdir(), 'orchestrator-source-'));
    const targetDir = await mkdtemp(join(tmpdir(), 'orchestrator-target-'));

    try {
      await writeFixture(
        join(sourceDir, '.agents/delivery/phase-03/handoffs/p3-01-handoff.md'),
        '# Ticket Handoff\n',
      );

      const state: DeliveryState = {
        planKey: 'phase-03',
        planPath: 'docs/02-delivery/phase-03/implementation-plan.md',
        statePath: '.agents/delivery/phase-03/state.json',
        reviewsDirPath: '.agents/delivery/phase-03/reviews',
        handoffsDirPath: '.agents/delivery/phase-03/handoffs',
        reviewPollIntervalMinutes: 6,
        reviewPollMaxWaitMinutes: 12,
        tickets: [
          {
            id: 'P3.01',
            title: 'First ticket',
            slug: 'first-ticket',
            ticketFile: 'docs/ticket-01.md',
            status: 'in_progress',
            branch: 'agents/p3-01-first-ticket',
            baseBranch: 'main',
            worktreePath: targetDir,
            handoffPath: '.agents/delivery/phase-03/handoffs/p3-01-handoff.md',
          },
        ],
      };

      await materializeTicketContext(state, sourceDir, 'P3.01');

      expect(
        await readFile(
          join(
            targetDir,
            '.agents/delivery/phase-03/handoffs/p3-01-handoff.md',
          ),
          'utf8',
        ),
      ).toBe('# Ticket Handoff\n');
      expect(
        JSON.parse(
          await readFile(
            join(targetDir, '.agents/delivery/phase-03/state.json'),
            'utf8',
          ),
        ),
      ).toMatchObject({
        planKey: 'phase-03',
        tickets: [{ id: 'P3.01', worktreePath: targetDir }],
      });
    } finally {
      await rm(sourceDir, { recursive: true, force: true });
      await rm(targetDir, { recursive: true, force: true });
    }
  });

  it('materializes only current and predecessor handoff/review artifacts into a started worktree', async () => {
    const sourceDir = await mkdtemp(join(tmpdir(), 'orchestrator-source-'));
    const targetDir = await mkdtemp(join(tmpdir(), 'orchestrator-target-'));

    try {
      await writeFixture(
        join(sourceDir, '.agents/delivery/phase-03/handoffs/p3-01-handoff.md'),
        'old\n',
      );
      await writeFixture(
        join(sourceDir, '.agents/delivery/phase-03/handoffs/p3-02-handoff.md'),
        'prev\n',
      );
      await writeFixture(
        join(sourceDir, '.agents/delivery/phase-03/handoffs/p3-03-handoff.md'),
        'current\n',
      );
      await writeFixture(
        join(
          sourceDir,
          '.agents/delivery/phase-03/reviews/P3.01-ai-review.fetch.json',
        ),
        '{"old":true}\n',
      );
      await writeFixture(
        join(
          sourceDir,
          '.agents/delivery/phase-03/reviews/P3.02-ai-review.fetch.json',
        ),
        '{"prev":true}\n',
      );
      await writeFixture(
        join(
          sourceDir,
          '.agents/delivery/phase-03/reviews/P3.02-ai-review.triage.json',
        ),
        '{"triage":true}\n',
      );
      await writeFixture(
        join(
          sourceDir,
          '.agents/delivery/phase-03/reviews/P3.03-ai-review.fetch.json',
        ),
        '{"current":true}\n',
      );
      await writeFixture(
        join(targetDir, '.agents/delivery/phase-03/handoffs/p3-03-handoff.md'),
        'stale\n',
      );

      const state: DeliveryState = {
        planKey: 'phase-03',
        planPath: 'docs/02-delivery/phase-03/implementation-plan.md',
        statePath: '.agents/delivery/phase-03/state.json',
        reviewsDirPath: '.agents/delivery/phase-03/reviews',
        handoffsDirPath: '.agents/delivery/phase-03/handoffs',
        reviewPollIntervalMinutes: 6,
        reviewPollMaxWaitMinutes: 12,
        tickets: [
          {
            id: 'P3.01',
            title: 'Old ticket',
            slug: 'old-ticket',
            ticketFile: 'docs/ticket-01.md',
            status: 'done',
            branch: 'agents/p3-01-old-ticket',
            baseBranch: 'main',
            worktreePath: '/tmp/p3_01',
            handoffPath: '.agents/delivery/phase-03/handoffs/p3-01-handoff.md',
          },
          {
            id: 'P3.02',
            title: 'Previous ticket',
            slug: 'previous-ticket',
            ticketFile: 'docs/ticket-02.md',
            status: 'done',
            branch: 'agents/p3-02-previous-ticket',
            baseBranch: 'agents/p3-01-old-ticket',
            worktreePath: '/tmp/p3_02',
            handoffPath: '.agents/delivery/phase-03/handoffs/p3-02-handoff.md',
          },
          {
            id: 'P3.03',
            title: 'Current ticket',
            slug: 'current-ticket',
            ticketFile: 'docs/ticket-03.md',
            status: 'in_progress',
            branch: 'agents/p3-03-current-ticket',
            baseBranch: 'agents/p3-02-previous-ticket',
            worktreePath: targetDir,
            handoffPath: '.agents/delivery/phase-03/handoffs/p3-03-handoff.md',
          },
        ],
      };

      await materializeTicketContext(state, sourceDir, 'P3.03');

      expect(
        await readFile(
          join(
            targetDir,
            '.agents/delivery/phase-03/handoffs/p3-02-handoff.md',
          ),
          'utf8',
        ),
      ).toBe('prev\n');
      expect(
        await readFile(
          join(
            targetDir,
            '.agents/delivery/phase-03/handoffs/p3-03-handoff.md',
          ),
          'utf8',
        ),
      ).toBe('current\n');
      expect(
        existsSync(
          join(
            targetDir,
            '.agents/delivery/phase-03/handoffs/p3-01-handoff.md',
          ),
        ),
      ).toBe(false);
      expect(
        existsSync(
          join(
            targetDir,
            '.agents/delivery/phase-03/reviews/P3.01-ai-review.fetch.json',
          ),
        ),
      ).toBe(false);
      expect(
        await readFile(
          join(
            targetDir,
            '.agents/delivery/phase-03/reviews/P3.02-ai-review.fetch.json',
          ),
          'utf8',
        ),
      ).toBe('{"prev":true}\n');
      expect(
        await readFile(
          join(
            targetDir,
            '.agents/delivery/phase-03/reviews/P3.02-ai-review.triage.json',
          ),
          'utf8',
        ),
      ).toBe('{"triage":true}\n');
      expect(
        await readFile(
          join(
            targetDir,
            '.agents/delivery/phase-03/reviews/P3.03-ai-review.fetch.json',
          ),
          'utf8',
        ),
      ).toBe('{"current":true}\n');
    } finally {
      await rm(sourceDir, { recursive: true, force: true });
      await rm(targetDir, { recursive: true, force: true });
    }
  });
});
