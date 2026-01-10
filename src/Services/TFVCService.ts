import * as azdev from 'azure-devops-node-api';
import { TfvcApi } from 'azure-devops-node-api/TfvcApi';
import { AzureDevOpsConfig } from '../Interfaces/AzureDevOps';
import { AzureDevOpsService } from './AzureDevOpsService';
import {
  TfvcCheckoutParams,
  TfvcCheckinParams,
  TfvcPendingChangesParams,
  TfvcUndoChangesParams,
  TfvcGetChangesetsParams,
  TfvcCreateShelvesetParams,
  TfvcGetShelvesetParams
} from '../Interfaces/TFVC';

export class TFVCService extends AzureDevOpsService {
  constructor(config: AzureDevOpsConfig) {
    super(config);
  }

  /**
   * Get the TFVC API client
   */
  private async getTfvcApi(): Promise<TfvcApi> {
    return await this.connection.getTfvcApi();
  }

  /**
   * Checkout items for edit in TFVC
   * Note: TFVC checkout is done via command-line tool (tf.exe) as it requires workspace mapping
   */
  public async checkout(params: TfvcCheckoutParams): Promise<any> {
    try {
      // TFVC checkout requires local workspace and is done via tf.exe command
      // The REST API doesn't have a direct checkout endpoint
      const commands = params.items.map(item =>
        `tf checkout "${item.path}"${item.recursionLevel ? ' /recursive' : ''}`
      );

      return {
        success: true,
        message: `📝 TFVC Checkout Commands:\n\nTFVC checkout requires local workspace. Run these commands in your workspace:\n\n${commands.map(c => `  ${c}`).join('\n')}\n\nOr use Visual Studio to checkout files.`,
        items: params.items,
        requiresCommand: true
      };
    } catch (error: any) {
      console.error('Error generating checkout commands:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate checkout commands',
        details: error
      };
    }
  }

  /**
   * Checkin pending changes with work item association
   * Creates a changeset and optionally links it to work items
   */
  public async checkin(params: TfvcCheckinParams): Promise<any> {
    try {
      const tfvcApi = await this.getTfvcApi();

      // Prepare changeset request
      const changesetRequest: any = {
        comment: params.comment || '',
        changes: params.changes || [],
        checkinNotes: params.checkinNotes || {},
        associatedWorkItems: (params.associatedWorkItems || []).map(id => ({ id })),
        overrideReason: params.overrideReason,
        policyOverride: params.policiesOverride
      };

      // Create changeset using checkin operation
      const changeset = await (tfvcApi as any).createChangeset(
        changesetRequest,
        params.project || this.config.project
      );

      const workItemsInfo = params.associatedWorkItems && params.associatedWorkItems.length > 0
        ? ` and linked to ${params.associatedWorkItems.length} work item(s): [${params.associatedWorkItems.join(', ')}]`
        : '';

      return {
        success: true,
        changeset: {
          changesetId: changeset.changesetId,
          url: changeset.url,
          committer: changeset.committedBy || changeset.author,
          comment: params.comment,
          associatedWorkItems: params.associatedWorkItems || []
        },
        message: `Successfully created Changeset #${changeset.changesetId}${workItemsInfo}`
      };
    } catch (error: any) {
      console.error('Error checking in TFVC changes:', error);
      return {
        success: false,
        error: error.message || 'Failed to checkin changes',
        details: error
      };
    }
  }

  /**
   * Get pending changes for the current workspace
   * Note: This requires command-line tool as the REST API doesn't expose workspace state
   */
  public async getPendingChanges(params: TfvcPendingChangesParams): Promise<any> {
    try {
      // TFVC pending changes are workspace-specific and accessed via tf.exe command
      // The REST API doesn't have a method to query local workspace state
      return {
        success: true,
        message: `📋 TFVC Pending Changes Command:\n\nTo view pending changes, run:\n  tf status${params.project ? ` /collection:${this.config.orgUrl} /project:${params.project}` : ''}\n\nOr use Visual Studio -> Source Control Explorer to view pending changes.`,
        requiresCommand: true
      };
    } catch (error: any) {
      console.error('Error generating pending changes command:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate pending changes command',
        details: error
      };
    }
  }

  /**
   * Undo pending changes
   * Note: This requires command-line tool as the REST API doesn't have undo endpoint
   */
  public async undoChanges(params: TfvcUndoChangesParams): Promise<any> {
    try {
      // TFVC undo requires local workspace and is done via tf.exe command
      const commands = params.items.map(item =>
        `tf undo "${item.path}"${item.recursionLevel ? ' /recursive' : ''}`
      );

      return {
        success: true,
        message: `↩️ TFVC Undo Commands:\n\nTo undo pending changes, run:\n\n${commands.map(c => `  ${c}`).join('\n')}\n\nOr use Visual Studio -> Source Control Explorer to undo changes.`,
        items: params.items,
        requiresCommand: true
      };
    } catch (error: any) {
      console.error('Error generating undo commands:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate undo commands',
        details: error
      };
    }
  }

  /**
   * Get changesets (history)
   * This is one of the few TFVC operations fully supported via REST API
   */
  public async getChangesets(params: TfvcGetChangesetsParams): Promise<any> {
    try {
      const tfvcApi = await this.getTfvcApi();

      // Build search criteria
      const searchCriteria: any = {};

      if (params.fromDate) {
        searchCriteria.fromDate = params.fromDate;
      }
      if (params.toDate) {
        searchCriteria.toDate = params.toDate;
      }
      if (params.itemPath) {
        searchCriteria.itemPath = params.itemPath;
      }

      // API signature: getChangesets(project, maxCommentLength, skip, top, orderby, searchCriteria)
      const changesets = await tfvcApi.getChangesets(
        params.project || this.config.project,
        undefined, // maxCommentLength
        params.skip,
        params.top ? Number(params.top) : undefined,
        undefined, // orderby
        searchCriteria
      );

      return {
        count: changesets?.length || 0,
        changesets: changesets || []
      };
    } catch (error: any) {
      console.error('Error getting changesets:', error);
      return {
        success: false,
        error: error.message || 'Failed to get changesets',
        details: error
      };
    }
  }

  /**
   * Create a shelveset (shelve pending changes without checking in)
   */
  public async createShelveset(params: TfvcCreateShelvesetParams): Promise<any> {
    try {
      const tfvcApi = await this.getTfvcApi();

      const shelvesetRequest: any = {
        name: params.shelvesetName,
        comment: params.comment,
        changes: params.changes || [],
        workItems: (params.associatedWorkItems || []).map(id => ({ id }))
      };

      const shelveset = await (tfvcApi as any).createShelveset(
        shelvesetRequest,
        params.project || this.config.project
      );

      return {
        success: true,
        shelveset: shelveset,
        message: `Successfully created shelveset: ${params.shelvesetName}`
      };
    } catch (error: any) {
      console.error('Error creating shelveset:', error);
      return {
        success: false,
        error: error.message || 'Failed to create shelveset',
        details: error
      };
    }
  }

  /**
   * Get a specific shelveset
   */
  public async getShelveset(params: TfvcGetShelvesetParams): Promise<any> {
    try {
      const tfvcApi = await this.getTfvcApi();

      const shelveset = await (tfvcApi as any).getShelveset(
        params.shelvesetName,
        undefined // shelvesetOwner
      );

      return {
        shelveset: shelveset
      };
    } catch (error: any) {
      console.error('Error getting shelveset:', error);
      return {
        success: false,
        error: error.message || 'Failed to get shelveset',
        details: error
      };
    }
  }
}
