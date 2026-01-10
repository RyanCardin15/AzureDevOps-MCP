/**
 * Interface for TFVC checkout operation
 */
export interface TfvcCheckoutParams {
  project?: string;
  items: TfvcItemRequest[];
}

/**
 * Interface for TFVC item request
 */
export interface TfvcItemRequest {
  path: string;
  version?: string;
  recursionLevel?: 'none' | 'oneLevel' | 'full';
}

/**
 * Interface for TFVC checkin operation
 */
export interface TfvcCheckinParams {
  project?: string;
  changes?: TfvcChange[];
  comment?: string;
  checkinNotes?: { [key: string]: string };
  associatedWorkItems?: number[];
  overrideReason?: string;
  policiesOverride?: any[];
}

/**
 * Interface for TFVC change
 */
export interface TfvcChange {
  item: TfvcItemDescriptor;
  changeType: string;
}

/**
 * Interface for TFVC item descriptor
 */
export interface TfvcItemDescriptor {
  path: string;
  version?: string;
}

/**
 * Interface for pending changes
 */
export interface TfvcPendingChangesParams {
  project?: string;
  top?: number;
  skip?: number;
}

/**
 * Interface for undo changes
 */
export interface TfvcUndoChangesParams {
  project?: string;
  items: TfvcItemRequest[];
}

/**
 * Interface for getting changesets
 */
export interface TfvcGetChangesetsParams {
  project?: string;
  top?: number;
  skip?: number;
  fromDate?: string;
  toDate?: string;
  itemPath?: string;
}

/**
 * Interface for shelveset operations
 */
export interface TfvcCreateShelvesetParams {
  shelvesetName: string;
  project?: string;
  changes?: TfvcChange[];
  comment?: string;
  associatedWorkItems?: number[];
}

/**
 * Interface for getting a shelveset
 */
export interface TfvcGetShelvesetParams {
  shelvesetName: string;
  project?: string;
}
