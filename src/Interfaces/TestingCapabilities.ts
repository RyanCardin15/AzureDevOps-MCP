export interface RunAutomatedTestsParams {
  projectId?: string;
  testSuiteId?: number;
  testPlanId?: number;
  testEnvironment?: string;
  parallelExecution?: boolean;
}

export interface GetTestAutomationStatusParams {
  projectId?: string;
  testRunId: number;
}

export interface ConfigureTestAgentsParams {
  agentName: string;
  poolId?: number;
  capabilities?: Record<string, any>;
  enabled?: boolean;
}

export interface CreateTestDataGeneratorParams {
  name: string;
  dataSchema: Record<string, any>;
  recordCount?: number;
}

export interface ManageTestEnvironmentsParams {
  environmentName: string;
  action: 'create' | 'update' | 'delete';
  properties?: Record<string, any>;
}

export interface GetTestFlakinessParams {
  testId?: number;
  testRunIds?: number[];
  timeRange?: string;
}

export interface GetTestGapAnalysisParams {
  areaPath?: string;
  codeChangesOnly?: boolean;
}

export interface RunTestImpactAnalysisParams {
  buildId: number;
  changedFiles?: string[];
}

export interface GetTestHealthDashboardParams {
  timeRange?: string;
  includeTrends?: boolean;
}

export interface RunTestOptimizationParams {
  testPlanId: number;
  optimizationGoal: 'time' | 'coverage' | 'reliability';
}

export interface CreateExploratorySessionsParams {
  projectId?: string;
  title: string;
  description?: string;
  areaPath?: string;
}

export interface RecordExploratoryTestResultsParams {
  sessionId: number;
  findings: string[];
  attachments?: any[];
}

export interface ConvertFindingsToWorkItemsParams {
  projectId?: string;
  sessionId: number;
  findingIds: number[];
  workItemType?: string;
}

export interface GetExploratoryTestStatisticsParams {
  projectId?: string;
  timeRange?: string;
  userId?: string;
} 