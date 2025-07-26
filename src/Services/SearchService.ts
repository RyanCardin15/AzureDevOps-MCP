import { AzureDevOpsConfig } from '../Interfaces/AzureDevOps';
import { AzureDevOpsService } from './AzureDevOpsService';
import {
  SearchCodeParams,
  SearchWorkItemsParams,
  SearchWikiParams,
  GlobalSearchParams,
  AdvancedCodeSearchParams, 
  AdvancedWorkItemSearchParams,
  AdvancedWikiSearchParams,
  SearchResponse,
  CodeSearchResult,
  WorkItemSearchResult,
  WikiSearchResult
} from '../Interfaces/Search';
import * as azdev from 'azure-devops-node-api';

export class SearchService extends AzureDevOpsService {
  private searchBaseUrl: string;

  constructor(config: AzureDevOpsConfig) {
    super(config);
    // Azure DevOps Search uses a different base URL
    const orgUrl = config.orgUrl.replace('dev.azure.com', 'almsearch.dev.azure.com');
    this.searchBaseUrl = orgUrl;
  }

  /**
   * Search for code across repositories
   */
  async searchCode(params: SearchCodeParams): Promise<SearchResponse<CodeSearchResult>> {
    try {
      const project = params.projectId || this.config.project;
      const searchUrl = `${this.searchBaseUrl}/${project}/_apis/search/codesearchresults?api-version=7.1`;

      const requestBody = {
        searchText: params.searchText,
        $skip: params.skip || 0,
        $top: params.top || 25,
        includeFacets: params.includeFacets || false,
        filters: this.buildCodeSearchFilters(params),
        $orderBy: params.orderBy || []
      };

      const response = await this.makeSearchRequest(searchUrl, requestBody);
      return response as SearchResponse<CodeSearchResult>;
    } catch (error) {
      console.error('Error searching code:', error);
      throw error;
    }
  }

  /**
   * Search for work items
   */
  async searchWorkItems(params: SearchWorkItemsParams): Promise<SearchResponse<WorkItemSearchResult>> {
    try {
      const project = params.projectId || this.config.project;
      const searchUrl = `${this.searchBaseUrl}/${project}/_apis/search/workitemsearchresults?api-version=7.1`;

      const requestBody = {
        searchText: params.searchText,
        $skip: params.skip || 0,
        $top: params.top || 25,
        includeFacets: params.includeFacets || false,
        filters: this.buildWorkItemSearchFilters(params),
        $orderBy: params.orderBy || []
      };

      const response = await this.makeSearchRequest(searchUrl, requestBody);
      return response as SearchResponse<WorkItemSearchResult>;
    } catch (error) {
      console.error('Error searching work items:', error);
      throw error;
    }
  }

  /**
   * Search wiki content
   */
  async searchWiki(params: SearchWikiParams): Promise<SearchResponse<WikiSearchResult>> {
    try {
      const project = params.projectId || this.config.project;
      const searchUrl = `${this.searchBaseUrl}/${project}/_apis/search/wikisearchresults?api-version=7.1`;

      const requestBody = {
        searchText: params.searchText,
        $skip: params.skip || 0,
        $top: params.top || 25,
        includeFacets: params.includeFacets || false,
        filters: this.buildWikiSearchFilters(params),
        $orderBy: params.orderBy || []
      };

      const response = await this.makeSearchRequest(searchUrl, requestBody);
      return response as SearchResponse<WikiSearchResult>;
    } catch (error) {
      console.error('Error searching wiki:', error);
      throw error;
    }
  }

  /**
   * Perform a global search across multiple entity types
   */
  async globalSearch(params: GlobalSearchParams): Promise<any> {
    try {
      // Global search combines results from multiple search endpoints
      const results: any = {
        code: null,
        workItems: null,
        wiki: null
      };

      const searchFilters = params.searchFilters || {};
      const entityTypes = searchFilters.entityTypes || ['code', 'workItems', 'wiki'];

      // Search code if requested
      if (entityTypes.includes('code')) {
        try {
          results.code = await this.searchCode({
            searchText: params.searchText,
            skip: params.skip,
            top: params.top,
            includeFacets: params.includeFacets
          });
        } catch (error) {
          console.warn('Code search failed:', error);
        }
      }

      // Search work items if requested
      if (entityTypes.includes('workItems')) {
        try {
          results.workItems = await this.searchWorkItems({
            searchText: params.searchText,
            skip: params.skip,
            top: params.top,
            includeFacets: params.includeFacets
          });
        } catch (error) {
          console.warn('Work item search failed:', error);
        }
      }

      // Search wiki if requested
      if (entityTypes.includes('wiki')) {
        try {
          results.wiki = await this.searchWiki({
            searchText: params.searchText,
            skip: params.skip,
            top: params.top,
            includeFacets: params.includeFacets
          });
        } catch (error) {
          console.warn('Wiki search failed:', error);
        }
      }

      return results;
    } catch (error) {
      console.error('Error performing global search:', error);
      throw error;
    }
  }

  /**
   * Advanced code search with additional filters
   */
  async advancedCodeSearch(params: AdvancedCodeSearchParams): Promise<SearchResponse<CodeSearchResult>> {
    // Enhance search text with advanced filters
    let enhancedSearchText = params.searchText;

    if (params.authorFilters?.length) {
      enhancedSearchText += ` author:${params.authorFilters.join(' author:')}`;
    }

    if (params.languageFilters?.length) {
      enhancedSearchText += ` ext:${params.languageFilters.join(' ext:')}`;
    }

    if (params.modifiedAfter) {
      enhancedSearchText += ` modified>=${params.modifiedAfter}`;
    }

    if (params.modifiedBefore) {
      enhancedSearchText += ` modified<=${params.modifiedBefore}`;
    }

    return this.searchCode({
      ...params,
      searchText: enhancedSearchText
    });
  }

  /**
   * Advanced work item search with additional filters
   */
  async advancedWorkItemSearch(params: AdvancedWorkItemSearchParams): Promise<SearchResponse<WorkItemSearchResult>> {
    const enhancedParams = { ...params };

    // Add advanced filters to the filters object
    const filters: any = this.buildWorkItemSearchFilters(params);

    if (params.createdBy) {
      filters['System.CreatedBy'] = [params.createdBy];
    }

    if (params.modifiedBy) {
      filters['System.ChangedBy'] = [params.modifiedBy];
    }

    if (params.tags?.length) {
      filters['System.Tags'] = params.tags;
    }

    if (params.priority?.length) {
      filters['Microsoft.VSTS.Common.Priority'] = params.priority;
    }

    if (params.severity?.length) {
      filters['Microsoft.VSTS.Common.Severity'] = params.severity;
    }

    // Build date-based search text enhancements
    let enhancedSearchText = params.searchText;

    if (params.createdAfter) {
      enhancedSearchText += ` created>=${params.createdAfter}`;
    }

    if (params.createdBefore) {
      enhancedSearchText += ` created<=${params.createdBefore}`;
    }

    if (params.modifiedAfter) {
      enhancedSearchText += ` modified>=${params.modifiedAfter}`;
    }

    if (params.modifiedBefore) {
      enhancedSearchText += ` modified<=${params.modifiedBefore}`;
    }

    return this.searchWorkItems({
      ...enhancedParams,
      searchText: enhancedSearchText
    });
  }

  /**
   * Advanced wiki search with additional filters
   */
  async advancedWikiSearch(params: AdvancedWikiSearchParams): Promise<SearchResponse<WikiSearchResult>> {
    let enhancedSearchText = params.searchText;

    if (params.author) {
      enhancedSearchText += ` author:${params.author}`;
    }

    if (params.modifiedAfter) {
      enhancedSearchText += ` modified>=${params.modifiedAfter}`;
    }

    if (params.modifiedBefore) {
      enhancedSearchText += ` modified<=${params.modifiedBefore}`;
    }

    return this.searchWiki({
      ...params,
      searchText: enhancedSearchText
    });
  }

  /**
   * Build filters for code search
   */
  private buildCodeSearchFilters(params: SearchCodeParams): any {
    const filters: any = {};

    if (params.projectId) {
      filters.Project = [params.projectId];
    }

    if (params.repositoryId) {
      filters.Repository = [params.repositoryId];
    }

    if (params.branchName) {
      filters.Branch = [params.branchName];
    }

    if (params.path) {
      filters.Path = [params.path];
    }

    if (params.codeElement?.length) {
      filters.CodeElement = params.codeElement;
    }

    return filters;
  }

  /**
   * Build filters for work item search
   */
  private buildWorkItemSearchFilters(params: SearchWorkItemsParams): any {
    const filters: any = {};

    if (params.projectId) {
      filters['System.TeamProject'] = [params.projectId];
    }

    if (params.areaPath) {
      filters['System.AreaPath'] = [params.areaPath];
    }

    if (params.workItemTypes?.length) {
      filters['System.WorkItemType'] = params.workItemTypes;
    }

    if (params.states?.length) {
      filters['System.State'] = params.states;
    }

    if (params.assignedTo) {
      filters['System.AssignedTo'] = [params.assignedTo];
    }

    return filters;
  }

  /**
   * Build filters for wiki search
   */
  private buildWikiSearchFilters(params: SearchWikiParams): any {
    const filters: any = {};

    if (params.projectId) {
      filters.Project = [params.projectId];
    }

    if (params.wikiId) {
      filters.Wiki = [params.wikiId];
    }

    return filters;
  }

  /**
   * Make HTTP request to search API
   */
  private async makeSearchRequest(url: string, body: any): Promise<any> {
    const connection = this.connection;
    
    // Get the auth handler from the connection
    const authHandler = connection.authHandler;
    
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add authorization header
    if (authHandler && typeof authHandler.prepareRequest === 'function') {
      const requestOptions: any = { headers };
      authHandler.prepareRequest(requestOptions);
      Object.assign(headers, requestOptions.headers);
    }

    try {
      // Use Node.js fetch or a similar HTTP client
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Search API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Search request failed:', error);
      
      // Fallback: return empty results if search API is not available
      return {
        results: [],
        count: 0,
        facets: [],
        infoCode: 1 // Indicates search service unavailable
      };
    }
  }
}