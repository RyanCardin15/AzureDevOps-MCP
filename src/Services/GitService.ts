import * as azdev from 'azure-devops-node-api';
import { Readable } from 'stream';
import { GitApi } from 'azure-devops-node-api/GitApi';
import { AzureDevOpsConfig } from '../Interfaces/AzureDevOps';
import { AzureDevOpsService } from './AzureDevOpsService';
import {
  ListRepositoriesParams,
  GetRepositoryParams,
  CreateRepositoryParams,
  ListBranchesParams,
  SearchCodeParams,
  BrowseRepositoryParams,
  GetFileContentParams,
  GetCommitHistoryParams,
  CreatePullRequestParams,
  GetPullRequestParams,
  GetPullRequestCommentsParams,
  ApprovePullRequestParams,
  MergePullRequestParams,
  GetCommitsParams,
  ListPullRequestsParams,
  CompletePullRequestParams
} from '../Interfaces/CodeAndRepositories';

export class GitService extends AzureDevOpsService {
  constructor(config: AzureDevOpsConfig) {
    super(config);
  }

  /**
   * Get the Git API client
   */
  private async getGitApi(): Promise<GitApi> {
    return await this.connection.getGitApi();
  }

  /**
   * List all repositories
   */
  public async listRepositories(params: ListRepositoriesParams): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      
      const repositories = await gitApi.getRepositories(
        params.projectId || this.config.project,
        params.includeHidden,
        params.includeAllUrls
      );
      
      return repositories;
    } catch (error) {
      console.error('Error listing repositories:', error);
      throw error;
    }
  }

  /**
   * Get repository details
   */
  public async getRepository(params: GetRepositoryParams): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      
      const repository = await gitApi.getRepository(
        params.repositoryId,
        params.projectId || this.config.project
      );
      
      return repository;
    } catch (error) {
      console.error(`Error getting repository ${params.repositoryId}:`, error);
      throw error;
    }
  }

  /**
   * Create a repository
   */
  public async createRepository(params: CreateRepositoryParams): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      
      const repository = await gitApi.createRepository({
        name: params.name,
        project: {
          id: params.projectId || this.config.project
        }
      }, params.projectId || this.config.project);
      
      return repository;
    } catch (error) {
      console.error(`Error creating repository ${params.name}:`, error);
      throw error;
    }
  }

  /**
   * List branches
   */
  public async listBranches(params: ListBranchesParams): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      
      const branches = await gitApi.getBranches(
        params.repositoryId,
        params.filter
      );
      
      if (params.top && branches.length > params.top) {
        return branches.slice(0, params.top);
      }
      
      return branches;
    } catch (error) {
      console.error(`Error listing branches for repository ${params.repositoryId}:`, error);
      throw error;
    }
  }

  /**
   * Search code (Note: This uses a simplified approach as the full-text search API
   * might require additional setup)
   */
  public async searchCode(params: SearchCodeParams): Promise<any> {
    try {
      const gitApi = await this.getGitApi();

      // Full recursion (120) to traverse all directories
      const items = await gitApi.getItems(
        params.repositoryId || "",
        undefined,
        undefined,
        120, // VersionControlRecursionType.Full
        false,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );

      // Only files, no folders
      let filteredItems = items.filter(item => !item.isFolder);

      if (params.searchText) {
        filteredItems = filteredItems.filter(item =>
          item.path && item.path.toLowerCase().includes(params.searchText.toLowerCase())
        );
      }

      if (params.fileExtension) {
        filteredItems = filteredItems.filter(item =>
          item.path && item.path.endsWith(params.fileExtension || "")
        );
      }

      if (params.top && filteredItems.length > params.top) {
        filteredItems = filteredItems.slice(0, params.top);
      }

      // Return only the fields Claude needs
      return filteredItems.map(item => ({
        path: item.path,
        isFolder: false
      }));
    } catch (error) {
      console.error(`Error searching code in repository ${params.repositoryId}:`, error);
      throw error;
    }
  }

  /**
   * Browse repository
   */
  public async browseRepository(params: BrowseRepositoryParams): Promise<any> {
    try {
      const gitApi = await this.getGitApi();

      // OneLevel (1) recursion — return direct children of the given path
      const items = await gitApi.getItems(
        params.repositoryId,
        undefined,
        params.path,
        1, // VersionControlRecursionType.OneLevel
        false,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );

      // Exclude the folder itself (the root entry), return only its children
      // Return only the fields Claude needs
      return items
        .filter(item => item.path !== params.path)
        .map(item => ({
          path: item.path,
          isFolder: item.isFolder ?? false
        }));
    } catch (error) {
      console.error(`Error browsing repository ${params.repositoryId}:`, error);
      throw error;
    }
  }

  /**
   * Get file content
   */
  public async getFileContent(params: GetFileContentParams): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      
      // Get the file content as a stream
      const content = await gitApi.getItemContent(
        params.repositoryId,
        params.path,
        undefined,
        undefined
      );
      
      let fileContent = '';
      
      // Handle different content types
      if (Buffer.isBuffer(content)) {
        fileContent = content.toString('utf8');
      } else if (typeof content === 'string') {
        fileContent = content;
      } else if (content && typeof content === 'object' && 'pipe' in content && typeof content.pipe === 'function') {
        // Handle stream content
        const chunks: Buffer[] = [];
        const stream = content as Readable;
        
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            stream.destroy();
            reject(new Error(`Stream timeout for ${params.path}`));
          }, 30000);

          stream.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
          });
          
          stream.on('end', () => {
            clearTimeout(timeout);
            const buffer = Buffer.concat(chunks);
            const fileContent = buffer.toString('utf8');
            resolve({
              content: fileContent
            });
          });
          
          stream.on('error', (error) => {
            clearTimeout(timeout);
            console.error(`Error reading stream for ${params.path}:`, error);
            reject(error);
          });
        });
      } else {
        // If it's some other type, return a placeholder
        fileContent = "[Content not available in this format]";
      }
      
      return {
        content: fileContent
      };
    } catch (error) {
      console.error(`Error getting file content for ${params.path}:`, error);
      throw error;
    }
  }

  /**
   * Get commit history
   */
  public async getCommitHistory(params: GetCommitHistoryParams): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      
      // Get commits without search criteria
      const commits = await gitApi.getCommits(
        params.repositoryId,
        {} // Empty search criteria
      );
      
      // Filter by path if provided
      let filteredCommits = commits;
      if (params.itemPath) {
        filteredCommits = commits.filter(commit => 
          commit.comment && commit.comment.includes(params.itemPath || "")
        );
      }
      
      // Apply pagination if specified
      if (params.skip && params.skip > 0) {
        filteredCommits = filteredCommits.slice(params.skip);
      }
      
      if (params.top && params.top > 0) {
        filteredCommits = filteredCommits.slice(0, params.top);
      }
      
      return filteredCommits;
    } catch (error) {
      console.error(`Error getting commit history for repository ${params.repositoryId}:`, error);
      throw error;
    }
  }

  /**
   * Get commits
   */
  public async getCommits(params: GetCommitsParams): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      
      // Get commits without search criteria
      const commits = await gitApi.getCommits(
        params.repositoryId,
        {} // Empty search criteria
      );
      
      // Filter by path if provided
      let filteredCommits = commits;
      if (params.path) {
        filteredCommits = commits.filter(commit => 
          commit.comment && commit.comment.includes(params.path || "")
        );
      }
      
      return filteredCommits;
    } catch (error) {
      console.error(`Error getting commits for repository ${params.repositoryId}:`, error);
      throw error;
    }
  }

  /**
   * Get pull requests
   */
  public async getPullRequests(params: ListPullRequestsParams): Promise<any> {
    try {
      const gitApi = await this.getGitApi();

      // Create search criteria with proper types
      const searchCriteria: any = {
        repositoryId: params.repositoryId,
        creatorId: params.creatorId,
        reviewerId: params.reviewerId,
      };

      // Convert string status to enum value
      if (params.status) {
        if (params.status === 'active')    searchCriteria.status = 1;
        else if (params.status === 'abandoned') searchCriteria.status = 2;
        else if (params.status === 'completed') searchCriteria.status = 3;
        else if (params.status === 'notSet')    searchCriteria.status = 0;
        else if (params.status === 'all')       searchCriteria.status = 4;
      }

      const pullRequests = await gitApi.getPullRequests(
        params.repositoryId,
        searchCriteria,
        undefined,   // maxCommentLength
        params.skip,
        params.top
      );
      
      return pullRequests;
    } catch (error) {
      console.error(`Error getting pull requests for repository ${params.repositoryId}:`, error);
      throw error;
    }
  }

  /**
   * Create pull request
   */
  public async createPullRequest(params: CreatePullRequestParams): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      
      const pullRequest = {
        sourceRefName: params.sourceRefName,
        targetRefName: params.targetRefName,
        title: params.title,
        description: params.description,
        reviewers: params.reviewers ? params.reviewers.map(id => ({ id })) : undefined
      };
      
      const createdPullRequest = await gitApi.createPullRequest(
        pullRequest,
        params.repositoryId,
        this.config.project
      );
      
      return createdPullRequest;
    } catch (error) {
      console.error('Error creating pull request:', error);
      throw error;
    }
  }

  /**
   * Get pull request by ID
   */
  public async getPullRequest(params: GetPullRequestParams): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      
      const pullRequest = await gitApi.getPullRequest(
        params.repositoryId,
        params.pullRequestId
        // no project — server resolves repo by ID regardless of which project it belongs to
      );
      
      return pullRequest;
    } catch (error) {
      console.error(`Error getting pull request ${params.pullRequestId}:`, error);
      throw error;
    }
  }

  /**
   * Get pull request comments
   */
  public async getPullRequestComments(params: GetPullRequestCommentsParams): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      
      if (params.threadId) {
        const thread = await gitApi.getPullRequestThread(
          params.repositoryId,
          params.pullRequestId,
          params.threadId
          // no project — server resolves repo by ID regardless of which project it belongs to
        );

        return thread;
      } else {
        const threads = await gitApi.getThreads(
          params.repositoryId,
          params.pullRequestId
          // no project — server resolves repo by ID regardless of which project it belongs to
        );
        
        return threads;
      }
    } catch (error) {
      console.error(`Error getting comments for pull request ${params.pullRequestId}:`, error);
      throw error;
    }
  }

  /**
   * Approve pull request
   */
  public async approvePullRequest(params: ApprovePullRequestParams): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      
      const vote = {
        vote: 10
      };
      
      const result = await gitApi.createPullRequestReviewer(
        vote,
        params.repositoryId,
        params.pullRequestId,
        "me",
        this.config.project
      );
      
      return result;
    } catch (error) {
      console.error(`Error approving pull request ${params.pullRequestId}:`, error);
      throw error;
    }
  }

  /**
   * Merge pull request
   */
  public async mergePullRequest(params: MergePullRequestParams): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      
      // Convert string merge strategy to number
      let mergeStrategy = 1; // Default to noFastForward
      if (params.mergeStrategy === 'rebase') mergeStrategy = 2;
      else if (params.mergeStrategy === 'rebaseMerge') mergeStrategy = 3;
      else if (params.mergeStrategy === 'squash') mergeStrategy = 4;
      
      const result = await gitApi.updatePullRequest(
        { 
          status: 3, // 3 = completed in PullRequestStatus enum
          completionOptions: {
            mergeStrategy: mergeStrategy
          }
        },
        params.repositoryId,
        params.pullRequestId,
        this.config.project
      );
      
      return result;
    } catch (error) {
      console.error(`Error merging pull request ${params.pullRequestId}:`, error);
      throw error;
    }
  }

  /**
   * Complete pull request
   */
  public async completePullRequest(params: CompletePullRequestParams): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      
      // Get the current pull request
      const pullRequest = await gitApi.getPullRequestById(params.pullRequestId);
      
      // Convert string merge strategy to number
      let mergeStrategy = 1; // Default to noFastForward
      if (params.mergeStrategy === 'rebase') mergeStrategy = 2;
      else if (params.mergeStrategy === 'rebaseMerge') mergeStrategy = 3;
      else if (params.mergeStrategy === 'squash') mergeStrategy = 4;
      
      // Update the pull request to completed status
      const updatedPullRequest = await gitApi.updatePullRequest(
        {
          status: 3, // 3 = completed in PullRequestStatus enum
          completionOptions: {
            mergeStrategy: mergeStrategy,
            deleteSourceBranch: params.deleteSourceBranch
          }
        },
        params.repositoryId,
        params.pullRequestId
      );
      
      return updatedPullRequest;
    } catch (error) {
      console.error(`Error completing pull request ${params.pullRequestId}:`, error);
      throw error;
    }
  }
}
