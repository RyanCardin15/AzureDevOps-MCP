import * as azdev from 'azure-devops-node-api';
import { Readable } from 'stream';
import { GitApi } from 'azure-devops-node-api/GitApi';
import { GitPullRequestQueryType } from 'azure-devops-node-api/interfaces/GitInterfaces';
import { CommentThreadStatus } from 'azure-devops-node-api/interfaces/GitInterfaces';
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
  GetPullRequestsParams,
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
      
      // This is a simplified implementation using item search
      // For more comprehensive code search, you'd use the Search API
      const items = await gitApi.getItems(
        params.repositoryId || "",
        undefined,
        undefined,
        undefined,
        true,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
      
      // Simple filter based on the search text and file extension
      let filteredItems = items;
      
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
      
      // Limit results if top is specified
      if (params.top && filteredItems.length > params.top) {
        filteredItems = filteredItems.slice(0, params.top);
      }
      
      return filteredItems;
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
      
      const items = await gitApi.getItems(
        params.repositoryId,
        undefined,
        params.path,
        undefined,
        true,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
      
      return items;
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
  public async getPullRequests(params: GetPullRequestsParams): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      
      // Create search criteria with proper types
      const searchCriteria: any = {
        repositoryId: params.repositoryId,
        creatorId: params.creatorId,
        reviewerId: params.reviewerId,
        sourceRefName: params.sourceRefName,
        targetRefName: params.targetRefName
      };
      
      // Convert string status to number if provided
      if (params.status) {
        if (params.status === 'active') searchCriteria.status = 1;
        else if (params.status === 'abandoned') searchCriteria.status = 2;
        else if (params.status === 'completed') searchCriteria.status = 3;
        else if (params.status === 'notSet') searchCriteria.status = 0;
        // 'all' doesn't need to be set
      }
      
      const pullRequests = await gitApi.getPullRequests(
        params.repositoryId,
        searchCriteria
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
        params.pullRequestId,
        this.config.project
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
          params.threadId,
          this.config.project
        );
        
        return thread;
      } else {
        const threads = await gitApi.getThreads(
          params.repositoryId,
          params.pullRequestId,
          this.config.project
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

  /**
   * Search commits in a repository
   */
  public async searchCommits(params: { 
    repositoryId: string; 
    projectId?: string; 
    searchCriteria?: any; 
    top?: number; 
  }): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      const project = params.projectId || this.config.project;
      
      const commits = await gitApi.getCommits(
        params.repositoryId,
        params.searchCriteria,
        project,
        params.top
      );
      
      return commits;
    } catch (error) {
      console.error(`Error searching commits in repository ${params.repositoryId}:`, error);
      throw error;
    }
  }

  /**
   * Get pull requests by commit
   */
  public async getPullRequestsByCommit(params: { 
    repositoryId: string; 
    commitId: string; 
    projectId?: string; 
  }): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      const project = params.projectId || this.config.project;
      
      const pullRequests = await gitApi.getPullRequestQuery(
        {
          queries: [{
            type: GitPullRequestQueryType.Commit,
            items: [params.commitId]
          }]
        },
        params.repositoryId,
        project
      );
      
      return pullRequests;
    } catch (error) {
      console.error(`Error getting pull requests for commit ${params.commitId}:`, error);
      throw error;
    }
  }

  /**
   * Create comment thread on pull request
   */
  public async createPullRequestThread(params: { 
    repositoryId: string; 
    pullRequestId: number;
    projectId?: string;
    comments: any[];
    status?: string;
  }): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      const project = params.projectId || this.config.project;
      
      // Convert string status to enum value
      let threadStatus = CommentThreadStatus.Active;
      if (params.status) {
        switch (params.status.toLowerCase()) {
          case 'active':
            threadStatus = CommentThreadStatus.Active;
            break;
          case 'fixed':
            threadStatus = CommentThreadStatus.Fixed;
            break;
          case 'wontfix':
            threadStatus = CommentThreadStatus.WontFix;
            break;
          case 'closed':
            threadStatus = CommentThreadStatus.Closed;
            break;
          case 'bydesign':
            threadStatus = CommentThreadStatus.ByDesign;
            break;
          case 'pending':
            threadStatus = CommentThreadStatus.Pending;
            break;
        }
      }

      const thread = await gitApi.createThread(
        {
          comments: params.comments,
          status: threadStatus
        },
        params.repositoryId,
        params.pullRequestId,
        project
      );
      
      return thread;
    } catch (error) {
      console.error(`Error creating thread on pull request ${params.pullRequestId}:`, error);
      throw error;
    }
  }

  /**
   * Update pull request thread status
   */
  public async updatePullRequestThread(params: { 
    repositoryId: string; 
    pullRequestId: number;
    threadId: number;
    projectId?: string;
    status: string;
  }): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      const project = params.projectId || this.config.project;
      
      // Convert string status to enum value
      let threadStatus = CommentThreadStatus.Active;
      switch (params.status.toLowerCase()) {
        case 'active':
          threadStatus = CommentThreadStatus.Active;
          break;
        case 'fixed':
          threadStatus = CommentThreadStatus.Fixed;
          break;
        case 'wontfix':
          threadStatus = CommentThreadStatus.WontFix;
          break;
        case 'closed':
          threadStatus = CommentThreadStatus.Closed;
          break;
        case 'bydesign':
          threadStatus = CommentThreadStatus.ByDesign;
          break;
        case 'pending':
          threadStatus = CommentThreadStatus.Pending;
          break;
      }

      const thread = await gitApi.updateThread(
        { status: threadStatus },
        params.repositoryId,
        params.pullRequestId,
        params.threadId,
        project
      );
      
      return thread;
    } catch (error) {
      console.error(`Error updating thread ${params.threadId}:`, error);
      throw error;
    }
  }

  /**
   * Get branches with user-specific information
   */
  public async getUserBranches(params: { 
    repositoryId: string; 
    projectId?: string; 
    userId?: string; 
  }): Promise<any> {
    try {
      const gitApi = await this.getGitApi();
      const project = params.projectId || this.config.project;
      
      // Get all branches first
      const branches = await gitApi.getBranches(params.repositoryId, project);
      
      // If userId is provided, we could filter by user contributions
      // For now, return all branches - getBranchStats is not available in the API
      return branches;
    } catch (error) {
      console.error(`Error getting user branches for repository ${params.repositoryId}:`, error);
      throw error;
    }
  }
}
