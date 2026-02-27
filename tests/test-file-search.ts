/**
 * Focused test for browseRepository and searchCode.
 * Run with: npx ts-node tests/test-file-search.ts
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

  console.log('\n=== browseRepository ===');

  const rootItems: any[] = await gitSvc.browseRepository({ repositoryId: REPO_ID, path: '/' });
  assert(
    'browseRepository("/") returns more than 1 item (children, not just the folder itself)',
    rootItems.length > 1,
    `got ${rootItems.length} item(s)`
  );

  const firstItem = rootItems[0];
  const hasOnlyCleanFields = firstItem && 'path' in firstItem && 'isFolder' in firstItem && !('objectId' in firstItem);
  assert(
    'items contain only clean fields (path, isFolder) — no raw SDK noise',
    hasOnlyCleanFields,
    `keys: ${firstItem ? Object.keys(firstItem).join(', ') : 'none'}`
  );

  console.log('\n=== searchCode ===');

  const csFiles: any[] = await gitSvc.searchCode({ repositoryId: REPO_ID, searchText: '', fileExtension: '.cs', top: 10 });
  assert(
    'searchCode(ext=".cs") returns at least 1 file',
    csFiles.length > 0,
    `got ${csFiles.length} item(s)`
  );

  const decisionFiles: any[] = await gitSvc.searchCode({ repositoryId: REPO_ID, searchText: 'Decision', top: 10 });
  assert(
    'searchCode(text="Decision") returns at least 1 file',
    decisionFiles.length > 0,
    `got ${decisionFiles.length} item(s)`
  );

  const allResults: any[] = await gitSvc.searchCode({ repositoryId: REPO_ID, searchText: '', top: 20 });
  const hasFolders = allResults.some((i: any) => i.isFolder === true);
  assert(
    'searchCode results contain no folders — files only',
    !hasFolders,
    `isFolder=true found in results`
  );

  const firstResult = allResults[0];
  const resultIsClean = firstResult && 'path' in firstResult && !('objectId' in firstResult);
  assert(
    'searchCode results contain only clean fields — no raw SDK noise',
    resultIsClean,
    `keys: ${firstResult ? Object.keys(firstResult).join(', ') : 'none'}`
  );

  console.log(`\n${passed} passed, ${failed} failed.\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
