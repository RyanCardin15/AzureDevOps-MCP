/**
 * Interface for creating a wiki
 */
export interface CreateWikiParams {
  name: string;
  repositoryId?: string;
  mappedPath?: string;
  type?: 'codeWiki' | 'projectWiki';
}

/**
 * Interface for getting a wiki
 */
export interface GetWikiParams {
  wikiIdentifier: string; // can be wiki ID or name
}

/**
 * Interface for listing wikis
 */
export interface ListWikisParams {
  // All optional parameters for filtering
}

/**
 * Interface for updating a wiki
 */
export interface UpdateWikiParams {
  wikiIdentifier: string; // can be wiki ID or name
  name?: string;
  versions?: any[];
}

/**
 * Interface for deleting a wiki
 */
export interface DeleteWikiParams {
  wikiIdentifier: string; // can be wiki ID or name
}

/**
 * Interface for creating or updating a wiki page
 */
export interface CreateOrUpdateWikiPageParams {
  wikiIdentifier: string; // can be wiki ID or name
  path: string;
  content: string;
  comment?: string;
  versionDescriptor?: {
    version?: string;
    versionOptions?: string;
    versionType?: string;
  };
}

/**
 * Interface for getting a wiki page
 */
export interface GetWikiPageParams {
  wikiIdentifier: string; // can be wiki ID or name
  path?: string;
  id?: number;
  includeContent?: boolean;
  versionDescriptor?: {
    version?: string;
    versionOptions?: string;
    versionType?: string;
  };
}

/**
 * Interface for updating a wiki page
 */
export interface UpdateWikiPageParams {
  wikiIdentifier: string; // can be wiki ID or name
  path?: string;
  id?: number;
  content: string;
  comment?: string;
  eTag?: string; // For concurrency control
  versionDescriptor?: {
    version?: string;
    versionOptions?: string;
    versionType?: string;
  };
}

/**
 * Interface for deleting a wiki page
 */
export interface DeleteWikiPageParams {
  wikiIdentifier: string; // can be wiki ID or name
  path?: string;
  id?: number;
  comment?: string;
}

/**
 * Interface for getting wiki page content with specific format
 */
export interface GetWikiPageContentParams {
  wikiIdentifier: string; // can be wiki ID or name
  path?: string;
  id?: number;
  format?: 'markdown' | 'html';
  versionDescriptor?: {
    version?: string;
    versionOptions?: string;
    versionType?: string;
  };
}

/**
 * Interface for listing wiki pages
 */
export interface ListWikiPagesParams {
  wikiIdentifier: string; // can be wiki ID or name
  versionDescriptor?: {
    version?: string;
    versionOptions?: string;
    versionType?: string;
  };
  recursionLevel?: 'none' | 'oneLevel' | 'oneLevelPlusNestedEmptyFolders' | 'full';
}

/**
 * Interface for searching wiki content
 */
export interface SearchWikiContentParams {
  searchText: string;
  wikiIdentifier?: string; // can be wiki ID or name
  top?: number;
  skip?: number;
}