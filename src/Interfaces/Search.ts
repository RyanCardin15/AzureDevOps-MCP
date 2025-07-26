// Search interfaces for Azure DevOps Search API functionality

export interface SearchCodeParams {
  searchText: string;
  projectId?: string;
  repositoryId?: string;
  branchName?: string;
  path?: string;
  codeElement?: string[];
  fileExtension?: string;
  skip?: number;
  top?: number;
  includeFacets?: boolean;
  orderBy?: SearchOrderBy[];
}

export interface SearchWorkItemsParams {
  searchText: string;
  projectId?: string;
  areaPath?: string;
  workItemTypes?: string[];
  states?: string[];
  assignedTo?: string;
  skip?: number;
  top?: number;
  includeFacets?: boolean;
  orderBy?: SearchOrderBy[];
}

export interface SearchWikiParams {
  searchText: string;
  projectId?: string;
  wikiId?: string;
  skip?: number;
  top?: number;
  includeFacets?: boolean;
  orderBy?: SearchOrderBy[];
}

export interface GlobalSearchParams {
  searchText: string;
  searchFilters?: {
    entityTypes?: string[];
    projects?: string[];
  };
  skip?: number;
  top?: number;
  includeFacets?: boolean;
}

export interface SearchOrderBy {
  field: string;
  sortOrder: 'ASC' | 'DESC';
}

export interface SearchFilters {
  [key: string]: string[];
}

// Search Result interfaces
export interface CodeSearchResult {
  fileName: string;
  path: string;
  repository: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
  branch: string;
  contentMatches: ContentMatch[];
  versions: Version[];
}

export interface WorkItemSearchResult {
  fields: {
    [key: string]: any;
  };
  url: string;
  project: {
    id: string;
    name: string;
  };
  highlights: {
    [key: string]: string[];
  };
}

export interface WikiSearchResult {
  fileName: string;
  path: string;
  wiki: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
  contentMatches: ContentMatch[];
  versions: Version[];
}

export interface ContentMatch {
  line: string;
  column: number;
  lineNumber: number;
  length: number;
  type: 'content' | 'fileName';
}

export interface Version {
  branchName: string;
  changeId: string;
}

export interface SearchResponse<T> {
  results: T[];
  count: number;
  facets?: SearchFacet[];
  infoCode?: number;
}

export interface SearchFacet {
  name: string;
  counts: FacetCount[];
}

export interface FacetCount {
  name: string;
  count: number;
}

// Advanced search parameters
export interface AdvancedCodeSearchParams extends SearchCodeParams {
  languageFilters?: string[];
  authorFilters?: string[];
  modifiedAfter?: string;
  modifiedBefore?: string;
  fileSizeMin?: number;
  fileSizeMax?: number;
}

export interface AdvancedWorkItemSearchParams extends SearchWorkItemsParams {
  createdBy?: string;
  modifiedBy?: string;
  createdAfter?: string;
  createdBefore?: string;
  modifiedAfter?: string;
  modifiedBefore?: string;
  tags?: string[];
  priority?: string[];
  severity?: string[];
}

export interface AdvancedWikiSearchParams extends SearchWikiParams {
  author?: string;
  modifiedAfter?: string;
  modifiedBefore?: string;
  pageType?: string[];
}