import { AzureDevOpsConfig } from "../Interfaces/AzureDevOps";
import { AzureDevOpsService } from "./AzureDevOpsService";
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

export class ArtifactManagementService extends AzureDevOpsService {
  constructor(config: AzureDevOpsConfig) {
    super(config);
  }

  async listArtifactFeeds(params: ListArtifactFeedsParams) {
    throw new Error('listArtifactFeeds requires Azure Artifacts REST API which is not available in the basic azure-devops-node-api. This would need to be implemented using direct REST calls to the Azure Artifacts API.');
  }

  async getPackageVersions(params: GetPackageVersionsParams) {
    throw new Error('getPackageVersions requires Azure Artifacts REST API which is not available in the basic azure-devops-node-api.');
  }

  async publishPackage(params: PublishPackageParams) {
    throw new Error('publishPackage requires Azure Artifacts REST API which is not available in the basic azure-devops-node-api.');
  }

  async promotePackage(params: PromotePackageParams) {
    throw new Error('promotePackage requires Azure Artifacts REST API which is not available in the basic azure-devops-node-api.');
  }

  async deletePackageVersion(params: DeletePackageVersionParams) {
    throw new Error('deletePackageVersion requires Azure Artifacts REST API which is not available in the basic azure-devops-node-api.');
  }

  async listContainerImages(params: ListContainerImagesParams) {
    throw new Error('listContainerImages requires Azure Container Registry REST API which is not available in the basic azure-devops-node-api.');
  }

  async getContainerImageTags(params: GetContainerImageTagsParams) {
    throw new Error('getContainerImageTags requires Azure Container Registry REST API which is not available in the basic azure-devops-node-api.');
  }

  async scanContainerImage(params: ScanContainerImageParams) {
    throw new Error('scanContainerImage requires Azure Security Center/Defender APIs which are not available in the basic azure-devops-node-api.');
  }

  async manageContainerPolicies(params: ManageContainerPoliciesParams) {
    throw new Error('manageContainerPolicies requires Azure Container Registry REST API which is not available in the basic azure-devops-node-api.');
  }

  async manageUniversalPackages(params: ManageUniversalPackagesParams) {
    throw new Error('manageUniversalPackages requires Azure Artifacts REST API which is not available in the basic azure-devops-node-api.');
  }

  async createPackageDownloadReport(params: CreatePackageDownloadReportParams) {
    throw new Error('createPackageDownloadReport requires Azure Artifacts REST API which is not available in the basic azure-devops-node-api.');
  }

  async checkPackageDependencies(params: CheckPackageDependenciesParams) {
    throw new Error('checkPackageDependencies requires Azure Artifacts REST API which is not available in the basic azure-devops-node-api.');
  }
} 