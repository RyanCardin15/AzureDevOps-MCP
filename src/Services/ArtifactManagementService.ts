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
    throw new Error('listArtifactFeeds is not implemented yet');
  }

  async getPackageVersions(params: GetPackageVersionsParams) {
    throw new Error('getPackageVersions is not implemented yet');
  }

  async publishPackage(params: PublishPackageParams) {
    throw new Error('publishPackage is not implemented yet');
  }

  async promotePackage(params: PromotePackageParams) {
    throw new Error('promotePackage is not implemented yet');
  }

  async deletePackageVersion(params: DeletePackageVersionParams) {
    throw new Error('deletePackageVersion is not implemented yet');
  }

  async listContainerImages(params: ListContainerImagesParams) {
    throw new Error('listContainerImages is not implemented yet');
  }

  async getContainerImageTags(params: GetContainerImageTagsParams) {
    throw new Error('getContainerImageTags is not implemented yet');
  }

  async scanContainerImage(params: ScanContainerImageParams) {
    throw new Error('scanContainerImage is not implemented yet');
  }

  async manageContainerPolicies(params: ManageContainerPoliciesParams) {
    throw new Error('manageContainerPolicies is not implemented yet');
  }

  async manageUniversalPackages(params: ManageUniversalPackagesParams) {
    throw new Error('manageUniversalPackages is not implemented yet');
  }

  async createPackageDownloadReport(params: CreatePackageDownloadReportParams) {
    throw new Error('createPackageDownloadReport is not implemented yet');
  }

  async checkPackageDependencies(params: CheckPackageDependenciesParams) {
    throw new Error('checkPackageDependencies is not implemented yet');
  }
} 