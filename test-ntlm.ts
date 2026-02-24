/**
 * NTLM authentication test — lists projects and reads the last pull request
 * Run with: npx ts-node test-ntlm.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

const orgUrl     = process.env.AZURE_DEVOPS_ORG_URL!;
const collection = process.env.AZURE_DEVOPS_COLLECTION!;
const project    = process.env.AZURE_DEVOPS_PROJECT!;
const username   = process.env.AZURE_DEVOPS_USERNAME!;
const password   = process.env.AZURE_DEVOPS_PASSWORD!;
const domain     = process.env.AZURE_DEVOPS_DOMAIN!;
const apiVersion = process.env.AZURE_DEVOPS_API_VERSION!;

const httpntlm = require('httpntlm');

const base = `${orgUrl}/${collection}/${project}/_apis`;
const auth = { username, password, domain, workstation: '' };

console.log(`Target:  ${orgUrl}/${collection}`);
console.log(`Project: ${project}`);
console.log(`Auth:    NTLM — domain=${domain}, user=${username}`);
console.log('---\n');

function get(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    httpntlm.get({ url, ...auth }, (err: any, res: any) => {
      if (err) return reject(err);
      if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode}: ${res.body?.substring(0, 200)}`));
      try {
        resolve(JSON.parse(res.body));
      } catch {
        reject(new Error(`Failed to parse JSON: ${res.body?.substring(0, 200)}`));
      }
    });
  });
}

async function main() {
  // ── 1. List projects ────────────────────────────────────────────────────────
  console.log('=== 1. List Projects ===');
  const projectsUrl = `${orgUrl}/${collection}/_apis/projects?api-version=${apiVersion}`;
  const projectsRes = await get(projectsUrl);
  console.log(`Found ${projectsRes.count} project(s):`);
  projectsRes.value.forEach((p: any) => console.log(`  - ${p.name} (${p.id})`));

  // ── 2. List repositories ────────────────────────────────────────────────────
  console.log('\n=== 2. List Repositories ===');
  const reposRes = await get(`${base}/git/repositories?api-version=${apiVersion}`);
  console.log(`Found ${reposRes.count} repository(s):`);
  reposRes.value.forEach((r: any) => console.log(`  - ${r.name} (${r.id})`));

  if (reposRes.count === 0) {
    console.log('No repositories found — skipping pull request test.');
    return;
  }

  // ── 3. Get last pull request across all repos ───────────────────────────────
  console.log('\n=== 3. Last Pull Request (all repos, any status) ===');
  const prUrl = `${base}/git/pullrequests?searchCriteria.status=all&$top=1&api-version=${apiVersion}`;
  const prRes = await get(prUrl);

  if (prRes.count === 0) {
    console.log('No pull requests found.');
    return;
  }

  const pr = prRes.value[0];
  console.log(`PR #${pr.pullRequestId}: ${pr.title}`);
  console.log(`  Repository:  ${pr.repository?.name}`);
  console.log(`  Created by:  ${pr.createdBy?.displayName}`);
  console.log(`  Source:      ${pr.sourceRefName}`);
  console.log(`  Target:      ${pr.targetRefName}`);
  console.log(`  Status:      ${pr.status}`);
  console.log(`  Created:     ${new Date(pr.creationDate).toLocaleString()}`);
}

main()
  .then(() => { console.log('\nAll checks passed.'); process.exit(0); })
  .catch((err) => { console.error('\nFAILED:', err.message); process.exit(1); });
