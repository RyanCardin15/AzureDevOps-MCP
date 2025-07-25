import { AzureDevOpsConfig } from '../Interfaces/AzureDevOps';
import { WikiService } from '../Services/WikiService';
import { formatMcpResponse, formatErrorResponse, McpResponse } from '../Interfaces/Common';
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
import getClassMethods from "../utils/getClassMethods";

export class WikiTools {
  private wikiService: WikiService;

  constructor(config: AzureDevOpsConfig) {
    this.wikiService = new WikiService(config);
  }

  /**
   * Create a new wiki
   */
  public async createWiki(params: CreateWikiParams): Promise<McpResponse> {
    try {
      const response = await this.wikiService.createWiki(params);
      return formatMcpResponse(response, `Wiki '${params.name}' created successfully.`);
    } catch (error) {
      console.error('Error in createWiki tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Get a wiki by ID or name
   */
  public async getWiki(params: GetWikiParams): Promise<McpResponse> {
    try {
      const response = await this.wikiService.getWiki(params);
      return formatMcpResponse(response, `Wiki '${params.wikiIdentifier}' details retrieved.`);
    } catch (error) {
      console.error('Error in getWiki tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * List all wikis in the project
   */
  public async listWikis(params: ListWikisParams): Promise<McpResponse> {
    try {
      const response = await this.wikiService.listWikis(params);
      return formatMcpResponse(response, `Found ${response?.length || 0} wikis in the project.`);
    } catch (error) {
      console.error('Error in listWikis tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Update a wiki
   */
  public async updateWiki(params: UpdateWikiParams): Promise<McpResponse> {
    try {
      const response = await this.wikiService.updateWiki(params);
      return formatMcpResponse(response, `Wiki '${params.wikiIdentifier}' updated successfully.`);
    } catch (error) {
      console.error('Error in updateWiki tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Delete a wiki
   */
  public async deleteWiki(params: DeleteWikiParams): Promise<McpResponse> {
    try {
      const response = await this.wikiService.deleteWiki(params);
      return formatMcpResponse(response, `Wiki '${params.wikiIdentifier}' deleted successfully.`);
    } catch (error) {
      console.error('Error in deleteWiki tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Create or update a wiki page
   */
  public async createOrUpdateWikiPage(params: CreateOrUpdateWikiPageParams): Promise<McpResponse> {
    try {
      const response = await this.wikiService.createOrUpdateWikiPage(params);
      return formatMcpResponse(response, `Wiki page '${params.path}' created/updated successfully.`);
    } catch (error) {
      console.error('Error in createOrUpdateWikiPage tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Get a wiki page by path or ID
   */
  public async getWikiPage(params: GetWikiPageParams): Promise<McpResponse> {
    try {
      const response = await this.wikiService.getWikiPage(params);
      const identifier = params.path || `ID: ${params.id}`;
      return formatMcpResponse(response, `Wiki page '${identifier}' retrieved successfully.`);
    } catch (error) {
      console.error('Error in getWikiPage tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Update a wiki page
   */
  public async updateWikiPage(params: UpdateWikiPageParams): Promise<McpResponse> {
    try {
      const response = await this.wikiService.updateWikiPage(params);
      const identifier = params.path || `ID: ${params.id}`;
      return formatMcpResponse(response, `Wiki page '${identifier}' updated successfully.`);
    } catch (error) {
      console.error('Error in updateWikiPage tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Delete a wiki page
   */
  public async deleteWikiPage(params: DeleteWikiPageParams): Promise<McpResponse> {
    try {
      const response = await this.wikiService.deleteWikiPage(params);
      const identifier = params.path || `ID: ${params.id}`;
      return formatMcpResponse(response, `Wiki page '${identifier}' deleted successfully.`);
    } catch (error) {
      console.error('Error in deleteWikiPage tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Get wiki page content with specific formatting
   */
  public async getWikiPageContent(params: GetWikiPageContentParams): Promise<McpResponse> {
    try {
      const response = await this.wikiService.getWikiPageContent(params);
      const identifier = params.path || `ID: ${params.id}`;
      const format = params.format || 'markdown';
      return formatMcpResponse(response, `Wiki page '${identifier}' content retrieved in ${format} format.`);
    } catch (error) {
      console.error('Error in getWikiPageContent tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * List wiki pages in a hierarchical structure
   */
  public async listWikiPages(params: ListWikiPagesParams): Promise<McpResponse> {
    try {
      const response = await this.wikiService.listWikiPages(params);
      return formatMcpResponse(response, `Wiki pages for '${params.wikiIdentifier}' retrieved successfully.`);
    } catch (error) {
      console.error('Error in listWikiPages tool:', error);
      return formatErrorResponse(error);
    }
  }

  /**
   * Search wiki content
   */
  public async searchWikiContent(params: SearchWikiContentParams): Promise<McpResponse> {
    try {
      const response = await this.wikiService.searchWikiContent(params);
      return formatMcpResponse(response, `Search completed for text: '${params.searchText}'.`);
    } catch (error) {
      console.error('Error in searchWikiContent tool:', error);
      return formatErrorResponse(error);
    }
  }
}

// Export the tool methods for easy reference
export const WikiToolMethods = getClassMethods(WikiTools.prototype);