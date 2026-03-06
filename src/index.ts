#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getAllowedTools, getAzureDevOpsConfig } from './config';
import { WorkItemTools } from './Tools/WorkItemTools';
import { BoardsSprintsTools } from './Tools/BoardsSprintsTools';
import { ProjectTools } from './Tools/ProjectTools';
import { GitTools } from './Tools/GitTools';
import { TestingCapabilitiesTools } from './Tools/TestingCapabilitiesTools';
import { DevSecOpsTools } from './Tools/DevSecOpsTools';
import { ArtifactManagementTools } from './Tools/ArtifactManagementTools';
import { AIAssistedDevelopmentTools } from './Tools/AIAssistedDevelopmentTools';
import { z } from 'zod';
import { EntraAuthHandler } from './Services/EntraAuthHandler';

async function main() {
  try {
    // Load configuration
    const azureDevOpsConfig = getAzureDevOpsConfig();
    if(azureDevOpsConfig.auth?.type === 'entra') {
      azureDevOpsConfig.entraAuthHandler = await EntraAuthHandler.getInstance();
    }
    // Load allowed tools
    const allowedTools = getAllowedTools();
    
    // Initialize tools
    const workItemTools = new WorkItemTools(azureDevOpsConfig);
    const boardsSprintsTools = new BoardsSprintsTools(azureDevOpsConfig);
    const projectTools = new ProjectTools(azureDevOpsConfig);
    const gitTools = new GitTools(azureDevOpsConfig);
    const testingCapabilitiesTools = new TestingCapabilitiesTools(azureDevOpsConfig);
    const devSecOpsTools = new DevSecOpsTools(azureDevOpsConfig);
    const artifactManagementTools = new ArtifactManagementTools(azureDevOpsConfig);
    const aiAssistedDevelopmentTools = new AIAssistedDevelopmentTools(azureDevOpsConfig);

    // Create MCP server
    const server = new McpServer({
      name: 'azure-devops-mcp',
      version: '1.0.0',
      description: 'MCP server for Azure DevOps integration',
    });

    // Register Work Item Tools
    allowedTools.has("listWorkItems") && server.tool("listWorkItems", 
      "List work items based on a WIQL query",
      {
        query: z.string().describe("WIQL query to get work items")
      },
      async (params, extra) => {
        const result = await workItemTools.listWorkItems({ query: params.query });
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getWorkItemById") && server.tool("getWorkItemById", 
      "Get a specific work item by ID",
      {
        id: z.number().describe("Work item ID")
      },
      async (params, extra) => {
        const result = await workItemTools.getWorkItemById({ id: params.id });
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("searchWorkItems") && server.tool("searchWorkItems", 
      "Search for work items by text",
      {
        searchText: z.string().describe("Text to search for in work items"),
        top: z.number().optional().describe("Maximum number of work items to return")
      },
      async (params, extra) => {
        const result = await workItemTools.searchWorkItems(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getRecentlyUpdatedWorkItems") && server.tool("getRecentlyUpdatedWorkItems", 
      "Get recently updated work items",
      {
        top: z.number().optional().describe("Maximum number of work items to return"),
        skip: z.number().optional().describe("Number of work items to skip")
      },
      async (params, extra) => {
        const result = await workItemTools.getRecentlyUpdatedWorkItems(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getMyWorkItems") && server.tool("getMyWorkItems", 
      "Get work items assigned to you",
      {
        state: z.string().optional().describe("Filter by work item state"),
        top: z.number().optional().describe("Maximum number of work items to return")
      },
      async (params, extra) => {
        const result = await workItemTools.getMyWorkItems(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("createWorkItem") && server.tool("createWorkItem", 
      "Create a new work item",
      {
        workItemType: z.string().describe("Type of work item to create"),
        title: z.string().describe("Title of the work item"),
        description: z.string().optional().describe("Description of the work item"),
        assignedTo: z.string().optional().describe("User to assign the work item to"),
        state: z.string().optional().describe("Initial state of the work item"),
        areaPath: z.string().optional().describe("Area path for the work item"),
        iterationPath: z.string().optional().describe("Iteration path for the work item"),
        additionalFields: z.record(z.string(), z.any()).optional().describe("Additional fields to set on the work item")
      },
      async (params, extra) => {
        const result = await workItemTools.createWorkItem(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("updateWorkItem") && server.tool("updateWorkItem", 
      "Update an existing work item",
      {
        id: z.number().describe("ID of the work item to update"),
        fields: z.record(z.string(), z.any()).describe("Fields to update on the work item")
      },
      async (params, extra) => {
        const result = await workItemTools.updateWorkItem(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("addWorkItemComment") && server.tool("addWorkItemComment", 
      "Add a comment to a work item",
      {
        id: z.number().describe("ID of the work item"),
        text: z.string().describe("Comment text")
      },
      async (params, extra) => {
        const result = await workItemTools.addWorkItemComment(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("updateWorkItemState") && server.tool("updateWorkItemState", 
      "Update the state of a work item",
      {
        id: z.number().describe("ID of the work item"),
        state: z.string().describe("New state for the work item"),
        comment: z.string().optional().describe("Comment explaining the state change")
      },
      async (params, extra) => {
        const result = await workItemTools.updateWorkItemState(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("assignWorkItem") && server.tool("assignWorkItem", 
      "Assign a work item to a user",
      {
        id: z.number().describe("ID of the work item"),
        assignedTo: z.string().describe("User to assign the work item to")
      },
      async (params, extra) => {
        const result = await workItemTools.assignWorkItem(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("createLink") && server.tool("createLink", 
      "Create a link between work items",
      {
        sourceId: z.number().describe("ID of the source work item"),
        targetId: z.number().describe("ID of the target work item"),
        linkType: z.string().describe("Type of link to create"),
        comment: z.string().optional().describe("Comment explaining the link")
      },
      async (params, extra) => {
        const result = await workItemTools.createLink(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("bulkCreateWorkItems") && server.tool("bulkCreateWorkItems", 
      "Create or update multiple work items in a single operation",
      {
        workItems: z.array(z.union([
          z.object({
            workItemType: z.string().describe("Type of work item to create"),
            title: z.string().describe("Title of the work item"),
            description: z.string().optional().describe("Description of the work item"),
            assignedTo: z.string().optional().describe("User to assign the work item to"),
            state: z.string().optional().describe("Initial state of the work item"),
            areaPath: z.string().optional().describe("Area path for the work item"),
            iterationPath: z.string().optional().describe("Iteration path for the work item"),
            additionalFields: z.record(z.string(), z.any()).optional().describe("Additional fields to set on the work item")
          }),
          z.object({
            id: z.number().describe("ID of work item to update"),
            fields: z.record(z.string(), z.any()).describe("Fields to update on the work item")
          })
        ])).min(1).describe("Array of work items to create or update")
      },
      async (params, extra) => {
        const result = await workItemTools.bulkCreateWorkItems(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    // Register Boards & Sprints Tools
    allowedTools.has("getBoards") && server.tool("getBoards", 
      "Get all boards for a team",
      {
        teamId: z.string().optional().describe("Team ID (uses default team if not specified)")
      },
      async (params, extra) => {
        const result = await boardsSprintsTools.getBoards(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getBoardColumns") && server.tool("getBoardColumns", 
      "Get columns for a specific board",
      {
        teamId: z.string().optional().describe("Team ID (uses default team if not specified)"),
        boardId: z.string().describe("ID of the board")
      },
      async (params, extra) => {
        const result = await boardsSprintsTools.getBoardColumns(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getBoardItems") && server.tool("getBoardItems", 
      "Get items on a specific board",
      {
        teamId: z.string().optional().describe("Team ID (uses default team if not specified)"),
        boardId: z.string().describe("ID of the board")
      },
      async (params, extra) => {
        const result = await boardsSprintsTools.getBoardItems(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("moveCardOnBoard") && server.tool("moveCardOnBoard", 
      "Move a card on a board",
      {
        teamId: z.string().optional().describe("Team ID (uses default team if not specified)"),
        boardId: z.string().describe("ID of the board"),
        workItemId: z.number().describe("ID of the work item to move"),
        columnId: z.string().describe("ID of the column to move to"),
        position: z.number().optional().describe("Position within the column")
      },
      async (params, extra) => {
        const result = await boardsSprintsTools.moveCardOnBoard(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getSprints") && server.tool("getSprints", 
      "Get all sprints for a team",
      {
        teamId: z.string().optional().describe("Team ID (uses default team if not specified)")
      },
      async (params, extra) => {
        const result = await boardsSprintsTools.getSprints(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getCurrentSprint") && server.tool("getCurrentSprint", 
      "Get the current sprint",
      {
        teamId: z.string().optional().describe("Team ID (uses default team if not specified)")
      },
      async (params, extra) => {
        const result = await boardsSprintsTools.getCurrentSprint(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getSprintWorkItems") && server.tool("getSprintWorkItems", 
      "Get work items in a specific sprint",
      {
        teamId: z.string().optional().describe("Team ID (uses default team if not specified)"),
        sprintId: z.string().describe("ID of the sprint")
      },
      async (params, extra) => {
        const result = await boardsSprintsTools.getSprintWorkItems(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getSprintCapacity") && server.tool("getSprintCapacity", 
      "Get capacity for a specific sprint",
      {
        teamId: z.string().optional().describe("Team ID (uses default team if not specified)"),
        sprintId: z.string().describe("ID of the sprint")
      },
      async (params, extra) => {
        const result = await boardsSprintsTools.getSprintCapacity(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getTeamMembers") && server.tool("getTeamMembers", 
      "Get members of a team",
      {
        teamId: z.string().optional().describe("Team ID (uses default team if not specified)")
      },
      async (params, extra) => {
        const result = await boardsSprintsTools.getTeamMembers(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    // Register Project Tools
    allowedTools.has("listProjects") && server.tool("listProjects", 
      "List all projects",
      {
        stateFilter: z.enum(['all', 'createPending', 'deleted', 'deleting', 'new', 'unchanged', 'wellFormed']).optional().describe("Filter by project state"),
        top: z.number().optional().describe("Maximum number of projects to return"),
        skip: z.number().optional().describe("Number of projects to skip")
      },
      async (params, extra) => {
        const result = await projectTools.listProjects(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getProjectDetails") && server.tool("getProjectDetails", 
      "Get details of a specific project",
      {
        projectId: z.string().describe("ID of the project"),
        includeCapabilities: z.boolean().optional().describe("Include project capabilities"),
        includeHistory: z.boolean().optional().describe("Include project history")
      },
      async (params, extra) => {
        const result = await projectTools.getProjectDetails(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("createProject") && server.tool("createProject", 
      "Create a new project",
      {
        name: z.string().describe("Name of the project"),
        description: z.string().optional().describe("Description of the project"),
        visibility: z.enum(['private', 'public']).optional().describe("Visibility of the project"),
        capabilities: z.record(z.string(), z.any()).optional().describe("Project capabilities"),
        processTemplateId: z.string().optional().describe("Process template ID")
      },
      async (params, extra) => {
        const result = await projectTools.createProject(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getAreas") && server.tool("getAreas", 
      "Get areas for a project",
      {
        projectId: z.string().describe("ID of the project"),
        depth: z.number().optional().describe("Maximum depth of the area hierarchy")
      },
      async (params, extra) => {
        const result = await projectTools.getAreas(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getIterations") && server.tool("getIterations", 
      "Get iterations for a project",
      {
        projectId: z.string().describe("ID of the project"),
        includeDeleted: z.boolean().optional().describe("Include deleted iterations")
      },
      async (params, extra) => {
        const result = await projectTools.getIterations(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("createArea") && server.tool("createArea", 
      "Create a new area in a project",
      {
        projectId: z.string().describe("ID of the project"),
        name: z.string().describe("Name of the area"),
        parentPath: z.string().optional().describe("Path of the parent area")
      },
      async (params, extra) => {
        const result = await projectTools.createArea(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("createIteration") && server.tool("createIteration", 
      "Create a new iteration in a project",
      {
        projectId: z.string().describe("ID of the project"),
        name: z.string().describe("Name of the iteration"),
        parentPath: z.string().optional().describe("Path of the parent iteration"),
        startDate: z.string().optional().describe("Start date of the iteration"),
        finishDate: z.string().optional().describe("End date of the iteration")
      },
      async (params, extra) => {
        const result = await projectTools.createIteration(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getProcesses") && server.tool("getProcesses", 
      "Get all processes",
      {
        expandIcon: z.boolean().optional().describe("Include process icons")
      },
      async (params, extra) => {
        const result = await projectTools.getProcesses(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getWorkItemTypes") && server.tool("getWorkItemTypes", 
      "Get work item types for a process",
      {
        processId: z.string().describe("ID of the process")
      },
      async (params, extra) => {
        const result = await projectTools.getWorkItemTypes(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getWorkItemTypeFields") && server.tool("getWorkItemTypeFields", 
      "Get fields for a work item type",
      {
        processId: z.string().describe("ID of the process"),
        witRefName: z.string().describe("Reference name of the work item type")
      },
      async (params, extra) => {
        const result = await projectTools.getWorkItemTypeFields(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    // Register Git Tools
    allowedTools.has("listRepositories") && server.tool("listRepositories", 
      "List all repositories",
      {
        projectId: z.string().optional().describe("Filter by project"),
        includeHidden: z.boolean().optional().describe("Include hidden repositories"),
        includeAllUrls: z.boolean().optional().describe("Include all URLs")
      },
      async (params, extra) => {
        const result = await gitTools.listRepositories(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getRepository") && server.tool("getRepository", 
      "Get details of a specific repository",
      {
        projectId: z.string().describe("ID of the project"),
        repositoryId: z.string().describe("ID of the repository")
      },
      async (params, extra) => {
        const result = await gitTools.getRepository(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("createRepository") && server.tool("createRepository", 
      "Create a new repository",
      {
        name: z.string().describe("Name of the repository"),
        projectId: z.string().describe("ID of the project")
      },
      async (params, extra) => {
        const result = await gitTools.createRepository(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("listBranches") && server.tool("listBranches", 
      "List branches in a repository",
      {
        repositoryId: z.string().describe("ID of the repository"),
        filter: z.string().optional().describe("Filter branches by name"),
        top: z.number().optional().describe("Maximum number of branches to return")
      },
      async (params, extra) => {
        const result = await gitTools.listBranches(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("searchCode") && server.tool("searchCode", 
      "Search for code in repositories",
      {
        searchText: z.string().describe("Text to search for"),
        projectId: z.string().optional().describe("ID of the project"),
        repositoryId: z.string().optional().describe("ID of the repository"),
        fileExtension: z.string().optional().describe("File extension to filter by"),
        top: z.number().optional().describe("Maximum number of results to return")
      },
      async (params, extra) => {
        const result = await gitTools.searchCode(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("browseRepository") && server.tool("browseRepository", 
      "Browse the contents of a repository",
      {
        repositoryId: z.string().describe("ID of the repository"),
        path: z.string().optional().describe("Path within the repository"),
        versionDescriptor: z.object({
          version: z.string().optional().describe("Version (branch, tag, or commit)"),
          versionOptions: z.string().optional().describe("Version options"),
          versionType: z.string().optional().describe("Version type")
        }).optional().describe("Version descriptor")
      },
      async (params, extra) => {
        const result = await gitTools.browseRepository(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getFileContent") && server.tool("getFileContent", 
      "Get the content of a file",
      {
        repositoryId: z.string().describe("ID of the repository"),
        path: z.string().describe("Path to the file"),
        versionDescriptor: z.object({
          version: z.string().optional().describe("Version (branch, tag, or commit)"),
          versionOptions: z.string().optional().describe("Version options"),
          versionType: z.string().optional().describe("Version type")
        }).optional().describe("Version descriptor")
      },
      async (params, extra) => {
        const result = await gitTools.getFileContent(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getCommitHistory") && server.tool("getCommitHistory", 
      "Get commit history for a repository",
      {
        repositoryId: z.string().describe("ID of the repository"),
        itemPath: z.string().optional().describe("Path to filter commits by"),
        top: z.number().optional().describe("Maximum number of commits to return"),
        skip: z.number().optional().describe("Number of commits to skip")
      },
      async (params, extra) => {
        const result = await gitTools.getCommitHistory(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("listPullRequests") && server.tool("listPullRequests", 
      "List pull requests",
      {
        repositoryId: z.string().describe("ID of the repository"),
        status: z.enum(['abandoned', 'active', 'all', 'completed', 'notSet']).optional().describe("Filter by status"),
        creatorId: z.string().optional().describe("Filter by creator"),
        reviewerId: z.string().optional().describe("Filter by reviewer"),
        top: z.number().optional().describe("Maximum number of pull requests to return"),
        skip: z.number().optional().describe("Number of pull requests to skip")
      },
      async (params, extra) => {
        const result = await gitTools.listPullRequests(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("createPullRequest") && server.tool("createPullRequest", 
      "Create a new pull request",
      {
        repositoryId: z.string().describe("ID of the repository"),
        sourceRefName: z.string().describe("Source branch"),
        targetRefName: z.string().describe("Target branch"),
        title: z.string().describe("Title of the pull request"),
        description: z.string().optional().describe("Description of the pull request"),
        reviewers: z.array(z.string()).optional().describe("List of reviewers")
      },
      async (params, extra) => {
        const result = await gitTools.createPullRequest(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getPullRequest") && server.tool("getPullRequest", 
      "Get details of a specific pull request",
      {
        repositoryId: z.string().describe("ID of the repository"),
        pullRequestId: z.number().describe("ID of the pull request")
      },
      async (params, extra) => {
        const result = await gitTools.getPullRequest(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );

    allowedTools.has("getPullRequestChangedFiles") && server.tool("getPullRequestChangedFiles", 
      "Get changed files in a pull request",
      {
        repositoryId: z.string().describe("ID of the repository"),
        pullRequestId: z.number().describe("ID of the pull request"),
        iterationId: z.number().optional().describe("Specific pull request iteration ID (latest iteration is used by default)"),
        compareTo: z.number().optional().describe("Compare changes against a previous iteration ID"),
        top: z.number().optional().describe("Maximum number of changed files to return"),
        skip: z.number().optional().describe("Number of changed files to skip")
      },
      async (params, extra) => {
        const result = await gitTools.getPullRequestChangedFiles(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getPullRequestComments") && server.tool("getPullRequestComments", 
      "Get comments on a pull request",
      {
        repositoryId: z.string().describe("ID of the repository"),
        pullRequestId: z.number().describe("ID of the pull request"),
        threadId: z.number().optional().describe("ID of a specific thread"),
        top: z.number().optional().describe("Maximum number of comments to return"),
        skip: z.number().optional().describe("Number of comments to skip")
      },
      async (params, extra) => {
        const result = await gitTools.getPullRequestComments(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("approvePullRequest") && server.tool("approvePullRequest", 
      "Approve a pull request",
      {
        repositoryId: z.string().describe("ID of the repository"),
        pullRequestId: z.number().describe("ID of the pull request")
      },
      async (params, extra) => {
        const result = await gitTools.approvePullRequest(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("mergePullRequest") && server.tool("mergePullRequest", 
      "Merge a pull request",
      {
        repositoryId: z.string().describe("ID of the repository"),
        pullRequestId: z.number().describe("ID of the pull request"),
        mergeStrategy: z.enum(['noFastForward', 'rebase', 'rebaseMerge', 'squash']).optional().describe("Merge strategy"),
        comment: z.string().optional().describe("Comment for the merge commit")
      },
      async (params, extra) => {
        const result = await gitTools.mergePullRequest(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    // Register Testing Capabilities Tools
    allowedTools.has("runAutomatedTests") && server.tool("runAutomatedTests", 
      "Execute automated test suites",
      {
        testSuiteId: z.number().optional().describe("ID of the test suite to run"),
        testPlanId: z.number().optional().describe("ID of the test plan to run"),
        testEnvironment: z.string().optional().describe("Environment to run tests in"),
        parallelExecution: z.boolean().optional().describe("Whether to run tests in parallel")
      },
      async (params, extra) => {
        const result = await testingCapabilitiesTools.runAutomatedTests(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getTestAutomationStatus") && server.tool("getTestAutomationStatus", 
      "Check status of automated test execution",
      {
        testRunId: z.number().describe("ID of the test run to check status for")
      },
      async (params, extra) => {
        const result = await testingCapabilitiesTools.getTestAutomationStatus(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("configureTestAgents") && server.tool("configureTestAgents", 
      "Configure and manage test agents",
      {
        agentName: z.string().describe("Name of the test agent to configure"),
        capabilities: z.record(z.string(), z.any()).optional().describe("Capabilities to set for the agent"),
        enabled: z.boolean().optional().describe("Whether the agent should be enabled")
      },
      async (params, extra) => {
        const result = await testingCapabilitiesTools.configureTestAgents(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("createTestDataGenerator") && server.tool("createTestDataGenerator", 
      "Generate test data for automated tests",
      {
        name: z.string().describe("Name of the test data generator"),
        dataSchema: z.record(z.string(), z.any()).describe("Schema for the test data to generate"),
        recordCount: z.number().optional().describe("Number of records to generate")
      },
      async (params, extra) => {
        const result = await testingCapabilitiesTools.createTestDataGenerator(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("manageTestEnvironments") && server.tool("manageTestEnvironments", 
      "Manage test environments for different test types",
      {
        environmentName: z.string().describe("Name of the test environment"),
        action: z.enum(['create', 'update', 'delete']).describe("Action to perform"),
        properties: z.record(z.string(), z.any()).optional().describe("Properties for the environment")
      },
      async (params, extra) => {
        const result = await testingCapabilitiesTools.manageTestEnvironments(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getTestFlakiness") && server.tool("getTestFlakiness", 
      "Analyze and report on test flakiness",
      {
        testId: z.number().optional().describe("ID of a specific test to analyze"),
        testRunIds: z.array(z.number()).optional().describe("Specific test runs to analyze"),
        timeRange: z.string().optional().describe("Time range for analysis (e.g., '30d')")
      },
      async (params, extra) => {
        const result = await testingCapabilitiesTools.getTestFlakiness(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getTestGapAnalysis") && server.tool("getTestGapAnalysis", 
      "Identify gaps in test coverage",
      {
        areaPath: z.string().optional().describe("Area path to analyze"),
        codeChangesOnly: z.boolean().optional().describe("Only analyze recent code changes")
      },
      async (params, extra) => {
        const result = await testingCapabilitiesTools.getTestGapAnalysis(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("runTestImpactAnalysis") && server.tool("runTestImpactAnalysis", 
      "Determine which tests to run based on code changes",
      {
        buildId: z.number().describe("ID of the build to analyze"),
        changedFiles: z.array(z.string()).optional().describe("List of changed files")
      },
      async (params, extra) => {
        const result = await testingCapabilitiesTools.runTestImpactAnalysis(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getTestHealthDashboard") && server.tool("getTestHealthDashboard", 
      "View overall test health metrics",
      {
        timeRange: z.string().optional().describe("Time range for metrics (e.g., '90d')"),
        includeTrends: z.boolean().optional().describe("Include trend data")
      },
      async (params, extra) => {
        const result = await testingCapabilitiesTools.getTestHealthDashboard(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("runTestOptimization") && server.tool("runTestOptimization", 
      "Optimize test suite execution for faster feedback",
      {
        testPlanId: z.number().describe("ID of the test plan to optimize"),
        optimizationGoal: z.enum(['time', 'coverage', 'reliability']).describe("Optimization goal")
      },
      async (params, extra) => {
        const result = await testingCapabilitiesTools.runTestOptimization(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("createExploratorySessions") && server.tool("createExploratorySessions", 
      "Create new exploratory testing sessions",
      {
        title: z.string().describe("Title of the exploratory session"),
        description: z.string().optional().describe("Description of the session"),
        areaPath: z.string().optional().describe("Area path for the session")
      },
      async (params, extra) => {
        const result = await testingCapabilitiesTools.createExploratorySessions(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("recordExploratoryTestResults") && server.tool("recordExploratoryTestResults", 
      "Record findings during exploratory testing",
      {
        sessionId: z.number().describe("ID of the exploratory session"),
        findings: z.array(z.string()).describe("List of findings to record"),
        attachments: z.array(z.object({
          name: z.string().describe("Name of the attachment"),
          content: z.string().describe("Base64 encoded content of the attachment"),
          contentType: z.string().optional().describe("MIME type of the attachment")
        })).optional().describe("Attachments for the findings")
      },
      async (params, extra) => {
        const result = await testingCapabilitiesTools.recordExploratoryTestResults(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("convertFindingsToWorkItems") && server.tool("convertFindingsToWorkItems", 
      "Convert exploratory test findings to work items",
      {
        sessionId: z.number().describe("ID of the exploratory session"),
        findingIds: z.array(z.number()).describe("IDs of findings to convert"),
        workItemType: z.string().optional().describe("Type of work item to create")
      },
      async (params, extra) => {
        const result = await testingCapabilitiesTools.convertFindingsToWorkItems(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getExploratoryTestStatistics") && server.tool("getExploratoryTestStatistics", 
      "Get statistics on exploratory testing activities",
      {
        timeRange: z.string().optional().describe("Time range for statistics (e.g., '90d')"),
        userId: z.string().optional().describe("Filter by specific user")
      },
      async (params, extra) => {
        const result = await testingCapabilitiesTools.getExploratoryTestStatistics(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    // Register DevSecOps Tools
    allowedTools.has("runSecurityScan") && server.tool("runSecurityScan", 
      "Run security scans on repositories",
      {
        repositoryId: z.string().describe("ID of the repository to scan"),
        branch: z.string().optional().describe("Branch to scan"),
        scanType: z.enum(['static', 'dynamic', 'container', 'dependency', 'all']).optional().describe("Type of security scan to run")
      },
      async (params, extra) => {
        const result = await devSecOpsTools.runSecurityScan(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getSecurityScanResults") && server.tool("getSecurityScanResults", 
      "Get results from security scans",
      {
        scanId: z.string().describe("ID of the scan to get results for"),
        severity: z.enum(['critical', 'high', 'medium', 'low', 'all']).optional().describe("Filter results by severity")
      },
      async (params, extra) => {
        const result = await devSecOpsTools.getSecurityScanResults(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("trackSecurityVulnerabilities") && server.tool("trackSecurityVulnerabilities", 
      "Track and manage security vulnerabilities",
      {
        vulnerabilityId: z.string().optional().describe("ID of a specific vulnerability to track"),
        status: z.enum(['open', 'in-progress', 'mitigated', 'resolved', 'false-positive']).optional().describe("Filter by vulnerability status"),
        timeRange: z.string().optional().describe("Time range for tracking (e.g., '90d')")
      },
      async (params, extra) => {
        const result = await devSecOpsTools.trackSecurityVulnerabilities(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("generateSecurityCompliance") && server.tool("generateSecurityCompliance", 
      "Generate security compliance reports",
      {
        standardType: z.enum(['owasp', 'pci-dss', 'hipaa', 'gdpr', 'iso27001', 'custom']).optional().describe("Compliance standard to report on"),
        includeEvidence: z.boolean().optional().describe("Include evidence in the report")
      },
      async (params, extra) => {
        const result = await devSecOpsTools.generateSecurityCompliance(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("integrateSarifResults") && server.tool("integrateSarifResults", 
      "Import and process SARIF format security results",
      {
        sarifFilePath: z.string().describe("Path to the SARIF file to import"),
        createWorkItems: z.boolean().optional().describe("Create work items from findings")
      },
      async (params, extra) => {
        const result = await devSecOpsTools.integrateSarifResults(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("runComplianceChecks") && server.tool("runComplianceChecks", 
      "Run compliance checks against standards",
      {
        complianceStandard: z.string().describe("Compliance standard to check against"),
        scopeId: z.string().optional().describe("Scope of the compliance check")
      },
      async (params, extra) => {
        const result = await devSecOpsTools.runComplianceChecks(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getComplianceStatus") && server.tool("getComplianceStatus", 
      "Get current compliance status",
      {
        standardId: z.string().optional().describe("ID of the compliance standard"),
        includeHistory: z.boolean().optional().describe("Include historical compliance data")
      },
      async (params, extra) => {
        const result = await devSecOpsTools.getComplianceStatus(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("createComplianceReport") && server.tool("createComplianceReport", 
      "Create compliance reports for auditing",
      {
        standardId: z.string().describe("ID of the compliance standard"),
        format: z.enum(['pdf', 'html', 'json']).optional().describe("Format of the report")
      },
      async (params, extra) => {
        const result = await devSecOpsTools.createComplianceReport(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("manageSecurityPolicies") && server.tool("manageSecurityPolicies", 
      "Manage security policies",
      {
        policyName: z.string().describe("Name of the security policy"),
        action: z.enum(['create', 'update', 'delete', 'get']).describe("Action to perform on the policy"),
        policyDefinition: z.record(z.string(), z.any()).optional().describe("Definition of the policy")
      },
      async (params, extra) => {
        const result = await devSecOpsTools.manageSecurityPolicies(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("trackSecurityAwareness") && server.tool("trackSecurityAwareness", 
      "Track security awareness and training",
      {
        teamId: z.string().optional().describe("ID of the team to track"),
        trainingId: z.string().optional().describe("ID of specific training to track"),
        timeRange: z.string().optional().describe("Time range for tracking (e.g., '90d')")
      },
      async (params, extra) => {
        const result = await devSecOpsTools.trackSecurityAwareness(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("rotateSecrets") && server.tool("rotateSecrets", 
      "Rotate secrets and credentials",
      {
        secretName: z.string().optional().describe("Name of the secret to rotate"),
        secretType: z.enum(['password', 'token', 'certificate', 'key']).optional().describe("Type of secret to rotate"),
        force: z.boolean().optional().describe("Force rotation even if not expired")
      },
      async (params, extra) => {
        const result = await devSecOpsTools.rotateSecrets(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("auditSecretUsage") && server.tool("auditSecretUsage", 
      "Audit usage of secrets across services",
      {
        secretName: z.string().optional().describe("Name of the secret to audit"),
        timeRange: z.string().optional().describe("Time range for the audit (e.g., '30d')")
      },
      async (params, extra) => {
        const result = await devSecOpsTools.auditSecretUsage(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("vaultIntegration") && server.tool("vaultIntegration", 
      "Integrate with secret vaults",
      {
        vaultUrl: z.string().describe("URL of the vault to integrate with"),
        secretPath: z.string().optional().describe("Path to the secret in the vault"),
        action: z.enum(['get', 'list', 'set', 'delete']).describe("Action to perform"),
        secretValue: z.string().optional().describe("Value to set (for 'set' action)")
      },
      async (params, extra) => {
        const result = await devSecOpsTools.vaultIntegration(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    // Register ArtifactManagement Tools
    allowedTools.has("listArtifactFeeds") && server.tool("listArtifactFeeds", 
      "List artifact feeds in the organization",
      {
        feedType: z.enum(['npm', 'nuget', 'maven', 'python', 'universal', 'all']).optional().describe("Type of feeds to list"),
        includeDeleted: z.boolean().optional().describe("Include deleted feeds")
      },
      async (params, extra) => {
        const result = await artifactManagementTools.listArtifactFeeds(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getPackageVersions") && server.tool("getPackageVersions", 
      "Get versions of a package in a feed",
      {
        feedId: z.string().describe("ID of the feed"),
        packageName: z.string().describe("Name of the package"),
        top: z.number().optional().describe("Maximum number of versions to return")
      },
      async (params, extra) => {
        const result = await artifactManagementTools.getPackageVersions(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("publishPackage") && server.tool("publishPackage", 
      "Publish a package to a feed",
      {
        feedId: z.string().describe("ID of the feed to publish to"),
        packageType: z.enum(['npm', 'nuget', 'maven', 'python', 'universal']).describe("Type of package"),
        packagePath: z.string().describe("Path to the package file"),
        packageVersion: z.string().optional().describe("Version of the package")
      },
      async (params, extra) => {
        const result = await artifactManagementTools.publishPackage(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("promotePackage") && server.tool("promotePackage", 
      "Promote a package version between views",
      {
        feedId: z.string().describe("ID of the feed"),
        packageName: z.string().describe("Name of the package"),
        packageVersion: z.string().describe("Version of the package"),
        sourceView: z.string().describe("Source view (e.g., 'prerelease')"),
        targetView: z.string().describe("Target view (e.g., 'release')")
      },
      async (params, extra) => {
        const result = await artifactManagementTools.promotePackage(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("deletePackageVersion") && server.tool("deletePackageVersion", 
      "Delete a version of a package",
      {
        feedId: z.string().describe("ID of the feed"),
        packageName: z.string().describe("Name of the package"),
        packageVersion: z.string().describe("Version of the package to delete"),
        permanent: z.boolean().optional().describe("Permanently delete the package version")
      },
      async (params, extra) => {
        const result = await artifactManagementTools.deletePackageVersion(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("listContainerImages") && server.tool("listContainerImages", 
      "List container images in a repository",
      {
        repositoryName: z.string().optional().describe("Name of the container repository"),
        includeManifests: z.boolean().optional().describe("Include image manifests"),
        includeDeleted: z.boolean().optional().describe("Include deleted images")
      },
      async (params, extra) => {
        const result = await artifactManagementTools.listContainerImages(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("getContainerImageTags") && server.tool("getContainerImageTags", 
      "Get tags for a container image",
      {
        repositoryName: z.string().describe("Name of the container repository"),
        imageName: z.string().describe("Name of the container image"),
        top: z.number().optional().describe("Maximum number of tags to return")
      },
      async (params, extra) => {
        const result = await artifactManagementTools.getContainerImageTags(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("scanContainerImage") && server.tool("scanContainerImage", 
      "Scan a container image for vulnerabilities and compliance issues",
      {
        repositoryName: z.string().describe("Name of the container repository"),
        imageTag: z.string().describe("Tag of the container image to scan"),
        scanType: z.enum(['vulnerability', 'compliance', 'both']).optional().describe("Type of scan to perform")
      },
      async (params, extra) => {
        const result = await artifactManagementTools.scanContainerImage(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("manageContainerPolicies") && server.tool("manageContainerPolicies", 
      "Manage policies for container repositories",
      {
        repositoryName: z.string().describe("Name of the container repository"),
        policyType: z.enum(['retention', 'security', 'access']).describe("Type of policy to manage"),
        action: z.enum(['get', 'set', 'delete']).describe("Action to perform on the policy"),
        policySettings: z.record(z.string(), z.any()).optional().describe("Settings for the policy when setting")
      },
      async (params, extra) => {
        const result = await artifactManagementTools.manageContainerPolicies(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("manageUniversalPackages") && server.tool("manageUniversalPackages", 
      "Manage universal packages",
      {
        packageName: z.string().describe("Name of the universal package"),
        action: z.enum(['download', 'upload', 'delete']).describe("Action to perform"),
        packagePath: z.string().optional().describe("Path for package upload or download"),
        packageVersion: z.string().optional().describe("Version of the package")
      },
      async (params, extra) => {
        const result = await artifactManagementTools.manageUniversalPackages(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("createPackageDownloadReport") && server.tool("createPackageDownloadReport", 
      "Create reports on package downloads",
      {
        feedId: z.string().optional().describe("ID of the feed"),
        packageName: z.string().optional().describe("Name of the package"),
        timeRange: z.string().optional().describe("Time range for the report (e.g., '30d')"),
        format: z.enum(['csv', 'json']).optional().describe("Format of the report")
      },
      async (params, extra) => {
        const result = await artifactManagementTools.createPackageDownloadReport(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    allowedTools.has("checkPackageDependencies") && server.tool("checkPackageDependencies", 
      "Check package dependencies and vulnerabilities",
      {
        packageName: z.string().describe("Name of the package to check"),
        packageVersion: z.string().optional().describe("Version of the package"),
        includeTransitive: z.boolean().optional().describe("Include transitive dependencies"),
        checkVulnerabilities: z.boolean().optional().describe("Check for known vulnerabilities")
      },
      async (params, extra) => {
        const result = await artifactManagementTools.checkPackageDependencies(params);
        return {
          content: result.content,
          rawData: result.rawData,
          isError: result.isError
        };
      }
    );
    
    // AI Assisted Development Tools
    allowedTools.has("getAICodeReview") && server.tool("getAICodeReview", 
      "Get AI-based code review suggestions",
      {
        pullRequestId: z.number().optional().describe("ID of the pull request to review"),
        repositoryId: z.string().optional().describe("ID of the repository"),
        commitId: z.string().optional().describe("ID of the commit to review"),
        filePath: z.string().optional().describe("Path to the file to review")
      },
      async (params, extra) => {
        const result = await aiAssistedDevelopmentTools.getAICodeReview(params);
        return {
          content: result.content,
          rawData: result.rawData,
        };
      }
    );

    allowedTools.has("suggestCodeOptimization") && server.tool("suggestCodeOptimization", 
      "Suggest code optimizations using AI",
      {
        repositoryId: z.string().describe("ID of the repository"),
        filePath: z.string().describe("Path to the file to optimize"),
        lineStart: z.number().optional().describe("Starting line number"),
        lineEnd: z.number().optional().describe("Ending line number"),
        optimizationType: z.enum(['performance', 'memory', 'readability', 'all']).optional().describe("Type of optimization to focus on")
      },
      async (params, extra) => {
        const result = await aiAssistedDevelopmentTools.suggestCodeOptimization(params);
        return {
          content: result.content,
          rawData: result.rawData,
        };
      }
    );

    allowedTools.has("identifyCodeSmells") && server.tool("identifyCodeSmells", 
      "Identify potential code smells and anti-patterns",
      {
        repositoryId: z.string().describe("ID of the repository"),
        branch: z.string().optional().describe("Branch to analyze"),
        filePath: z.string().optional().describe("Path to the file to analyze"),
        severity: z.enum(['high', 'medium', 'low', 'all']).optional().describe("Severity level to filter by")
      },
      async (params, extra) => {
        const result = await aiAssistedDevelopmentTools.identifyCodeSmells(params);
        return {
          content: result.content,
          rawData: result.rawData,
        };
      }
    );

    allowedTools.has("getPredictiveBugAnalysis") && server.tool("getPredictiveBugAnalysis", 
      "Predict potential bugs in code changes",
      {
        repositoryId: z.string().describe("ID of the repository"),
        pullRequestId: z.number().optional().describe("ID of the pull request"),
        branch: z.string().optional().describe("Branch to analyze"),
        filePath: z.string().optional().describe("Path to the file to analyze")
      },
      async (params, extra) => {
        const result = await aiAssistedDevelopmentTools.getPredictiveBugAnalysis(params);
        return {
          content: result.content,
          rawData: result.rawData,
        };
      }
    );

    allowedTools.has("getDeveloperProductivity") && server.tool("getDeveloperProductivity", 
      "Measure developer productivity metrics",
      {
        userId: z.string().optional().describe("ID of the user"),
        teamId: z.string().optional().describe("ID of the team"),
        timeRange: z.string().optional().describe("Time range for analysis (e.g., '30d', '3m')"),
        includeMetrics: z.array(z.string()).optional().describe("Specific metrics to include")
      },
      async (params, extra) => {
        const result = await aiAssistedDevelopmentTools.getDeveloperProductivity(params);
        return {
          content: result.content,
          rawData: result.rawData,
        };
      }
    );

    allowedTools.has("getPredictiveEffortEstimation") && server.tool("getPredictiveEffortEstimation", 
      "AI-based effort estimation for work items",
      {
        workItemIds: z.array(z.number()).optional().describe("IDs of work items to estimate"),
        workItemType: z.string().optional().describe("Type of work items to estimate"),
        areaPath: z.string().optional().describe("Area path to filter work items")
      },
      async (params, extra) => {
        const result = await aiAssistedDevelopmentTools.getPredictiveEffortEstimation(params);
        return {
          content: result.content,
          rawData: result.rawData,
        };
      }
    );

    allowedTools.has("getCodeQualityTrends") && server.tool("getCodeQualityTrends", 
      "Track code quality trends over time",
      {
        repositoryId: z.string().optional().describe("ID of the repository"),
        branch: z.string().optional().describe("Branch to analyze"),
        timeRange: z.string().optional().describe("Time range for analysis (e.g., '90d', '6m')"),
        metrics: z.array(z.string()).optional().describe("Specific metrics to include")
      },
      async (params, extra) => {
        const result = await aiAssistedDevelopmentTools.getCodeQualityTrends(params);
        return {
          content: result.content,
          rawData: result.rawData,
        };
      }
    );

    allowedTools.has("suggestWorkItemRefinements") && server.tool("suggestWorkItemRefinements", 
      "Get AI suggestions for work item refinements",
      {
        workItemId: z.number().optional().describe("ID of the work item to refine"),
        workItemType: z.string().optional().describe("Type of work item"),
        areaPath: z.string().optional().describe("Area path to filter work items")
      },
      async (params, extra) => {
        const result = await aiAssistedDevelopmentTools.suggestWorkItemRefinements(params);
        return {
          content: result.content,
          rawData: result.rawData,
        };
      }
    );

    allowedTools.has("suggestAutomationOpportunities") && server.tool("suggestAutomationOpportunities", 
      "Identify opportunities for automation",
      {
        projectId: z.string().optional().describe("ID of the project"),
        scopeType: z.enum(['builds', 'releases', 'tests', 'workitems', 'all']).optional().describe("Type of scope to analyze")
      },
      async (params, extra) => {
        const result = await aiAssistedDevelopmentTools.suggestAutomationOpportunities(params);
        return {
          content: result.content,
          rawData: result.rawData,
        };
      }
    );

    allowedTools.has("createIntelligentAlerts") && server.tool("createIntelligentAlerts", 
      "Set up intelligent alerts based on patterns",
      {
        alertName: z.string().describe("Name of the alert"),
        alertType: z.enum(['build', 'release', 'test', 'workitem', 'code']).describe("Type of alert to create"),
        conditions: z.record(z.string(), z.any()).describe("Conditions for the alert"),
        actions: z.record(z.string(), z.any()).optional().describe("Actions to take when the alert triggers")
      },
      async (params, extra) => {
        const result = await aiAssistedDevelopmentTools.createIntelligentAlerts(params);
        return {
          content: result.content,
          rawData: result.rawData,
        };
      }
    );

    allowedTools.has("predictBuildFailures") && server.tool("predictBuildFailures", 
      "Predict potential build failures before they occur",
      {
        buildDefinitionId: z.number().describe("ID of the build definition"),
        lookbackPeriod: z.string().optional().describe("Period to analyze for patterns (e.g., '30d')")
      },
      async (params, extra) => {
        const result = await aiAssistedDevelopmentTools.predictBuildFailures(params);
        return {
          content: result.content,
          rawData: result.rawData,
        };
      }
    );

    allowedTools.has("optimizeTestSelection") && server.tool("optimizeTestSelection", 
      "Intelligently select tests to run based on changes",
      {
        buildId: z.number().describe("ID of the build"),
        changedFiles: z.array(z.string()).optional().describe("List of changed files"),
        maxTestCount: z.number().optional().describe("Maximum number of tests to select")
      },
      async (params, extra) => {
        const result = await aiAssistedDevelopmentTools.optimizeTestSelection(params);
        return {
          content: result.content,
          rawData: result.rawData,
        };
      }
    );

    // Create a transport (use stdio for simplicity)
    const transport = new StdioServerTransport();
    
    // Connect to the transport and start listening
    await server.connect(transport);

  } catch (error) {
    console.error('Error starting MCP server:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Set an environment variable to indicate we're in MCP mode
// This helps prevent console.log from interfering with stdio communication
process.env.MCP_MODE = 'true';

// Run the server
main(); 