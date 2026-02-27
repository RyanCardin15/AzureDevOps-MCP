/**
 * Smoke test for all read-only service methods.
 * Run with: npx ts-node tests/test-reads.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import { getAzureDevOpsConfig } from '../src/config';
import { WorkItemService } from '../src/Services/WorkItemService';
import { GitService } from '../src/Services/GitService';
import { BoardsSprintsService } from '../src/Services/BoardsSprintsService';
import { ProjectService } from '../src/Services/ProjectService';

const PASS = '✔';
const FAIL = '✘';

async function run(label: string, fn: () => Promise<any>) {
  process.stdout.write(`  ${label} ... `);
  try {
    const result = await fn();
    const summary = Array.isArray(result)
      ? `[${result.length} items]`
      : result && typeof result === 'object'
        ? JSON.stringify(result).slice(0, 120)
        : String(result);
    console.log(`${PASS} ${summary}`);
    return result;
  } catch (err: any) {
    console.log(`${FAIL} ${err?.message || err}`);
    return null;
  }
}

async function main() {
  const config = getAzureDevOpsConfig();
  console.log(`\nTarget: ${config.orgUrl}/${config.collection} | Project: ${config.project}\n`);

  // ── ProjectService ──────────────────────────────────────────────────────────
  console.log('=== ProjectService ===');
  const projectSvc = new ProjectService(config);

  await run('listProjects', () => projectSvc.listProjects({ top: 5 }));
  await run('getProjectDetails', () => projectSvc.getProjectDetails({ projectId: config.project, includeCapabilities: false }));
  await run('getAreas', () => projectSvc.getAreas({ projectId: config.project }));
  await run('getIterations', () => projectSvc.getIterations({ projectId: config.project }));
  await run('getProcesses', () => projectSvc.getProcesses({}));
  await run('getWorkItemTypes', () => projectSvc.getWorkItemTypes({ processId: config.project }));
  await run('getWorkItemTypeFields', () => projectSvc.getWorkItemTypeFields({ processId: config.project, witRefName: 'Microsoft.VSTS.WorkItemTypes.Bug' }));

  // ── WorkItemService ─────────────────────────────────────────────────────────
  console.log('\n=== WorkItemService ===');
  const wiSvc = new WorkItemService(config);

  const wiResult: any = await run('listWorkItems', () =>
    wiSvc.listWorkItems(`SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = @project ORDER BY [System.Id] ASC`)
  );
  const firstId: number | null = wiResult?.workItems?.[0]?.id ?? null;
  if (firstId) {
    await run(`getWorkItemById (id=${firstId})`, () => wiSvc.getWorkItemById({ id: firstId }));
  }
  await run('searchWorkItems ("bug")', () => wiSvc.searchWorkItems({ searchText: 'bug' }));
  await run('getRecentWorkItems (top=3)', () => wiSvc.getRecentWorkItems({ top: 3 }));
  await run('getMyWorkItems', () => wiSvc.getMyWorkItems({ top: 5 }));

  // ── GitService ──────────────────────────────────────────────────────────────
  console.log('\n=== GitService (project: Zona) ===');
  const gitSvc = new GitService(config);

  const repos: any = await run('listRepositories', () => gitSvc.listRepositories({ projectId: 'Zona' }));
  const firstRepo = Array.isArray(repos) && repos.length > 0 ? repos[0] : null;
  const repoId: string | null = firstRepo?.id ?? null;
  const repoName: string = firstRepo?.name ?? '(unknown)';

  if (repoId) {
    await run(`getRepository (${repoName})`, () => gitSvc.getRepository({ repositoryId: repoId, projectId: 'Zona' }));
    await run('listBranches', () => gitSvc.listBranches({ repositoryId: repoId, top: 5 }));
    await run('browseRepository (root)', () => gitSvc.browseRepository({ repositoryId: repoId, path: '/' }));
    await run('searchCode (text="Decision")', () => gitSvc.searchCode({ repositoryId: repoId, searchText: 'Decision', top: 5 }));
    await run('searchCode (ext=".cs")', () => gitSvc.searchCode({ repositoryId: repoId, searchText: '', fileExtension: '.cs', top: 5 }));
    await run('getCommitHistory (top=3)', () => gitSvc.getCommitHistory({ repositoryId: repoId, top: 3 }));
    await run('getCommits', () => gitSvc.getCommits({ repositoryId: repoId }));

    const prs: any = await run('getPullRequests (status=all, top=3)', () =>
      gitSvc.getPullRequests({ repositoryId: repoId, status: 'all', top: 3 })
    );
    const firstPr = Array.isArray(prs) && prs.length > 0 ? prs[0] : null;
    if (firstPr) {
      await run(`getPullRequest (id=${firstPr.pullRequestId})`, () =>
        gitSvc.getPullRequest({ repositoryId: repoId, pullRequestId: firstPr.pullRequestId })
      );
      await run(`getPullRequestComments (id=${firstPr.pullRequestId})`, () =>
        gitSvc.getPullRequestComments({ repositoryId: repoId, pullRequestId: firstPr.pullRequestId })
      );
    }
  }

  // ── BoardsSprintsService ────────────────────────────────────────────────────
  console.log('\n=== BoardsSprintsService ===');
  const boardsSvc = new BoardsSprintsService(config);

  const boards: any = await run('getBoards', () => boardsSvc.getBoards({}));
  const firstBoard = Array.isArray(boards) && boards.length > 0 ? boards[0] : null;
  const boardId: string | null = firstBoard?.id ?? null;

  if (boardId) {
    await run(`getBoardColumns (board=${boardId})`, () => boardsSvc.getBoardColumns({ boardId }));
    await run(`getBoardItems (board=${boardId})`, () => boardsSvc.getBoardItems({ boardId }));
    await run(`getBoardCards (board=${boardId})`, () => boardsSvc.getBoardCards({ boardId }));
  }

  const sprints: any = await run('getSprints', () => boardsSvc.getSprints({}));
  await run('getCurrentSprint', () => boardsSvc.getCurrentSprint({}));

  const firstSprint = Array.isArray(sprints) && sprints.length > 0 ? sprints[0] : null;
  if (firstSprint?.id) {
    await run(`getSprintWorkItems (sprint=${firstSprint.id})`, () => boardsSvc.getSprintWorkItems({ sprintId: firstSprint.id }));
    await run(`getSprintCapacity (sprint=${firstSprint.id})`, () => boardsSvc.getSprintCapacity({ sprintId: firstSprint.id }));
  }

  await run('getTeamMembers', () => boardsSvc.getTeamMembers({}));

  console.log('\nDone.\n');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
