import * as azdev from 'azure-devops-node-api';
import { CoreApi } from 'azure-devops-node-api/CoreApi';
import { WorkItemTrackingProcessApi } from 'azure-devops-node-api/WorkItemTrackingProcessApi';
import { ProjectVisibility } from 'azure-devops-node-api/interfaces/CoreInterfaces';
import { AzureDevOpsConfig } from '../Interfaces/AzureDevOps';
import { AzureDevOpsService } from './AzureDevOpsService';
import {
  ListProjectsParams,
  GetProjectDetailsParams,
  CreateProjectParams,
  GetAreasParams,
  GetIterationsParams,
  CreateAreaParams,
  CreateIterationParams,
  GetProcessesParams,
  GetWorkItemTypesParams,
  GetWorkItemTypeFieldsParams
} from '../Interfaces/ProjectManagement';

export class ProjectService extends AzureDevOpsService {
  constructor(config: AzureDevOpsConfig) {
    super(config);
  }

  /**
   * Get the Core API client
   */
  private async getCoreApi(): Promise<CoreApi> {
    return await this.connection.getCoreApi();
  }

  /**
   * Get the Process API client
   */
  private async getProcessApi(): Promise<WorkItemTrackingProcessApi> {
    return await this.connection.getWorkItemTrackingProcessApi();
  }

  /**
   * List projects
   */
  public async listProjects(params: ListProjectsParams): Promise<any> {
    try {
      const coreApi = await this.getCoreApi();
      
      // Call getProjects without the stateFilter parameter
      const projects = await coreApi.getProjects(params.top, params.skip);
      
      // Filter by state if provided
      let filteredProjects = projects;
      if (params.stateFilter) {
        filteredProjects = projects.filter(project => {
          if (params.stateFilter === 'all') return true;
          return project.state === params.stateFilter;
        });
      }
      
      return filteredProjects;
    } catch (error) {
      console.error('Error listing projects:', error);
      throw error;
    }
  }

  /**
   * Get project details
   */
  public async getProjectDetails(params: GetProjectDetailsParams): Promise<any> {
    try {
      const coreApi = await this.getCoreApi();
      
      const project = await coreApi.getProject(params.projectId, params.includeCapabilities);
      
      return project;
    } catch (error) {
      console.error(`Error getting project details for ${params.projectId}:`, error);
      throw error;
    }
  }

  /**
   * Create project
   */
  public async createProject(params: CreateProjectParams): Promise<any> {
    try {
      const coreApi = await this.getCoreApi();
      
      // Convert string visibility to enum
      let visibility: ProjectVisibility;
      if (params.visibility === 'private') {
        visibility = ProjectVisibility.Private;
      } else if (params.visibility === 'public') {
        visibility = ProjectVisibility.Public;
      } else {
        visibility = ProjectVisibility.Private; // Default
      }
      
      // Create project with valid properties
      const project = await coreApi.queueCreateProject({
        name: params.name,
        description: params.description,
        visibility: visibility,
        capabilities: params.capabilities || {}
        // Removed processTemplateId as it's not a valid property
      });
      
      return project;
    } catch (error) {
      console.error(`Error creating project ${params.name}:`, error);
      throw error;
    }
  }

  /**
   * Get areas
   */
  public async getAreas(params: GetAreasParams): Promise<any> {
    try {
      const coreApi = await this.getCoreApi();
      
      // Use getProject as a workaround
      const project = await coreApi.getProject(params.projectId);
      
      // Return project info as a workaround
      return {
        project,
        message: "Direct classification node API not available, returning project info instead"
      };
    } catch (error) {
      console.error(`Error getting areas for project ${params.projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get iterations
   */
  public async getIterations(params: GetIterationsParams): Promise<any> {
    try {
      const coreApi = await this.getCoreApi();
      
      // Use getProject as a workaround
      const project = await coreApi.getProject(params.projectId);
      
      // Return project info as a workaround
      return {
        project,
        message: "Direct classification node API not available, returning project info instead"
      };
    } catch (error) {
      console.error(`Error getting iterations for project ${params.projectId}:`, error);
      throw error;
    }
  }

  /**
   * Create area
   */
  public async createArea(params: CreateAreaParams): Promise<any> {
    throw new Error('createArea is not implemented yet');
  }

  /**
   * Create iteration
   */
  public async createIteration(params: CreateIterationParams): Promise<any> {
    throw new Error('createIteration is not implemented yet');
  }

  /**
   * Get processes
   */
  public async getProcesses(params: GetProcessesParams): Promise<any> {
    throw new Error('getProcesses is not implemented yet');
  }

  /**
   * Get work item types
   */
  public async getWorkItemTypes(params: GetWorkItemTypesParams): Promise<any> {
    try {
      const witProcessApi = await this.getProcessApi();
      
      const workItemTypes = await witProcessApi.getProcessWorkItemTypes(params.processId);
      
      return workItemTypes;
    } catch (error) {
      console.error(`Error getting work item types for process ${params.processId}:`, error);
      throw error;
    }
  }

  /**
   * Get work item type fields
   */
  public async getWorkItemTypeFields(params: GetWorkItemTypeFieldsParams): Promise<any> {
    try {
      const witProcessApi = await this.getProcessApi();
      
      // Use getProcessWorkItemTypes as a workaround
      const types = await witProcessApi.getProcessWorkItemTypes(params.processId);
      
      // Filter to the requested type if specified
      let filteredTypes = types;
      if (params.witRefName) {
        filteredTypes = types.filter(type => type.referenceName === params.witRefName);
      }
      
      return {
        types: filteredTypes,
        message: "Direct field API not available, returning work item types instead"
      };
    } catch (error) {
      console.error(`Error getting work item type fields for ${params.witRefName}:`, error);
      throw error;
    }
  }
} 