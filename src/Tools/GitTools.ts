import { AzureDevOpsConfig } from '../Interfaces/AzureDevOps';
import { GitService } from '../Services/GitService';
import { formatMcpResponse, formatErrorResponse, McpResponse } from '../Interfaces/Common';
import {
  ListRepositoriesParams,
  GetRepositoryParams,
  CreateRepositoryParams,
  ListBranchesParams,
  SearchCodeParams,
  BrowseRepositoryParams,
  GetFileContentParams,
  GetCommitHistoryParams,
  ListPullRequestsParams,
  CreatePullRequestParams,
  GetPullRequestParams,
  GetPullRequestChangedFilesParams,
  GetPullRequestCommentsParams,
  ApprovePullRequestParams,
  MergePullRequestParams
} from '../Interfaces/CodeAndRepositories';
import getClassMethods from "../utils/getClassMethods";

export class GitTools {
  private gitService: GitService;

  constructor(config: AzureDevOpsConfig) {
    this.gitService = new GitService(config);
  }

  /**
   * List all repositories
   */
  public async listRepositories(params: ListRepositoriesParams): Promise<McpResponse> {
    try {
      const repositories = await this.gitService.listRepositories(params);
      return formatMcpResponse(repositories, `Found ${repositories.length} repositories`);
    } catch (error) {
      console.error('Error in listRepositories tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Get repository details
   */
  public async getRepository(params: GetRepositoryParams): Promise<McpResponse> {
    try {
      const repository = await this.gitService.getRepository(params);
      return formatMcpResponse(repository, `Repository details for ${repository.name}`);
    } catch (error) {
      console.error('Error in getRepository tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Create a repository
   */
  public async createRepository(params: CreateRepositoryParams): Promise<McpResponse> {
    try {
      const repository = await this.gitService.createRepository(params);
      return formatMcpResponse(repository, `Created repository: ${repository.name}`);
    } catch (error) {
      console.error('Error in createRepository tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * List branches
   */
  public async listBranches(params: ListBranchesParams): Promise<McpResponse> {
    try {
      const branches = await this.gitService.listBranches(params);
      return formatMcpResponse(branches, `Found ${branches.length} branches`);
    } catch (error) {
      console.error('Error in listBranches tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Search code
   */
  public async searchCode(params: SearchCodeParams): Promise<McpResponse> {
    try {
      const items = await this.gitService.searchCode(params);
      return formatMcpResponse(items, `Found ${items.length} matching files`);
    } catch (error) {
      console.error('Error in searchCode tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Browse repository
   */
  public async browseRepository(params: BrowseRepositoryParams): Promise<McpResponse> {
    try {
      const items = await this.gitService.browseRepository(params);
      return formatMcpResponse(items, `Found ${items.length} items in repository`);
    } catch (error) {
      console.error('Error in browseRepository tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Get file content
   */
  public async getFileContent(params: GetFileContentParams): Promise<McpResponse> {
    try {
      const file = await this.gitService.getFileContent(params);
      return formatMcpResponse(file, `Content of file: ${params.path}`);
    } catch (error) {
      console.error('Error in getFileContent tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Get commit history
   */
  public async getCommitHistory(params: GetCommitHistoryParams): Promise<McpResponse> {
    try {
      const commits = await this.gitService.getCommitHistory(params);
      return formatMcpResponse(commits, `Found ${commits.length} commits`);
    } catch (error) {
      console.error('Error in getCommitHistory tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * List pull requests
   */
  public async listPullRequests(params: ListPullRequestsParams): Promise<McpResponse> {
    try {
      const pullRequests = await this.gitService.getPullRequests(params);
      return formatMcpResponse(pullRequests, `Found ${pullRequests.length} pull requests`);
    } catch (error) {
      console.error('Error in listPullRequests tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Create pull request
   */
  public async createPullRequest(params: CreatePullRequestParams): Promise<McpResponse> {
    try {
      const pullRequest = await this.gitService.createPullRequest(params);
      return formatMcpResponse(pullRequest, `Created pull request: ${pullRequest.pullRequestId}`);
    } catch (error) {
      console.error('Error in createPullRequest tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Get pull request by ID
   */
  public async getPullRequest(params: GetPullRequestParams): Promise<McpResponse> {
    try {
      const pullRequest = await this.gitService.getPullRequest(params);
      return formatMcpResponse(pullRequest, `Pull request ${params.pullRequestId} details`);
    } catch (error) {
      console.error('Error in getPullRequest tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Get changed files in a pull request
   */
  public async getPullRequestChangedFiles(params: GetPullRequestChangedFilesParams): Promise<McpResponse> {
    try {
      const changes = await this.gitService.getPullRequestChangedFiles(params);
      return formatMcpResponse(changes, `Retrieved ${changes.changes?.length || 0} changed files for pull request ${params.pullRequestId}`);
    } catch (error) {
      console.error('Error in getPullRequestChangedFiles tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Get pull request comments
   */
  public async getPullRequestComments(params: GetPullRequestCommentsParams): Promise<McpResponse> {
    try {
      const comments = await this.gitService.getPullRequestComments(params);
      return formatMcpResponse(comments, `Retrieved comments for pull request ${params.pullRequestId}`);
    } catch (error) {
      console.error('Error in getPullRequestComments tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Approve pull request
   */
  public async approvePullRequest(params: ApprovePullRequestParams): Promise<McpResponse> {
    try {
      const result = await this.gitService.approvePullRequest(params);
      return formatMcpResponse(result, `Approved pull request ${params.pullRequestId}`);
    } catch (error) {
      console.error('Error in approvePullRequest tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Merge pull request
   */
  public async mergePullRequest(params: MergePullRequestParams): Promise<McpResponse> {
    try {
      const result = await this.gitService.mergePullRequest(params);
      return formatMcpResponse(result, `Merged pull request ${params.pullRequestId}`);
    } catch (error) {
      console.error('Error in mergePullRequest tool:', error);
      return formatErrorResponse(error);
    }
  }
}

export const GitToolMethods = getClassMethods(GitTools.prototype);