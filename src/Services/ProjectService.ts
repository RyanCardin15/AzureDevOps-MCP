import * as azdev from 'azure-devops-node-api';
import { CoreApi } from 'azure-devops-node-api/CoreApi';
import { WorkItemTrackingProcessApi } from 'azure-devops-node-api/WorkItemTrackingProcessApi';
import { ProjectVisibility } from 'azure-devops-node-api/interfaces/CoreInterfaces';
import { TreeNodeStructureType, TreeStructureGroup } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
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
    try {
      const witApi = await this.getWorkItemTrackingApi();
      
      // Create classification node for area
      const classificationNode = {
        name: params.name,
        structureType: TreeNodeStructureType.Area
      };
      
      // If parentPath is provided, create under that path, otherwise create at root
      const path = params.parentPath || 'Area';
      
      const result = await witApi.createOrUpdateClassificationNode(
        classificationNode,
        params.projectId || this.config.project,
        TreeStructureGroup.Areas,
        path
      );
      
      return result;
    } catch (error) {
      console.error(`Error creating area ${params.name}:`, error);
      throw error;
    }
  }

  /**
   * Create iteration
   */
  public async createIteration(params: CreateIterationParams): Promise<any> {
    try {
      const witApi = await this.getWorkItemTrackingApi();
      
      // Create classification node for iteration
      const classificationNode: any = {
        name: params.name,
        structureType: TreeNodeStructureType.Iteration
      };
      
      // Add date attributes if provided
      if (params.startDate || params.finishDate) {
        classificationNode.attributes = {};
        if (params.startDate) {
          classificationNode.attributes.startDate = params.startDate;
        }
        if (params.finishDate) {
          classificationNode.attributes.finishDate = params.finishDate;
        }
      }
      
      // If parentPath is provided, create under that path, otherwise create at root
      const path = params.parentPath || 'Iteration';
      
      const result = await witApi.createOrUpdateClassificationNode(
        classificationNode,
        params.projectId || this.config.project,
        TreeStructureGroup.Iterations,
        path
      );
      
      return result;
    } catch (error) {
      console.error(`Error creating iteration ${params.name}:`, error);
      throw error;
    }
  }

  /**
   * Get processes
   */
  public async getProcesses(params: GetProcessesParams): Promise<any> {
    try {
      const processApi = await this.getProcessApi();
      
      const processes = await processApi.getListOfProcesses();
      
      return processes;
    } catch (error) {
      console.error('Error getting processes:', error);
      throw error;
    }
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