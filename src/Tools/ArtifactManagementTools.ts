import { AzureDevOpsConfig } from "../Interfaces/AzureDevOps";
import { ArtifactManagementService } from "../Services/ArtifactManagementService";
import { formatMcpResponse, formatErrorResponse, McpResponse } from '../Interfaces/Common';
import {
  ListArtifactFeedsParams,
  GetPackageVersionsParams,
  PublishPackageParams,
  PromotePackageParams,
  DeletePackageVersionParams,
  ListContainerImagesParams,
  GetContainerImageTagsParams,
  ScanContainerImageParams,
  ManageContainerPoliciesParams,
  ManageUniversalPackagesParams,
  CreatePackageDownloadReportParams,
  CheckPackageDependenciesParams
} from "../Interfaces/ArtifactManagement";
import getClassMethods from "../utils/getClassMethods";

export class ArtifactManagementTools {
  private service: ArtifactManagementService;

  constructor(config: AzureDevOpsConfig) {
    this.service = new ArtifactManagementService(config);
  }

  async listArtifactFeeds(params: ListArtifactFeedsParams): Promise<McpResponse> {
    try {
      const result = await this.service.listArtifactFeeds(params);
      return formatMcpResponse(result, `Found artifact feeds`);
    } catch (error: unknown) {
      console.error('Error listing artifact feeds:', error);
      return formatErrorResponse(error);
    }
  }

  async getPackageVersions(params: GetPackageVersionsParams): Promise<McpResponse> {
    try {
      const result = await this.service.getPackageVersions(params);
      return formatMcpResponse(result, `Found package versions for ${params.packageName}`);
    } catch (error: unknown) {
      console.error('Error getting package versions:', error);
      return formatErrorResponse(error);
    }
  }

  async publishPackage(params: PublishPackageParams): Promise<McpResponse> {
    try {
      const result = await this.service.publishPackage(params);
      return formatMcpResponse(result, `Published package to feed ${params.feedId}`);
    } catch (error: unknown) {
      console.error('Error publishing package:', error);
      return formatErrorResponse(error);
    }
  }

  async promotePackage(params: PromotePackageParams): Promise<McpResponse> {
    try {
      const result = await this.service.promotePackage(params);
      return formatMcpResponse(result, `Promoted package ${params.packageName} version ${params.packageVersion} from ${params.sourceView} to ${params.targetView}`);
    } catch (error: unknown) {
      console.error('Error promoting package:', error);
      return formatErrorResponse(error);
    }
  }

  async deletePackageVersion(params: DeletePackageVersionParams): Promise<McpResponse> {
    try {
      const result = await this.service.deletePackageVersion(params);
      return formatMcpResponse(result, `Deleted package ${params.packageName} version ${params.packageVersion}${params.permanent ? ' permanently' : ''}`);
    } catch (error: unknown) {
      console.error('Error deleting package version:', error);
      return formatErrorResponse(error);
    }
  }

  async listContainerImages(params: ListContainerImagesParams): Promise<McpResponse> {
    try {
      const result = await this.service.listContainerImages(params);
      return formatMcpResponse(result, `Found container images in repository ${params.repositoryName || 'all'}`);
    } catch (error: unknown) {
      console.error('Error listing container images:', error);
      return formatErrorResponse(error);
    }
  }

  async getContainerImageTags(params: GetContainerImageTagsParams): Promise<McpResponse> {
    try {
      const result = await this.service.getContainerImageTags(params);
      return formatMcpResponse(result, `Found tags for image ${params.imageName}`);
    } catch (error: unknown) {
      console.error('Error getting container image tags:', error);
      return formatErrorResponse(error);
    }
  }

  async scanContainerImage(params: ScanContainerImageParams): Promise<McpResponse> {
    try {
      const result = await this.service.scanContainerImage(params);
      return formatMcpResponse(result, `Completed ${params.scanType || 'both'} scan of image ${params.imageTag}`);
    } catch (error: unknown) {
      console.error('Error scanning container image:', error);
      return formatErrorResponse(error);
    }
  }

  async manageContainerPolicies(params: ManageContainerPoliciesParams): Promise<McpResponse> {
    try {
      const result = await this.service.manageContainerPolicies(params);
      return formatMcpResponse(result, `${params.action === 'get' ? 'Retrieved' : (params.action === 'set' ? 'Set' : 'Deleted')} ${params.policyType} policy for repository ${params.repositoryName}`);
    } catch (error: unknown) {
      console.error('Error managing container policies:', error);
      return formatErrorResponse(error);
    }
  }

  async manageUniversalPackages(params: ManageUniversalPackagesParams): Promise<McpResponse> {
    try {
      const result = await this.service.manageUniversalPackages(params);
      const actionText = params.action === 'download' ? 'Downloaded' : 
                         params.action === 'upload' ? 'Uploaded' : 'Deleted';
      return formatMcpResponse(result, `${actionText} universal package ${params.packageName}${params.packageVersion ? ` version ${params.packageVersion}` : ''}`);
    } catch (error: unknown) {
      console.error('Error managing universal packages:', error);
      return formatErrorResponse(error);
    }
  }

  async createPackageDownloadReport(params: CreatePackageDownloadReportParams): Promise<McpResponse> {
    try {
      const result = await this.service.createPackageDownloadReport(params);
      return formatMcpResponse(result, `Created download report for ${params.packageName || 'all packages'} in ${params.feedId || 'all feeds'}`);
    } catch (error: unknown) {
      console.error('Error creating package download report:', error);
      return formatErrorResponse(error);
    }
  }

  async checkPackageDependencies(params: CheckPackageDependenciesParams): Promise<McpResponse> {
    try {
      const result = await this.service.checkPackageDependencies(params);
      return formatMcpResponse(
        result, 
        `Checked dependencies for ${params.packageName}${params.packageVersion ? ` version ${params.packageVersion}` : ''}`
      );
    } catch (error: unknown) {
      console.error('Error checking package dependencies:', error);
      return formatErrorResponse(error);
    }
  }
}

export const ArtifactManagementToolMethods = getClassMethods(ArtifactManagementTools.prototype);