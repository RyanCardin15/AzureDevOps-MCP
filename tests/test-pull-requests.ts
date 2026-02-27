/**
 * Focused test for getPullRequest and getPullRequestComments.
 * Run with: npx ts-node tests/test-pull-requests.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import { getAzureDevOpsConfig } from '../src/config';
import { GitService } from '../src/Services/GitService';

const REPO_ID = '3fa220e9-8913-40f5-a394-925d8c04869b';

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✔ PASS: ${label}`);
    passed++;
  } else {
    console.log(`  ✘ FAIL: ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

async function main() {
  const config = getAzureDevOpsConfig();
  const gitSvc = new GitService(config);

  console.log(`\nRepo: ${REPO_ID} (Zona) | Config project: ${config.project}\n`);

  const prs: any[] = await gitSvc.getPullRequests({ repositoryId: REPO_ID, status: 'all', top: 1 });
  const prId: number = prs?.[0]?.pullRequestId;
  console.log(`  Using PR id: ${prId}\n`);

  console.log('=== getPullRequest ===');

  const pr: any = await gitSvc.getPullRequest({ repositoryId: REPO_ID, pullRequestId: prId });
  assert(
    'getPullRequest returns a PR object (not a TF401019 error)',
    pr && pr.pullRequestId === prId,
    pr?.message ?? JSON.stringify(pr)?.slice(0, 120)
  );

  assert(
    'PR has title, status and repository fields',
    pr && typeof pr.title === 'string' && pr.status !== undefined && pr.repository !== undefined,
    `keys: ${pr ? Object.keys(pr).join(', ') : 'none'}`
  );

  console.log('\n=== getPullRequestComments ===');

  const threads: any = await gitSvc.getPullRequestComments({ repositoryId: REPO_ID, pullRequestId: prId });
  assert(
    'getPullRequestComments returns an array of threads (not a TF401019 error)',
    Array.isArray(threads),
    Array.isArray(threads) ? `${threads.length} threads` : threads?.message?.slice(0, 100)
  );

  const firstThread = Array.isArray(threads) ? threads[0] : null;
  assert(
    'each thread has id and comments fields',
    firstThread && firstThread.id !== undefined && Array.isArray(firstThread.comments),
    `keys: ${firstThread ? Object.keys(firstThread).join(', ') : 'none'}`
  );

  console.log(`\n${passed} passed, ${failed} failed.\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
