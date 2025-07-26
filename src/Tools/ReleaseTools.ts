import { AzureDevOpsConfig } from "../Interfaces/AzureDevOps";
import { ReleaseService } from "../Services/ReleaseService";
import { formatMcpResponse, formatErrorResponse, McpResponse } from '../Interfaces/Common';
import getClassMethods from "../utils/getClassMethods";

export class ReleaseTools {
  private service: ReleaseService;

  constructor(config: AzureDevOpsConfig) {
    this.service = new ReleaseService(config);
  }

  async getReleaseDefinitions(params: { 
    projectId?: string; 
    searchText?: string; 
    top?: number; 
  }): Promise<McpResponse> {
    try {
      const result = await this.service.getReleaseDefinitions(
        params.projectId, 
        params.searchText, 
        params.top
      );
      return formatMcpResponse(result, `Found ${result.length} release definitions`);
    } catch (error: unknown) {
      console.error('Error getting release definitions:', error);
      return formatErrorResponse(error);
    }
  }

  async getReleases(params: { 
    projectId?: string; 
    definitionId?: number; 
    top?: number; 
  }): Promise<McpResponse> {
    try {
      const result = await this.service.getReleases(
        params.projectId, 
        params.definitionId, 
        params.top
      );
      return formatMcpResponse(result, `Found ${result.length} releases`);
    } catch (error: unknown) {
      console.error('Error getting releases:', error);
      return formatErrorResponse(error);
    }
  }

  async getRelease(params: { projectId: string; releaseId: number }): Promise<McpResponse> {
    try {
      const result = await this.service.getRelease(params.projectId, params.releaseId);
      return formatMcpResponse(result, `Retrieved release ${params.releaseId}`);
    } catch (error: unknown) {
      console.error('Error getting release:', error);
      return formatErrorResponse(error);
    }
  }

  async createRelease(params: { 
    projectId: string; 
    definitionId: number; 
    description?: string; 
    artifacts?: any[]; 
  }): Promise<McpResponse> {
    try {
      const result = await this.service.createRelease(
        params.projectId, 
        params.definitionId, 
        params.description, 
        params.artifacts
      );
      return formatMcpResponse(result, `Created release for definition ${params.definitionId}`);
    } catch (error: unknown) {
      console.error('Error creating release:', error);
      return formatErrorResponse(error);
    }
  }

  async getReleaseLog(params: { 
    projectId: string; 
    releaseId: number; 
    environmentId: number; 
    taskId: number; 
  }): Promise<McpResponse> {
    try {
      const result = await this.service.getReleaseLog(
        params.projectId, 
        params.releaseId, 
        params.environmentId, 
        params.taskId
      );
      return formatMcpResponse(result, `Retrieved log for release ${params.releaseId}`);
    } catch (error: unknown) {
      console.error('Error getting release log:', error);
      return formatErrorResponse(error);
    }
  }

  async updateReleaseEnvironment(params: { 
    projectId: string; 
    releaseId: number; 
    environmentId: number; 
    environmentUpdateData: any; 
  }): Promise<McpResponse> {
    try {
      const result = await this.service.updateReleaseEnvironment(
        params.projectId, 
        params.releaseId, 
        params.environmentId, 
        params.environmentUpdateData
      );
      return formatMcpResponse(result, `Updated environment ${params.environmentId} for release ${params.releaseId}`);
    } catch (error: unknown) {
      console.error('Error updating release environment:', error);
      return formatErrorResponse(error);
    }
  }
}

export const ReleaseToolMethods = getClassMethods(ReleaseTools.prototype);