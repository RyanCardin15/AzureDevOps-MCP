import * as azdev from 'azure-devops-node-api';
import { WikiApi } from 'azure-devops-node-api/WikiApi';
import { AzureDevOpsConfig } from '../Interfaces/AzureDevOps';
import { AzureDevOpsService } from './AzureDevOpsService';
import {
  CreateWikiParams,
  GetWikiParams,
  ListWikisParams,
  UpdateWikiParams,
  DeleteWikiParams,
  CreateOrUpdateWikiPageParams,
  GetWikiPageParams,
  UpdateWikiPageParams,
  DeleteWikiPageParams,
  GetWikiPageContentParams,
  ListWikiPagesParams,
  SearchWikiContentParams
} from '../Interfaces/Wiki';

export class WikiService extends AzureDevOpsService {
  constructor(config: AzureDevOpsConfig) {
    super(config);
  }

  /**
   * Get Wiki API client
   */
  private async getWikiApi(): Promise<WikiApi> {
    return await this.connection.getWikiApi();
  }

  /**
   * Create a new wiki
   */
  public async createWiki(params: CreateWikiParams): Promise<any> {
    try {
      const wikiApi = await this.getWikiApi();
      
      const wikiCreateParameters: any = {
        name: params.name,
        repositoryId: params.repositoryId,
        mappedPath: params.mappedPath,
        type: params.type || 'projectWiki'
      };

      const result = await wikiApi.createWiki(
        wikiCreateParameters,
        this.config.project
      );
      
      return result;
    } catch (error) {
      console.error('Error creating wiki:', error);
      throw error;
    }
  }

  /**
   * Get a wiki by ID or name
   */
  public async getWiki(params: GetWikiParams): Promise<any> {
    try {
      const wikiApi = await this.getWikiApi();
      
      const result = await wikiApi.getWiki(
        this.config.project,
        params.wikiIdentifier
      );
      
      return result;
    } catch (error) {
      console.error('Error getting wiki:', error);
      throw error;
    }
  }

  /**
   * List all wikis in the project
   */
  public async listWikis(params: ListWikisParams): Promise<any> {
    try {
      const wikiApi = await this.getWikiApi();
      
      const result = await wikiApi.getAllWikis(this.config.project);
      
      return result;
    } catch (error) {
      console.error('Error listing wikis:', error);
      throw error;
    }
  }

  /**
   * Update a wiki
   */
  public async updateWiki(params: UpdateWikiParams): Promise<any> {
    try {
      const wikiApi = await this.getWikiApi();
      
      const wikiUpdateParameters = {
        name: params.name,
        versions: params.versions
      };

      const result = await wikiApi.updateWiki(
        wikiUpdateParameters,
        this.config.project,
        params.wikiIdentifier
      );
      
      return result;
    } catch (error) {
      console.error('Error updating wiki:', error);
      throw error;
    }
  }

  /**
   * Delete a wiki
   */
  public async deleteWiki(params: DeleteWikiParams): Promise<any> {
    try {
      const wikiApi = await this.getWikiApi();
      
      const result = await wikiApi.deleteWiki(
        this.config.project,
        params.wikiIdentifier
      );
      
      return result;
    } catch (error) {
      console.error('Error deleting wiki:', error);
      throw error;
    }
  }

  /**
   * Create or update a wiki page
   * Note: Due to limitations in azure-devops-node-api, this may need direct REST API calls
   */
  public async createOrUpdateWikiPage(params: CreateOrUpdateWikiPageParams): Promise<any> {
    try {
      // Since azure-devops-node-api WikiApi lacks page create/update methods,
      // we'll use direct REST API calls through the WebApi
      const headers: any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (params.versionDescriptor?.version) {
        headers['If-Match'] = params.versionDescriptor.version;
      }

      const body = {
        content: params.content
      };

      const url = `${this.config.orgUrl}/${this.config.project}/_apis/wiki/wikis/${params.wikiIdentifier}/pages?path=${encodeURIComponent(params.path)}&api-version=7.1`;
      
      // Using the connection's rest client for the API call
      const restClient = this.connection.rest;
      const response = await restClient.replace(url, body, { additionalHeaders: headers });
      
      return response.result;
    } catch (error) {
      console.error('Error creating/updating wiki page:', error);
      throw error;
    }
  }

  /**
   * Get a wiki page by path or ID
   */
  public async getWikiPage(params: GetWikiPageParams): Promise<any> {
    try {
      const wikiApi = await this.getWikiApi();
      
      // Since the WikiApi methods may not be available, we'll use direct REST API calls
      let url;
      const headers: any = {
        'Accept': 'application/json'
      };

      if (params.id) {
        url = `${this.config.orgUrl}/${this.config.project}/_apis/wiki/wikis/${params.wikiIdentifier}/pages/${params.id}?api-version=7.1`;
      } else {
        url = `${this.config.orgUrl}/${this.config.project}/_apis/wiki/wikis/${params.wikiIdentifier}/pages?path=${encodeURIComponent(params.path || '')}&api-version=7.1`;
      }

      if (params.includeContent) {
        url += params.id ? '&includeContent=true' : '&includeContent=true';
      }

      if (params.versionDescriptor?.version) {
        url += `&versionDescriptor.version=${params.versionDescriptor.version}`;
      }

      const restClient = this.connection.rest;
      const response = await restClient.get(url, { additionalHeaders: headers });
      const result = response.result;
      
      return result;
    } catch (error) {
      console.error('Error getting wiki page:', error);
      throw error;
    }
  }

  /**
   * Update a wiki page
   */
  public async updateWikiPage(params: UpdateWikiPageParams): Promise<any> {
    try {
      // Similar to create, we'll use direct REST API calls
      const headers: any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (params.eTag) {
        headers['If-Match'] = params.eTag;
      }

      const body = {
        content: params.content
      };

      let url;
      if (params.id) {
        url = `${this.config.orgUrl}/${this.config.project}/_apis/wiki/wikis/${params.wikiIdentifier}/pages/${params.id}?api-version=7.1`;
      } else {
        url = `${this.config.orgUrl}/${this.config.project}/_apis/wiki/wikis/${params.wikiIdentifier}/pages?path=${encodeURIComponent(params.path!)}&api-version=7.1`;
      }
      
      const restClient = this.connection.rest;
      const response = await restClient.update(url, body, { additionalHeaders: headers });
      
      return response.result;
    } catch (error) {
      console.error('Error updating wiki page:', error);
      throw error;
    }
  }

  /**
   * Delete a wiki page
   */
  public async deleteWikiPage(params: DeleteWikiPageParams): Promise<any> {
    try {
      let url;
      if (params.id) {
        url = `${this.config.orgUrl}/${this.config.project}/_apis/wiki/wikis/${params.wikiIdentifier}/pages/${params.id}?api-version=7.1`;
      } else {
        url = `${this.config.orgUrl}/${this.config.project}/_apis/wiki/wikis/${params.wikiIdentifier}/pages?path=${encodeURIComponent(params.path!)}&api-version=7.1`;
      }
      
      const restClient = this.connection.rest;
      const response = await restClient.del(url);
      
      return response.result;
    } catch (error) {
      console.error('Error deleting wiki page:', error);
      throw error;
    }
  }

  /**
   * Get wiki page content with specific formatting
   */
  public async getWikiPageContent(params: GetWikiPageContentParams): Promise<any> {
    try {
      const headers: any = {
        'Accept': params.format === 'html' ? 'text/html' : 'text/plain'
      };

      let url;
      if (params.id) {
        url = `${this.config.orgUrl}/${this.config.project}/_apis/wiki/wikis/${params.wikiIdentifier}/pages/${params.id}?api-version=7.1`;
      } else {
        url = `${this.config.orgUrl}/${this.config.project}/_apis/wiki/wikis/${params.wikiIdentifier}/pages?path=${encodeURIComponent(params.path!)}&api-version=7.1`;
      }

      if (params.versionDescriptor?.version) {
        url += `&versionDescriptor.version=${params.versionDescriptor.version}`;
      }
      
      const restClient = this.connection.rest;
      const response = await restClient.get(url, { additionalHeaders: headers });
      
      return response.result;
    } catch (error) {
      console.error('Error getting wiki page content:', error);
      throw error;
    }
  }

  /**
   * List wiki pages in a hierarchical structure
   */
  public async listWikiPages(params: ListWikiPagesParams): Promise<any> {
    try {
      // Use direct REST API call since getPagesBatch may have parameter issues
      let url = `${this.config.orgUrl}/${this.config.project}/_apis/wiki/wikis/${params.wikiIdentifier}/pages?api-version=7.1`;
      
      if (params.recursionLevel) {
        url += `&recursionLevel=${params.recursionLevel}`;
      }

      if (params.versionDescriptor?.version) {
        url += `&versionDescriptor.version=${params.versionDescriptor.version}`;
      }

      const restClient = this.connection.rest;
      const response = await restClient.get(url);
      const result = response.result;
      
      return result;
    } catch (error) {
      console.error('Error listing wiki pages:', error);
      throw error;
    }
  }

  /**
   * Search wiki content
   * Note: This is a simplified implementation - Azure DevOps may not have direct wiki search API
   */
  public async searchWikiContent(params: SearchWikiContentParams): Promise<any> {
    try {
      // This would typically require getting all pages and searching through content
      // For now, we'll return a placeholder indicating this needs more advanced implementation
      
      const wikiApi = await this.getWikiApi();
      
      let wikis;
      if (params.wikiIdentifier) {
        wikis = [await wikiApi.getWiki(this.config.project, params.wikiIdentifier)];
      } else {
        wikis = await wikiApi.getAllWikis(this.config.project);
      }

      // This is a basic implementation - in practice, you'd want to:
      // 1. Get all pages from the wiki(s)
      // 2. Search through the content of each page
      // 3. Return matching results with context
      
      return {
        searchText: params.searchText,
        wikis: wikis,
        message: 'Wiki content search functionality requires additional implementation for full-text search'
      };
    } catch (error) {
      console.error('Error searching wiki content:', error);
      throw error;
    }
  }
}