/**
 * Manual test script for getFileContent
 * Run with: npx ts-node test-getFileContent.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { getAzureDevOpsConfig } from './src/config';
import { GitService } from './src/Services/GitService';
import { GitTools } from './src/Tools/GitTools';

async function main() {
  console.error('=== getFileContent test ===\n');

  const config = getAzureDevOpsConfig();
  const gitService = new GitService(config);
  const gitTools = new GitTools(config);

  // Step 1: list repos to find a valid repositoryId
  console.error('Fetching repository list...');
  let repos: any[] = [];
  try {
    repos = await gitService.listRepositories({ projectId: config.project });
    console.error(`Found ${repos.length} repositories:`);
    repos.forEach((r, i) => console.error(`  [${i}] id=${r.id}  name=${r.name}`));
  } catch (err) {
    console.error('Failed to list repos:', err);
    process.exit(1);
  }

  if (repos.length === 0) {
    console.error('No repositories found — cannot test getFileContent.');
    process.exit(1);
  }

  const repo = repos[0];
  console.error(`\nUsing repository: "${repo.name}" (${repo.id})`);

  // Step 2: browse root to find a real file path
  console.error('\nBrowsing root of repository...');
  let rootItems: any[] = [];
  try {
    rootItems = await gitService.browseRepository({ repositoryId: repo.id, path: '/' });
    console.error('Root items:');
    rootItems.slice(0, 10).forEach((item: any) =>
      console.error(`  ${item.isFolder ? '[DIR]' : '[FILE]'} ${item.path}`)
    );
  } catch (err) {
    console.error('Failed to browse root:', err);
  }

  // Pick first non-folder or fall back to /README.md
  const fileItem = rootItems.find((item: any) => !item.isFolder);
  const testPath: string = fileItem ? fileItem.path : '/README.md';
  console.error(`\nTesting getFileContent with path: "${testPath}"`);

  // Step 3: call getFileContent through the Tools layer
  const result = await gitTools.getFileContent({
    repositoryId: repo.id,
    path: testPath
  });

  console.error('\n--- Tool result ---');
  console.error('isError:', result.isError);
  console.error('content[0].text:', result.content[0]?.text);

  if (!result.isError) {
    const fileContent = (result.rawData as any)?.content ?? '';
    const preview = typeof fileContent === 'string'
      ? fileContent.slice(0, 500)
      : JSON.stringify(fileContent).slice(0, 500);
    console.error(`\nFile content preview (first 500 chars):\n---\n${preview}\n---`);
    console.error('\n✅ getFileContent: PASSED');
  } else {
    console.error('\n❌ getFileContent: FAILED');
    console.error('Error detail:', result.content[1]?.text);
  }
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
