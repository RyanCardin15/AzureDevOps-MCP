import { AzureDevOpsConfig } from "../Interfaces/AzureDevOps";
import { AzureDevOpsService } from "./AzureDevOpsService";
import * as ReleaseApi from 'azure-devops-node-api/ReleaseApi';

export class ReleaseService extends AzureDevOpsService {
  constructor(config: AzureDevOpsConfig) {
    super(config);
  }

  /**
   * Get the Release API client
   */
  private async getReleaseApi(): Promise<ReleaseApi.IReleaseApi> {
    return await this.connection.getReleaseApi();
  }

  /**
   * Get release definitions for a project
   */
  async getReleaseDefinitions(projectId?: string, searchText?: string, top?: number) {
    try {
      const releaseApi = await this.getReleaseApi();
      const project = projectId || this.config.project;
      
      const definitions = await releaseApi.getReleaseDefinitions(
        project,
        searchText,
        undefined, // expand
        undefined, // artifactType
        undefined, // artifactSourceId
        top
      );
      
      return definitions;
    } catch (error) {
      console.error('Error getting release definitions:', error);
      throw error;
    }
  }

  /**
   * Get releases for a project
   */
  async getReleases(projectId?: string, definitionId?: number, top?: number) {
    try {
      const releaseApi = await this.getReleaseApi();
      const project = projectId || this.config.project;
      
      const releases = await releaseApi.getReleases(
        project,
        definitionId,
        undefined, // definitionEnvironmentId
        undefined, // searchText
        undefined, // createdBy
        undefined, // statusFilter
        undefined, // environmentStatusFilter
        undefined, // minCreatedTime
        undefined, // maxCreatedTime
        undefined, // queryOrder
        top
      );
      
      return releases;
    } catch (error) {
      console.error('Error getting releases:', error);
      throw error;
    }
  }

  /**
   * Get a specific release
   */
  async getRelease(projectId: string, releaseId: number) {
    try {
      const releaseApi = await this.getReleaseApi();
      
      const release = await releaseApi.getRelease(projectId, releaseId);
      
      return release;
    } catch (error) {
      console.error('Error getting release:', error);
      throw error;
    }
  }

  /**
   * Create a release
   */
  async createRelease(projectId: string, definitionId: number, description?: string, artifacts?: any[]) {
    try {
      const releaseApi = await this.getReleaseApi();
      
      const releaseStartMetadata: any = {
        definitionId,
        description,
        artifacts
      };
      
      const release = await releaseApi.createRelease(releaseStartMetadata, projectId);
      
      return release;
    } catch (error) {
      console.error('Error creating release:', error);
      throw error;
    }
  }

  /**
   * Get release logs
   */
  async getReleaseLog(projectId: string, releaseId: number, environmentId: number, taskId: number) {
    try {
      const releaseApi = await this.getReleaseApi();
      
      const log = await releaseApi.getLog(projectId, releaseId, environmentId, taskId);
      
      return log;
    } catch (error) {
      console.error('Error getting release log:', error);
      throw error;
    }
  }

  /**
   * Update release environment
   */
  async updateReleaseEnvironment(projectId: string, releaseId: number, environmentId: number, environmentUpdateData: any) {
    try {
      const releaseApi = await this.getReleaseApi();
      
      const environment = await releaseApi.updateReleaseEnvironment(environmentUpdateData, projectId, releaseId, environmentId);
      
      return environment;
    } catch (error) {
      console.error('Error updating release environment:', error);
      throw error;
    }
  }
}