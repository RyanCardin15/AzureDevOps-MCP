import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { AzureDevOpsConfig } from './Interfaces/AzureDevOps';
import { AIAssistedDevelopmentToolMethods } from './Tools/AIAssistedDevelopmentTools';
import { ArtifactManagementToolMethods } from './Tools/ArtifactManagementTools';
import { BoardsSprintsToolMethods } from './Tools/BoardsSprintsTools';
import { DevSecOpsToolMethods } from './Tools/DevSecOpsTools';
import { GitToolMethods } from './Tools/GitTools';
import { ProjectToolMethods } from './Tools/ProjectTools';
import { TestingCapabilitiesToolMethods } from './Tools/TestingCapabilitiesTools';
import { WorkItemToolMethods } from './Tools/WorkItemTools';

// TFVC tools use "tfvc" prefix in registration but methods don't have the prefix
// So we manually define the tool names with the prefix
const TFVCToolNames = [
  'tfvcCheckout',
  'tfvcCheckin',
  'tfvcGetPendingChanges',
  'tfvcUndoChanges',
  'tfvcGetChangesets',
  'tfvcCreateShelveset',
  'tfvcGetShelveset'
];

// Try to load environment variables from .env file with multiple possible locations
function loadEnvFile() {
  // First try the current directory
  if (fs.existsSync('.env')) {
    dotenv.config();
    return;
  }
  
  // Try the directory of the running script
  const scriptDir = __dirname;
  const envPath = path.join(scriptDir, '..', '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    return;
  }

  // If we still haven't loaded env vars, try a few other common locations
  const possiblePaths = [
    // One level above the dist directory
    path.join(process.cwd(), '.env'),
    // User's home directory
    path.join(process.env.HOME || '', '.azuredevops.env')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      return;
    }
  }


}

// Load environment variables
loadEnvFile();

/**
 * Get Azure DevOps configuration from environment variables
 */
export function getAzureDevOpsConfig(): AzureDevOpsConfig {
  const orgUrl = process.env.AZURE_DEVOPS_ORG_URL;
  const project = process.env.AZURE_DEVOPS_PROJECT;
  const personalAccessToken = process.env.AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN || '';
  const isOnPremises = process.env.AZURE_DEVOPS_IS_ON_PREMISES === 'true';
  const collection = process.env.AZURE_DEVOPS_COLLECTION;
  const apiVersion = process.env.AZURE_DEVOPS_API_VERSION;
  
  // Basic validation
  if (!orgUrl || !project) {
    throw new Error('Missing required Azure DevOps configuration. Please check .env file or environment variables.');
  }

  // Authentication configuration
  const authTypeInput = process.env.AZURE_DEVOPS_AUTH_TYPE || 'pat';
  const authType = (authTypeInput === 'ntlm' || authTypeInput === 'basic' || authTypeInput === 'pat' || authTypeInput === 'entra')
    ? authTypeInput
    : 'pat';

  let auth: AzureDevOpsConfig['auth'];

  if (authType === 'entra') {
    if (isOnPremises) {
      throw new Error('Azure Identity (DefaultAzureCredential) authentication is not supported for on-premises Azure DevOps.');
    }
    auth = { type: 'entra' };
  } else if (isOnPremises) {
    switch (authType) {
      case 'ntlm':
        if (!process.env.AZURE_DEVOPS_USERNAME || !process.env.AZURE_DEVOPS_PASSWORD) {
          throw new Error('NTLM authentication requires username and password.');
        }
        auth = {
          type: 'ntlm',
          username: process.env.AZURE_DEVOPS_USERNAME,
          password: process.env.AZURE_DEVOPS_PASSWORD,
          domain: process.env.AZURE_DEVOPS_DOMAIN
        };
        break;
      case 'basic':
        if (!process.env.AZURE_DEVOPS_USERNAME || !process.env.AZURE_DEVOPS_PASSWORD) {
          throw new Error('Basic authentication requires username and password.');
        }
        auth = {
          type: 'basic',
          username: process.env.AZURE_DEVOPS_USERNAME,
          password: process.env.AZURE_DEVOPS_PASSWORD
        };
        break;
      case 'pat':
      default:
        if (!personalAccessToken) {
          throw new Error('PAT authentication requires a personal access token.');
        }
        auth = {
          type: 'pat'
        };
    }
  } else { // Cloud environment
    if (authType === 'pat') {
      if (!personalAccessToken) {
        throw new Error('PAT authentication requires a personal access token for Azure DevOps cloud unless AZURE_DEVOPS_AUTH_TYPE is set to entra.');
      }
      auth = { type: 'pat' };
    } else { // If not 'pat' and not 'entra' (already handled), then it's an unsupported type for cloud
      throw new Error(`Unsupported auth type "${authType}" for Azure DevOps cloud. Must be 'pat' or 'entra'.`);
    }
  }

  return {
    orgUrl,
    project,
    personalAccessToken,
    isOnPremises,
    collection,
    apiVersion,
    ...(auth && { auth })
  };
}

const ALL_ALLOWED_TOOLS = AIAssistedDevelopmentToolMethods
  .concat(ArtifactManagementToolMethods)
  .concat(BoardsSprintsToolMethods)
  .concat(DevSecOpsToolMethods)
  .concat(GitToolMethods)
  .concat(ProjectToolMethods)
  .concat(TestingCapabilitiesToolMethods)
  .concat(WorkItemToolMethods)
  .concat(TFVCToolNames);

/**
 * Get allowed tools from `process.env.ALLOWED_TOOLS`.
 * 
 * For backward compatibility, if `process.env.ALLOWED_TOOLS` is `undefined`, all tools are allowed.
 */
export function getAllowedTools(): Set<string> {
  const ALLOWED_TOOLS = process.env.ALLOWED_TOOLS;
  if (!ALLOWED_TOOLS) return new Set(ALL_ALLOWED_TOOLS);
  const allowedTools = ALLOWED_TOOLS.split(',');
  return new Set(allowedTools);
}
