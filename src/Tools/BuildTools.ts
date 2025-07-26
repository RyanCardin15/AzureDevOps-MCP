import { AzureDevOpsConfig } from "../Interfaces/AzureDevOps";
import { BuildService } from "../Services/BuildService";
import { formatMcpResponse, formatErrorResponse, McpResponse } from '../Interfaces/Common';
import getClassMethods from "../utils/getClassMethods";

export class BuildTools {
  private service: BuildService;

  constructor(config: AzureDevOpsConfig) {
    this.service = new BuildService(config);
  }

  async getBuildDefinitions(params: { 
    projectId?: string; 
    name?: string; 
    repositoryId?: string; 
    repositoryType?: string; 
    top?: number; 
  }): Promise<McpResponse> {
    try {
      const result = await this.service.getBuildDefinitions(
        params.projectId, 
        params.name, 
        params.repositoryId, 
        params.repositoryType, 
        params.top
      );
      return formatMcpResponse(result, `Found ${result.length} build definitions`);
    } catch (error: unknown) {
      console.error('Error getting build definitions:', error);
      return formatErrorResponse(error);
    }
  }

  async getBuilds(params: { 
    projectId?: string; 
    definitions?: number[]; 
    queues?: number[]; 
    buildNumber?: string; 
    top?: number; 
  }): Promise<McpResponse> {
    try {
      const result = await this.service.getBuilds(
        params.projectId, 
        params.definitions, 
        params.queues, 
        params.buildNumber, 
        params.top
      );
      return formatMcpResponse(result, `Found ${result.length} builds`);
    } catch (error: unknown) {
      console.error('Error getting builds:', error);
      return formatErrorResponse(error);
    }
  }

  async getBuild(params: { projectId: string; buildId: number }): Promise<McpResponse> {
    try {
      const result = await this.service.getBuild(params.projectId, params.buildId);
      return formatMcpResponse(result, `Retrieved build ${params.buildId}`);
    } catch (error: unknown) {
      console.error('Error getting build:', error);
      return formatErrorResponse(error);
    }
  }

  async queueBuild(params: { 
    projectId: string; 
    definitionId: number; 
    sourceBranch?: string; 
    parameters?: string; 
  }): Promise<McpResponse> {
    try {
      const result = await this.service.queueBuild(
        params.projectId, 
        params.definitionId, 
        params.sourceBranch, 
        params.parameters
      );
      return formatMcpResponse(result, `Queued build for definition ${params.definitionId}`);
    } catch (error: unknown) {
      console.error('Error queuing build:', error);
      return formatErrorResponse(error);
    }
  }

  async getBuildLogs(params: { projectId: string; buildId: number }): Promise<McpResponse> {
    try {
      const result = await this.service.getBuildLogs(params.projectId, params.buildId);
      return formatMcpResponse(result, `Retrieved logs for build ${params.buildId}`);
    } catch (error: unknown) {
      console.error('Error getting build logs:', error);
      return formatErrorResponse(error);
    }
  }

  async getBuildTimeline(params: { projectId: string; buildId: number }): Promise<McpResponse> {
    try {
      const result = await this.service.getBuildTimeline(params.projectId, params.buildId);
      return formatMcpResponse(result, `Retrieved timeline for build ${params.buildId}`);
    } catch (error: unknown) {
      console.error('Error getting build timeline:', error);
      return formatErrorResponse(error);
    }
  }
}

export const BuildToolMethods = getClassMethods(BuildTools.prototype);