/**
 * NTLM authentication test via the real service layer (ProjectService).
 * This test verifies that the AzureDevOpsService constructor + NTLM handler
 * can successfully reach the on-premises server.
 *
 * Before fix: times out / hangs (getNtlmHandler is broken over plain HTTP)
 * After fix:  lists at least one project (HttpNtlmHandler works correctly)
 *
 * Run with: npx ts-node test-ntlm-service.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { ProjectService } from './src/Services/ProjectService';
import { AzureDevOpsConfig, NtlmAuth } from './src/Interfaces/AzureDevOps';

const TIMEOUT_MS = 10_000;

const auth: NtlmAuth = {
  type: 'ntlm',
  username: process.env.AZURE_DEVOPS_USERNAME!,
  password: process.env.AZURE_DEVOPS_PASSWORD!,
  domain:   process.env.AZURE_DEVOPS_DOMAIN,
};

const config: AzureDevOpsConfig = {
  orgUrl:              process.env.AZURE_DEVOPS_ORG_URL!,
  project:             process.env.AZURE_DEVOPS_PROJECT!,
  personalAccessToken: '',
  isOnPremises:        true,
  collection:          process.env.AZURE_DEVOPS_COLLECTION,
  apiVersion:          process.env.AZURE_DEVOPS_API_VERSION,
  auth,
};

console.log(`Target:  ${config.orgUrl}/${config.collection}`);
console.log(`Project: ${config.project}`);
console.log(`Auth:    NTLM — domain=${auth.domain}, user=${auth.username}`);
console.log('---\n');

async function runWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out after ${ms} ms`)), ms);
  });
  try {
    const result = await Promise.race([promise, timeout]);
    clearTimeout(timer!);
    return result;
  } catch (err) {
    clearTimeout(timer!);
    throw err;
  }
}

async function main() {
  const service = new ProjectService(config);

  console.log('=== Listing projects via ProjectService ===');
  const projects = await runWithTimeout(service.listProjects({}), TIMEOUT_MS);

  if (!Array.isArray(projects) || projects.length === 0) {
    throw new Error('No projects returned — authentication may have failed silently.');
  }

  console.log(`Found ${projects.length} project(s):`);
  projects.forEach((p: any) => console.log(`  - ${p.name} (${p.id})`));
}

main()
  .then(() => { console.log('\nPASS'); process.exit(0); })
  .catch((err) => { console.error('\nFAIL:', err.message); process.exit(1); });
