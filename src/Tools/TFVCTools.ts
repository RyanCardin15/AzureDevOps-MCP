import { TFVCService } from '../Services/TFVCService';
import { AzureDevOpsConfig } from '../Interfaces/AzureDevOps';
import {
  TfvcCheckoutParams,
  TfvcCheckinParams,
  TfvcPendingChangesParams,
  TfvcUndoChangesParams,
  TfvcGetChangesetsParams,
  TfvcCreateShelvesetParams,
  TfvcGetShelvesetParams
} from '../Interfaces/TFVC';
import getClassMethods from "../utils/getClassMethods";

export class TFVCTools {
  private tfvcService: TFVCService;

  constructor(config: AzureDevOpsConfig) {
    this.tfvcService = new TFVCService(config);
  }

  /**
   * Checkout items for edit in TFVC
   */
  async checkout(params: TfvcCheckoutParams): Promise<any> {
    try {
      const result = await this.tfvcService.checkout(params);

      if (!result.success) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${result.error}`
            }
          ],
          isError: true,
          rawData: result
        };
      }

      // If requiresCommand, show the command guidance message
      if (result.requiresCommand) {
        return {
          content: [
            {
              type: 'text',
              text: result.message
            }
          ],
          rawData: result
        };
      }

      const changesList = result.pendingChanges?.map((c: any, i: number) =>
        `${i + 1}. ${c.sourceItem?.path || c.item?.path || 'Unknown path'}`
      ).join('\n') || 'No pending changes';

      return {
        content: [
          {
            type: 'text',
            text: `✅ Successfully checked out items:\n\n${changesList}\n\nTotal: ${result.pendingChanges?.length || 0} item(s)`
          }
        ],
        rawData: result
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error checking out items: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Checkin pending changes with work item association
   */
  async checkin(params: TfvcCheckinParams): Promise<any> {
    try {
      const result = await this.tfvcService.checkin(params);

      if (!result.success) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${result.error}`
            }
          ],
          isError: true,
          rawData: result
        };
      }

      const changeset = result.changeset;
      const workItemsText = changeset.associatedWorkItems && changeset.associatedWorkItems.length > 0
        ? `\n\n📌 Associated Work Items:\n${changeset.associatedWorkItems.map((id: number) => `  • #${id}`).join('\n')}`
        : '';

      return {
        content: [
          {
            type: 'text',
            text: `✅ Successfully checked in changes!\n\n📝 Changeset: #${changeset.changesetId}\n👤 Committer: ${changeset.committer || 'Unknown'}\n💬 Comment: ${changeset.comment || 'No comment'}${workItemsText}`
          }
        ],
        rawData: result
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error checking in changes: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Get pending changes for the current workspace
   */
  async getPendingChanges(params: TfvcPendingChangesParams): Promise<any> {
    try {
      const result = await this.tfvcService.getPendingChanges(params);

      if (result.success === false) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${result.error}`
            }
          ],
          isError: true,
          rawData: result
        };
      }

      if (!result.pendingChanges || result.pendingChanges.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: '✅ No pending changes in the current workspace.'
            }
          ],
          rawData: result
        };
      }

      const changesList = result.pendingChanges.map((c: any, i: number) => {
        const changeType = c.changeType || 'Unknown';
        const path = c.sourceItem?.path || c.item?.path || 'Unknown path';
        const changeTypeIcon = this.getChangeTypeIcon(changeType);
        return `${i + 1}. ${changeTypeIcon} ${path} [${changeType}]`;
      }).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `📋 Pending Changes (${result.count} item(s)):\n\n${changesList}`
          }
        ],
        rawData: result
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting pending changes: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Undo pending changes
   */
  async undoChanges(params: TfvcUndoChangesParams): Promise<any> {
    try {
      const result = await this.tfvcService.undoChanges(params);

      if (!result.success) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${result.error}`
            }
          ],
          isError: true,
          rawData: result
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ ${result.message}`
          }
        ],
        rawData: result
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error undoing changes: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Get changesets (history)
   */
  async getChangesets(params: TfvcGetChangesetsParams): Promise<any> {
    try {
      const result = await this.tfvcService.getChangesets(params);

      if (result.success === false) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${result.error}`
            }
          ],
          isError: true,
          rawData: result
        };
      }

      if (!result.changesets || result.changesets.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No changesets found.'
            }
          ],
          rawData: result
        };
      }

      const changesetList = result.changesets.map((c: any) => {
        const workItems = c.workItems?.map((wi: any) => `#${wi.id}`).join(', ') || '';
        const workItemsText = workItems ? ` | Work Items: ${workItems}` : '';
        return `#${c.changesetId} | ${c.author?.displayName || c.author?.name || 'Unknown'} | ${new Date(c.checkedInDate || c.createdDate).toLocaleString()}${workItemsText}\n    ${c.comment || 'No comment'}`;
      }).join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `📜 Changesets (${result.count}):\n\n${changesetList}`
          }
        ],
        rawData: result
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting changesets: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Create a shelveset
   */
  async createShelveset(params: TfvcCreateShelvesetParams): Promise<any> {
    try {
      const result = await this.tfvcService.createShelveset(params);

      if (!result.success) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${result.error}`
            }
          ],
          isError: true,
          rawData: result
        };
      }

      const workItemsText = params.associatedWorkItems && params.associatedWorkItems.length > 0
        ? `\n📌 Associated Work Items: ${params.associatedWorkItems.map(id => `#${id}`).join(', ')}`
        : '';

      return {
        content: [
          {
            type: 'text',
            text: `✅ ${result.message}${workItemsText}`
          }
        ],
        rawData: result
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating shelveset: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Get a specific shelveset
   */
  async getShelveset(params: TfvcGetShelvesetParams): Promise<any> {
    try {
      const result = await this.tfvcService.getShelveset(params);

      if (result.success === false) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${result.error}`
            }
          ],
          isError: true,
          rawData: result
        };
      }

      const shelveset = result.shelveset;
      const changesList = shelveset.changes?.map((c: any, i: number) =>
        `${i + 1}. ${c.item?.path || 'Unknown path'} [${c.changeType}]`
      ).join('\n') || 'No changes';
      const workItemsList = shelveset.workItems?.map((wi: any) => `#${wi.id}`).join(', ') || 'None';

      return {
        content: [
          {
            type: 'text',
            text: `📦 Shelveset: ${shelveset.name}\n👤 Owner: ${shelveset.owner?.displayName || shelveset.owner?.name || 'Unknown'}\n💬 Comment: ${shelveset.comment || 'No comment'}\n📌 Work Items: ${workItemsList}\n\nChanges:\n${changesList}`
          }
        ],
        rawData: result
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting shelveset: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Helper: Get icon for change type
   */
  private getChangeTypeIcon(changeType: string): string {
    const type = changeType.toLowerCase();
    if (type.includes('edit')) return '✏️';
    if (type.includes('add')) return '➕';
    if (type.includes('delete')) return '🗑️';
    if (type.includes('rename')) return '✏️';
    if (type.includes('merge')) return '🔀';
    return '📝';
  }
}

export const TFVCToolMethods = getClassMethods(TFVCTools.prototype);
