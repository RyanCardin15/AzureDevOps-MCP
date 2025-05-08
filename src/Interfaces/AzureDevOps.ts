import { WorkItemReference } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";

/**
 * Interface for Azure DevOps configuration
 */
export interface AzureDevOpsConfig {
  orgUrl: string;
  project: string;
  personalAccessToken: string;
  isOnPremises?: boolean;
  collection?: string; // Collection name for on-premises
  apiVersion?: string; // API version for on-premises
  // Additional authentication options for on-premises
  auth?: {
    type: 'pat' | 'ntlm' | 'basic';
    username?: string;
    password?: string;
    domain?: string; // For NTLM authentication
  };
}

/**
 * Interface for work item query parameters
 */
export interface WorkItemQueryParams {
  query: string;
}

/**
 * Interface for the raw work item response from Azure DevOps
 */
export interface RawWorkItemResponse {
  workItems: WorkItemReference[];
  count: number;
}

/**
 * Interface for formatted work item response suitable for MCP
 */
export interface WorkItemResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
  workItems?: any[]; // Optional raw data if needed
  isError?: boolean;
} 