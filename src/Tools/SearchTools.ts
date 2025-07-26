import { AzureDevOpsConfig } from '../Interfaces/AzureDevOps';
import { SearchService } from '../Services/SearchService';
import { formatMcpResponse, formatErrorResponse, McpResponse } from '../Interfaces/Common';
import {
  SearchCodeParams,
  SearchWorkItemsParams,
  SearchWikiParams,
  GlobalSearchParams,
  AdvancedCodeSearchParams,
  AdvancedWorkItemSearchParams,
  AdvancedWikiSearchParams
} from '../Interfaces/Search';
import getClassMethods from '../utils/getClassMethods';

export class SearchTools {
  private searchService: SearchService;

  constructor(config: AzureDevOpsConfig) {
    this.searchService = new SearchService(config);
  }

  /**
   * Search for code across repositories
   */
  async searchCode(params: SearchCodeParams): Promise<McpResponse> {
    try {
      const result = await this.searchService.searchCode(params);
      const resultCount = result.count || result.results?.length || 0;
      
      let content = `Found ${resultCount} code search results for "${params.searchText}"`;
      
      if (result.results && result.results.length > 0) {
        content += '\n\nTop results:';
        result.results.slice(0, 10).forEach((item, index) => {
          content += `\n${index + 1}. ${item.fileName} (${item.repository.name})`;
          content += `\n   Path: ${item.path}`;
          if (item.contentMatches && item.contentMatches.length > 0) {
            content += `\n   Matches: ${item.contentMatches.length} match(es)`;
          }
        });
      }

      if (result.facets && result.facets.length > 0) {
        content += '\n\nSearch facets:';
        result.facets.forEach(facet => {
          content += `\n- ${facet.name}: ${facet.counts.map(c => `${c.name} (${c.count})`).join(', ')}`;
        });
      }

      return formatMcpResponse(result, content);
    } catch (error) {
      console.error('Error in searchCode tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Search for work items
   */
  async searchWorkItems(params: SearchWorkItemsParams): Promise<McpResponse> {
    try {
      const result = await this.searchService.searchWorkItems(params);
      const resultCount = result.count || result.results?.length || 0;
      
      let content = `Found ${resultCount} work item search results for "${params.searchText}"`;
      
      if (result.results && result.results.length > 0) {
        content += '\n\nTop results:';
        result.results.slice(0, 10).forEach((item, index) => {
          const title = item.fields['System.Title'] || 'No title';
          const id = item.fields['System.Id'] || 'Unknown ID';
          const workItemType = item.fields['System.WorkItemType'] || 'Unknown type';
          const state = item.fields['System.State'] || 'Unknown state';
          
          content += `\n${index + 1}. [${id}] ${title}`;
          content += `\n   Type: ${workItemType}, State: ${state}`;
          content += `\n   Project: ${item.project.name}`;
        });
      }

      if (result.facets && result.facets.length > 0) {
        content += '\n\nSearch facets:';
        result.facets.forEach(facet => {
          content += `\n- ${facet.name}: ${facet.counts.map(c => `${c.name} (${c.count})`).join(', ')}`;
        });
      }

      return formatMcpResponse(result, content);
    } catch (error) {
      console.error('Error in searchWorkItems tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Search wiki content
   */
  async searchWiki(params: SearchWikiParams): Promise<McpResponse> {
    try {
      const result = await this.searchService.searchWiki(params);
      const resultCount = result.count || result.results?.length || 0;
      
      let content = `Found ${resultCount} wiki search results for "${params.searchText}"`;
      
      if (result.results && result.results.length > 0) {
        content += '\n\nTop results:';
        result.results.slice(0, 10).forEach((item, index) => {
          content += `\n${index + 1}. ${item.fileName}`;
          content += `\n   Path: ${item.path}`;
          content += `\n   Wiki: ${item.wiki.name}`;
          content += `\n   Project: ${item.project.name}`;
          if (item.contentMatches && item.contentMatches.length > 0) {
            content += `\n   Matches: ${item.contentMatches.length} match(es)`;
          }
        });
      }

      if (result.facets && result.facets.length > 0) {
        content += '\n\nSearch facets:';
        result.facets.forEach(facet => {
          content += `\n- ${facet.name}: ${facet.counts.map(c => `${c.name} (${c.count})`).join(', ')}`;
        });
      }

      return formatMcpResponse(result, content);
    } catch (error) {
      console.error('Error in searchWiki tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Perform a global search across multiple entity types
   */
  async globalSearch(params: GlobalSearchParams): Promise<McpResponse> {
    try {
      const result = await this.searchService.globalSearch(params);
      
      let content = `Global search results for "${params.searchText}":`;
      let totalResults = 0;

      if (result.code && result.code.results) {
        const codeCount = result.code.results.length;
        totalResults += codeCount;
        content += `\n\nCode: ${codeCount} results`;
        if (codeCount > 0) {
          content += result.code.results.slice(0, 3).map((item: any, index: number) => 
            `\n  ${index + 1}. ${item.fileName} (${item.repository.name})`
          ).join('');
        }
      }

      if (result.workItems && result.workItems.results) {
        const workItemCount = result.workItems.results.length;
        totalResults += workItemCount;
        content += `\n\nWork Items: ${workItemCount} results`;
        if (workItemCount > 0) {
          content += result.workItems.results.slice(0, 3).map((item: any, index: number) => {
            const title = item.fields['System.Title'] || 'No title';
            const id = item.fields['System.Id'] || 'Unknown ID';
            return `\n  ${index + 1}. [${id}] ${title}`;
          }).join('');
        }
      }

      if (result.wiki && result.wiki.results) {
        const wikiCount = result.wiki.results.length;
        totalResults += wikiCount;
        content += `\n\nWiki: ${wikiCount} results`;
        if (wikiCount > 0) {
          content += result.wiki.results.slice(0, 3).map((item: any, index: number) => 
            `\n  ${index + 1}. ${item.fileName} (${item.wiki.name})`
          ).join('');
        }
      }

      content = `Global search found ${totalResults} total results for "${params.searchText}":` + content.substring(content.indexOf('\n'));

      return formatMcpResponse(result, content);
    } catch (error) {
      console.error('Error in globalSearch tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Advanced code search with additional filters
   */
  async advancedCodeSearch(params: AdvancedCodeSearchParams): Promise<McpResponse> {
    try {
      const result = await this.searchService.advancedCodeSearch(params);
      const resultCount = result.count || result.results?.length || 0;
      
      let content = `Advanced code search found ${resultCount} results for "${params.searchText}"`;
      
      // Add filter information
      const appliedFilters = [];
      if (params.languageFilters?.length) appliedFilters.push(`Languages: ${params.languageFilters.join(', ')}`);
      if (params.authorFilters?.length) appliedFilters.push(`Authors: ${params.authorFilters.join(', ')}`);
      if (params.modifiedAfter) appliedFilters.push(`Modified after: ${params.modifiedAfter}`);
      if (params.modifiedBefore) appliedFilters.push(`Modified before: ${params.modifiedBefore}`);
      
      if (appliedFilters.length > 0) {
        content += `\nFilters applied: ${appliedFilters.join(', ')}`;
      }
      
      if (result.results && result.results.length > 0) {
        content += '\n\nTop results:';
        result.results.slice(0, 10).forEach((item, index) => {
          content += `\n${index + 1}. ${item.fileName} (${item.repository.name})`;
          content += `\n   Path: ${item.path}`;
          if (item.contentMatches && item.contentMatches.length > 0) {
            content += `\n   Matches: ${item.contentMatches.length} match(es)`;
          }
        });
      }

      return formatMcpResponse(result, content);
    } catch (error) {
      console.error('Error in advancedCodeSearch tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Advanced work item search with additional filters
   */
  async advancedWorkItemSearch(params: AdvancedWorkItemSearchParams): Promise<McpResponse> {
    try {
      const result = await this.searchService.advancedWorkItemSearch(params);
      const resultCount = result.count || result.results?.length || 0;
      
      let content = `Advanced work item search found ${resultCount} results for "${params.searchText}"`;
      
      // Add filter information
      const appliedFilters = [];
      if (params.createdBy) appliedFilters.push(`Created by: ${params.createdBy}`);
      if (params.modifiedBy) appliedFilters.push(`Modified by: ${params.modifiedBy}`);
      if (params.tags?.length) appliedFilters.push(`Tags: ${params.tags.join(', ')}`);
      if (params.priority?.length) appliedFilters.push(`Priority: ${params.priority.join(', ')}`);
      if (params.severity?.length) appliedFilters.push(`Severity: ${params.severity.join(', ')}`);
      
      if (appliedFilters.length > 0) {
        content += `\nFilters applied: ${appliedFilters.join(', ')}`;
      }
      
      if (result.results && result.results.length > 0) {
        content += '\n\nTop results:';
        result.results.slice(0, 10).forEach((item, index) => {
          const title = item.fields['System.Title'] || 'No title';
          const id = item.fields['System.Id'] || 'Unknown ID';
          const workItemType = item.fields['System.WorkItemType'] || 'Unknown type';
          const state = item.fields['System.State'] || 'Unknown state';
          
          content += `\n${index + 1}. [${id}] ${title}`;
          content += `\n   Type: ${workItemType}, State: ${state}`;
          content += `\n   Project: ${item.project.name}`;
        });
      }

      return formatMcpResponse(result, content);
    } catch (error) {
      console.error('Error in advancedWorkItemSearch tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Advanced wiki search with additional filters
   */
  async advancedWikiSearch(params: AdvancedWikiSearchParams): Promise<McpResponse> {
    try {
      const result = await this.searchService.advancedWikiSearch(params);
      const resultCount = result.count || result.results?.length || 0;
      
      let content = `Advanced wiki search found ${resultCount} results for "${params.searchText}"`;
      
      // Add filter information
      const appliedFilters = [];
      if (params.author) appliedFilters.push(`Author: ${params.author}`);
      if (params.modifiedAfter) appliedFilters.push(`Modified after: ${params.modifiedAfter}`);
      if (params.modifiedBefore) appliedFilters.push(`Modified before: ${params.modifiedBefore}`);
      if (params.pageType?.length) appliedFilters.push(`Page types: ${params.pageType.join(', ')}`);
      
      if (appliedFilters.length > 0) {
        content += `\nFilters applied: ${appliedFilters.join(', ')}`;
      }
      
      if (result.results && result.results.length > 0) {
        content += '\n\nTop results:';
        result.results.slice(0, 10).forEach((item, index) => {
          content += `\n${index + 1}. ${item.fileName}`;
          content += `\n   Path: ${item.path}`;
          content += `\n   Wiki: ${item.wiki.name}`;
          content += `\n   Project: ${item.project.name}`;
          if (item.contentMatches && item.contentMatches.length > 0) {
            content += `\n   Matches: ${item.contentMatches.length} match(es)`;
          }
        });
      }

      return formatMcpResponse(result, content);
    } catch (error) {
      console.error('Error in advancedWikiSearch tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Search across specific repositories
   */
  async searchRepository(params: {
    repositoryId: string;
    searchText: string;
    projectId?: string;
    branchName?: string;
    path?: string;
    fileExtension?: string;
    top?: number;
  }): Promise<McpResponse> {
    try {
      const result = await this.searchService.searchCode({
        searchText: params.searchText,
        repositoryId: params.repositoryId,
        projectId: params.projectId,
        branchName: params.branchName,
        path: params.path,
        fileExtension: params.fileExtension,
        top: params.top
      });

      const resultCount = result.count || result.results?.length || 0;
      let content = `Repository search found ${resultCount} results in repository "${params.repositoryId}" for "${params.searchText}"`;
      
      if (result.results && result.results.length > 0) {
        content += '\n\nResults:';
        result.results.forEach((item, index) => {
          content += `\n${index + 1}. ${item.fileName}`;
          content += `\n   Path: ${item.path}`;
          if (item.contentMatches && item.contentMatches.length > 0) {
            content += `\n   Matches: ${item.contentMatches.length} match(es)`;
            // Show first few matches
            item.contentMatches.slice(0, 3).forEach(match => {
              content += `\n     Line ${match.lineNumber}: ${match.line.trim()}`;
            });
          }
        });
      }

      return formatMcpResponse(result, content);
    } catch (error) {
      console.error('Error in searchRepository tool:', error);
      return formatErrorResponse(error);
    }
  }
}

export const SearchToolMethods = getClassMethods(SearchTools.prototype);