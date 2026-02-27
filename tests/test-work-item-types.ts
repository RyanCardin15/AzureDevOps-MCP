/**
 * Focused test for getWorkItemTypes and getWorkItemTypeFields.
 * Run with: npx ts-node tests/test-work-item-types.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import { getAzureDevOpsConfig } from '../src/config';
import { ProjectService } from '../src/Services/ProjectService';

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
  const projectSvc = new ProjectService(config);

  console.log(`\nProject: ${config.project}\n`);

  console.log('=== getWorkItemTypes ===');

  let types: any;
  try {
    types = await projectSvc.getWorkItemTypes({ processId: config.project });
    assert(
      'getWorkItemTypes returns an array (not null)',
      Array.isArray(types),
      `got: ${JSON.stringify(types)}`
    );
  } catch (e: any) {
    assert('getWorkItemTypes does not throw', false, e.message);
  }

  assert(
    'getWorkItemTypes returns at least 1 work item type',
    Array.isArray(types) && types.length > 0,
    `got ${Array.isArray(types) ? types.length : 'non-array'} items`
  );

  const firstType = Array.isArray(types) ? types[0] : null;
  assert(
    'each work item type has name and referenceName',
    firstType && typeof firstType.name === 'string' && typeof firstType.referenceName === 'string',
    `keys: ${firstType ? Object.keys(firstType).join(', ') : 'none'}`
  );

  if (firstType) {
    console.log(`  (sample: name="${firstType.name}", referenceName="${firstType.referenceName}")`);
  }

  console.log('\n=== getWorkItemTypeFields ===');

  const witRefName = firstType?.referenceName;

  let fields: any;
  try {
    fields = await projectSvc.getWorkItemTypeFields({ processId: config.project, witRefName });
  } catch (e: any) {
    fields = null;
  }

  assert(
    'getWorkItemTypeFields returns object with types array',
    fields && Array.isArray(fields.types),
    `got: ${JSON.stringify(fields)?.slice(0, 100)}`
  );

  const matchesFilter = Array.isArray(fields?.types) &&
    fields.types.every((t: any) => t.referenceName === witRefName);
  assert(
    `getWorkItemTypeFields filters to only "${witRefName}"`,
    matchesFilter,
    `types: ${fields?.types?.map((t: any) => t.referenceName).join(', ')}`
  );

  console.log(`\n${passed} passed, ${failed} failed.\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
