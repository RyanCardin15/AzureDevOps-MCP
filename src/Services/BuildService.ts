import { AzureDevOpsConfig } from "../Interfaces/AzureDevOps";
import { AzureDevOpsService } from "./AzureDevOpsService";
import { BuildApi } from 'azure-devops-node-api/BuildApi';

export class BuildService extends AzureDevOpsService {
  constructor(config: AzureDevOpsConfig) {
    super(config);
  }

  /**
   * Get the Build API client
   */
  private async getBuildApi(): Promise<BuildApi> {
    return await this.connection.getBuildApi();
  }

  /**
   * Get build definitions for a project
   */
  async getBuildDefinitions(projectId?: string, name?: string, repositoryId?: string, repositoryType?: string, top?: number) {
    try {
      const buildApi = await this.getBuildApi();
      const project = projectId || this.config.project;
      
      const definitions = await buildApi.getDefinitions(
        project,
        name,
        repositoryId,
        repositoryType,
        undefined, // queryOrder
        top
      );
      
      return definitions;
    } catch (error) {
      console.error('Error getting build definitions:', error);
      throw error;
    }
  }

  /**
   * Get builds for a project
   */
  async getBuilds(projectId?: string, definitions?: number[], queues?: number[], buildNumber?: string, top?: number) {
    try {
      const buildApi = await this.getBuildApi();
      const project = projectId || this.config.project;
      
      const builds = await buildApi.getBuilds(project, definitions, queues, buildNumber, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, top);
      
      return builds;
    } catch (error) {
      console.error('Error getting builds:', error);
      throw error;
    }
  }

  /**
   * Get a specific build
   */
  async getBuild(projectId: string, buildId: number) {
    try {
      const buildApi = await this.getBuildApi();
      
      const build = await buildApi.getBuild(projectId, buildId);
      
      return build;
    } catch (error) {
      console.error('Error getting build:', error);
      throw error;
    }
  }

  /**
   * Queue a new build
   */
  async queueBuild(projectId: string, definitionId: number, sourceBranch?: string, parameters?: string) {
    try {
      const buildApi = await this.getBuildApi();
      
      const buildRequest: any = {
        definition: { id: definitionId },
        sourceBranch,
        parameters
      };
      
      const build = await buildApi.queueBuild(buildRequest, projectId);
      
      return build;
    } catch (error) {
      console.error('Error queuing build:', error);
      throw error;
    }
  }

  /**
   * Get build logs
   */
  async getBuildLogs(projectId: string, buildId: number) {
    try {
      const buildApi = await this.getBuildApi();
      
      const logs = await buildApi.getBuildLogs(projectId, buildId);
      
      return logs;
    } catch (error) {
      console.error('Error getting build logs:', error);
      throw error;
    }
  }

  /**
   * Get build timeline
   */
  async getBuildTimeline(projectId: string, buildId: number) {
    try {
      const buildApi = await this.getBuildApi();
      
      const timeline = await buildApi.getBuildTimeline(projectId, buildId);
      
      return timeline;
    } catch (error) {
      console.error('Error getting build timeline:', error);
      throw error;
    }
  }
}