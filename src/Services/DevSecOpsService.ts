import { AzureDevOpsConfig } from "../Interfaces/AzureDevOps";
import { AzureDevOpsService } from "./AzureDevOpsService";
import {
  RunSecurityScanParams,
  GetSecurityScanResultsParams,
  TrackSecurityVulnerabilitiesParams,
  GenerateSecurityComplianceParams,
  IntegrateSarifResultsParams,
  RunComplianceChecksParams,
  GetComplianceStatusParams,
  CreateComplianceReportParams,
  ManageSecurityPoliciesParams,
  TrackSecurityAwarenessParams,
  RotateSecretsParams,
  AuditSecretUsageParams,
  VaultIntegrationParams
} from "../Interfaces/DevSecOps";

export class DevSecOpsService extends AzureDevOpsService {
  constructor(config: AzureDevOpsConfig) {
    super(config);
  }

  async runSecurityScan(params: RunSecurityScanParams) {
    throw new Error('runSecurityScan requires Azure Security Center/Defender for DevOps APIs which are not available in the basic azure-devops-node-api.');
  }

  async getSecurityScanResults(params: GetSecurityScanResultsParams) {
    throw new Error('getSecurityScanResults requires Azure Security Center/Defender for DevOps APIs which are not available in the basic azure-devops-node-api.');
  }

  async trackSecurityVulnerabilities(params: TrackSecurityVulnerabilitiesParams) {
    throw new Error('trackSecurityVulnerabilities requires Azure Security Center/Defender for DevOps APIs which are not available in the basic azure-devops-node-api.');
  }

  async generateSecurityCompliance(params: GenerateSecurityComplianceParams) {
    throw new Error('generateSecurityCompliance requires Azure Security Center/Defender compliance APIs which are not available in the basic azure-devops-node-api.');
  }

  async integrateSarifResults(params: IntegrateSarifResultsParams) {
    throw new Error('integrateSarifResults requires custom SARIF processing and integration APIs which are not available in the basic azure-devops-node-api.');
  }

  async runComplianceChecks(params: RunComplianceChecksParams) {
    throw new Error('runComplianceChecks requires Azure Policy/Compliance APIs which are not available in the basic azure-devops-node-api.');
  }

  async getComplianceStatus(params: GetComplianceStatusParams) {
    throw new Error('getComplianceStatus requires Azure Policy/Compliance APIs which are not available in the basic azure-devops-node-api.');
  }

  async createComplianceReport(params: CreateComplianceReportParams) {
    throw new Error('createComplianceReport requires Azure Policy/Compliance reporting APIs which are not available in the basic azure-devops-node-api.');
  }

  async manageSecurityPolicies(params: ManageSecurityPoliciesParams) {
    throw new Error('manageSecurityPolicies requires Azure Policy APIs which are not available in the basic azure-devops-node-api.');
  }

  async trackSecurityAwareness(params: TrackSecurityAwarenessParams) {
    throw new Error('trackSecurityAwareness requires custom training tracking APIs which are not available in the basic azure-devops-node-api.');
  }

  async rotateSecrets(params: RotateSecretsParams) {
    throw new Error('rotateSecrets requires Azure Key Vault management APIs which are not available in the basic azure-devops-node-api.');
  }

  async auditSecretUsage(params: AuditSecretUsageParams) {
    throw new Error('auditSecretUsage requires Azure Key Vault monitoring APIs which are not available in the basic azure-devops-node-api.');
  }

  async vaultIntegration(params: VaultIntegrationParams) {
    throw new Error('vaultIntegration requires Azure Key Vault REST APIs which are not available in the basic azure-devops-node-api.');
  }
} 