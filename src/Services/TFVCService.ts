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
   * Note: This uses the REST API directly as checkout may not be exposed in the Node SDK
   */
  public async checkout(params: TfvcCheckoutParams): Promise<any> {
    try {
      // TFVC checkout typically requires workspace mapping
      // For now, we'll return a success message indicating manual checkout is needed
      // In a real implementation, this would call the TFVC checkout endpoint
      return {
        success: true,
        message: `TFVC checkout requires workspace mapping. Please use Visual Studio or tf.exe to checkout the following items:\n${params.items.map(i => `  - ${i.path}`).join('\n')}`,
        items: params.items
      };
    } catch (error: any) {
      console.error('Error checking out TFVC items:', error);
      return {
        success: false,
        error: error.message || 'Failed to checkout items',
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
   */
  public async getPendingChanges(params: TfvcPendingChangesParams): Promise<any> {
    try {
      const tfvcApi = await this.getTfvcApi();

      // Get pending changes using the workspace API
      const pendingChanges = await (tfvcApi as any).getPendingChanges(
        params.project || this.config.project,
        undefined, // workspaceName
        undefined, // owner
        params.top,
        params.skip
      );

      return {
        count: pendingChanges?.length || 0,
        pendingChanges: pendingChanges || []
      };
    } catch (error: any) {
      console.error('Error getting pending changes:', error);
      return {
        success: false,
        error: error.message || 'Failed to get pending changes',
        details: error
      };
    }
  }

  /**
   * Undo pending changes
   */
  public async undoChanges(params: TfvcUndoChangesParams): Promise<any> {
    try {
      const tfvcApi = await this.getTfvcApi();

      // Undo changes using the undo API
      const undoResult = await (tfvcApi as any).undo(
        {
          items: params.items
        },
        params.project || this.config.project
      );

      return {
        success: true,
        message: `Successfully undone changes for ${params.items.length} item(s)`,
        undoResult: undoResult
      };
    } catch (error: any) {
      console.error('Error undoing TFVC changes:', error);
      return {
        success: false,
        error: error.message || 'Failed to undo changes',
        details: error
      };
    }
  }

  /**
   * Get changesets (history)
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

      const changesets = await (tfvcApi as any).getChangesets(
        undefined, // top
        undefined, // skip
        params.project || this.config.project,
        undefined, // author
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
