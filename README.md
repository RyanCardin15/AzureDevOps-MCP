[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/ryancardin15-azuredevops-mcp-badge.png)](https://mseep.ai/app/ryancardin15-azuredevops-mcp)

# Azure DevOps MCP Integration

# Star History
[![Star History Chart](https://api.star-history.com/svg?repos=RyanCardin15/AzureDevOps-MCP&type=Date)](https://star-history.com/#RyanCardin15/AzureDevOps-MCP&Date)

A powerful integration for Azure DevOps that provides seamless access to work items, repositories, projects, boards, and sprints through the Model Context Protocol (MCP) server.

## Overview

This server provides a convenient API for interacting with Azure DevOps services, enabling AI assistants and other tools to manage work items, code repositories, boards, sprints, and more. Built with the Model Context Protocol, it provides a standardized interface for communicating with Azure DevOps.

## Demo
![Azure DevOps MCP Demo](AdoMcpDemo.gif)

## Features

The integration is organized into eight main tool categories:

### Work Item Tools
- List work items using WIQL queries
- Get work item details by ID
- Search for work items
- Get recently updated work items
- Get your assigned work items
- Create new work items
- Update existing work items
- Add comments to work items
- Update work item state
- Assign work items
- Create links between work items
- Bulk create/update work items

### Boards & Sprints Tools
- Get team boards
- Get board columns
- Get board items
- Move cards on boards
- Get sprints
- Get the current sprint
- Get sprint work items
- Get sprint capacity
- Get team members

### Project Tools
- List projects
- Get project details
- Create new projects
- Get areas
- Get iterations
- Create areas
- Create iterations
- Get process templates
- Get work item types
- Get work item type fields

### Git Tools
- List repositories
- Get repository details
- Create repositories
- List branches
- Search code
- Browse repositories
- Get file content
- Get commit history
- List pull requests
- Create pull requests
- Get pull request details
- Get pull request comments
- Approve pull requests
- Merge pull requests

### Testing Capabilities Tools
- Run automated tests
- Get test automation status
- Configure test agents
- Create test data generators
- Manage test environments
- Get test flakiness analysis
- Get test gap analysis
- Run test impact analysis
- Get test health dashboard
- Run test optimization
- Create exploratory sessions
- Record exploratory test results
- Convert findings to work items
- Get exploratory test statistics

### DevSecOps Tools
- Run security scans
- Get security scan results
- Track security vulnerabilities
- Generate security compliance reports
- Integrate SARIF results
- Run compliance checks
- Get compliance status
- Create compliance reports
- Manage security policies
- Track security awareness
- Rotate secrets
- Audit secret usage
- Configure vault integration

### Artifact Management Tools
- List artifact feeds
- Get package versions
- Publish packages
- Promote packages
- Delete package versions
- List container images
- Get container image tags
- Scan container images
- Manage container policies
- Manage universal packages
- Create package download reports
- Check package dependencies

### AI-Assisted Development Tools
- Get AI-powered code reviews
- Suggest code optimizations
- Identify code smells
- Get predictive bug analysis
- Get developer productivity metrics
- Get predictive effort estimations
- Get code quality trends
- Suggest work item refinements
- Suggest automation opportunities
- Create intelligent alerts
- Predict build failures
- Optimize test selection

## Installation

### Quick Start with NPX (Recommended)

The easiest way to use the Azure DevOps MCP server is via NPX:

```bash
npx @ryancardin/azuredevops-mcp-server@latest
```

No installation or build steps required! Just set your environment variables and run.

### One-Click Installation for Cursor

Click the button below to install the Azure DevOps MCP server directly in Cursor:

[![Add Azure DevOps MCP to Cursor](https://img.shields.io/badge/Add%20to-Cursor-blue?style=for-the-badge)](cursor://anysphere.cursor-deeplink/mcp/install?name=azure-devops&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyJAcnlhbmNhcmRpbi9henVyZWRldm9wcy1tY3Atc2VydmVyQGxhdGVzdCJdLCJlbnYiOnsiQVpVUkVfREVWT1BTX09SR19VUkwiOiJodHRwczovL2Rldi5henVyZS5jb20veW91ci1vcmdhbml6YXRpb24iLCJBWlVSRV9ERVZPUFNfUFJPSkVDVCI6InlvdXItcHJvamVjdCIsIkFaVVJFX0RFVk9QU19JU19PTl9QUkVNSVNFUyI6ImZhbHNlIiwiQVpVUkVfREVWT1BTX0FVVEhfVFlQRSI6InBhdCIsIkFaVVJFX0RFVk9QU19QRVJTT05BTF9BQ0NFU1NfVE9LRU4iOiJ5b3VyLXBlcnNvbmFsLWFjY2Vzcy10b2tlbiJ9fQo=)

**Important:** After installation in Cursor, you must update the environment variables in your Cursor MCP configuration with your actual Azure DevOps details.

> Learn more about Cursor deeplinks at [https://docs.cursor.com/deeplinks](https://docs.cursor.com/deeplinks)

### Alternative Installation Methods

#### Global NPM Installation
```bash
npm install -g @ryancardin/azuredevops-mcp-server
azuredevops-mcp-server
```

#### Via Smithery (Claude Desktop)
```bash
npx -y @smithery/cli install @RyanCardin15/azuredevops-mcp --client claude
```

#### Development Setup

For development or customization:

1. Clone the repository:
   ```bash
   git clone https://github.com/RyanCardin15/AzureDevOps-MCP.git
   cd AzureDevOps-MCP
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run locally:
   ```bash
   npm start
   ```

## Configuration

### Prerequisites
- Node.js (v16 or later) 
- An Azure DevOps account with a Personal Access Token (PAT) or appropriate credentials

### Environment Variables

Configure the server using environment variables. You can set these in your shell, `.env` file, or in your MCP client configuration:

#### For Azure DevOps Services (Cloud)
```bash
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-organization
AZURE_DEVOPS_PROJECT=your-default-project
AZURE_DEVOPS_IS_ON_PREMISES=false
AZURE_DEVOPS_AUTH_TYPE=pat
AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN=your-personal-access-token
```

#### For Azure DevOps Server (On-Premises)
```bash
AZURE_DEVOPS_ORG_URL=https://your-server/tfs
AZURE_DEVOPS_PROJECT=your-default-project
AZURE_DEVOPS_IS_ON_PREMISES=true
AZURE_DEVOPS_COLLECTION=your-collection
AZURE_DEVOPS_API_VERSION=6.0
AZURE_DEVOPS_AUTH_TYPE=pat
AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN=your-personal-access-token
```

#### Alternative Authentication Methods (On-Premises)
```bash
# NTLM Authentication
AZURE_DEVOPS_AUTH_TYPE=ntlm
AZURE_DEVOPS_USERNAME=your-username
AZURE_DEVOPS_PASSWORD=your-password
AZURE_DEVOPS_DOMAIN=your-domain

# Basic Authentication
AZURE_DEVOPS_AUTH_TYPE=basic
AZURE_DEVOPS_USERNAME=your-username
AZURE_DEVOPS_PASSWORD=your-password

# Entra ID Authentication (requires az CLI)
AZURE_DEVOPS_AUTH_TYPE=entra
```

### Client Configuration

#### Cursor Configuration

Add this to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "azure-devops": {
      "command": "npx",
      "args": ["@ryancardin/azuredevops-mcp-server@latest"],
      "env": {
        "AZURE_DEVOPS_ORG_URL": "https://dev.azure.com/your-organization",
        "AZURE_DEVOPS_PROJECT": "your-project",
        "AZURE_DEVOPS_IS_ON_PREMISES": "false",
        "AZURE_DEVOPS_AUTH_TYPE": "pat",
        "AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN": "your-personal-access-token"
      }
    }
  }
}
```

#### Claude Desktop Configuration

Add this to your Claude Desktop MCP configuration file:

```json
{
  "mcpServers": {
    "azure-devops": {
      "command": "npx",
      "args": ["@ryancardin/azuredevops-mcp-server@latest"],
      "env": {
        "AZURE_DEVOPS_ORG_URL": "https://dev.azure.com/your-organization",
        "AZURE_DEVOPS_PROJECT": "your-project",
        "AZURE_DEVOPS_IS_ON_PREMISES": "false",
        "AZURE_DEVOPS_AUTH_TYPE": "pat",
        "AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN": "your-personal-access-token"
      }
    }
  }
}
```

### Creating a Personal Access Token (PAT)

For Azure DevOps Services (cloud), you'll need to create a Personal Access Token with appropriate permissions:

1. Go to your Azure DevOps organization
2. Click on your profile icon in the top right
3. Select "Personal access tokens"
4. Click "New Token"
5. Give it a name and select the appropriate scopes:
   - Work Items: Read & Write
   - Code: Read & Write
   - Project and Team: Read & Write
   - Build: Read
   - Release: Read

For Azure DevOps Server (on-premises), create the PAT in your on-premises instance following similar steps.

### Complete Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| AZURE_DEVOPS_ORG_URL | URL of your Azure DevOps organization or server | Yes | - |
| AZURE_DEVOPS_PROJECT | Default project to use | Yes | - |
| AZURE_DEVOPS_IS_ON_PREMISES | Whether using Azure DevOps Server | No | false |
| AZURE_DEVOPS_COLLECTION | Collection name for on-premises | No* | - |
| AZURE_DEVOPS_API_VERSION | API version for on-premises | No | - |
| AZURE_DEVOPS_AUTH_TYPE | Authentication type (pat/ntlm/basic/entra) | No | pat |
| AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN | Personal access token (for 'pat' auth) | No** | - |
| AZURE_DEVOPS_USERNAME | Username for NTLM/Basic auth | No** | - |
| AZURE_DEVOPS_PASSWORD | Password for NTLM/Basic auth | No** | - |
| AZURE_DEVOPS_DOMAIN | Domain for NTLM auth | No | - |
| ALLOWED_TOOLS | Comma-separated list of tool methods to enable | No | All tools |

\* Required if `AZURE_DEVOPS_IS_ON_PREMISES=true`  
\** Required based on chosen authentication type

#### Tool Filtering with ALLOWED_TOOLS

The `ALLOWED_TOOLS` environment variable allows you to restrict which tool methods are available. This is completely optional - if not specified, all tools will be enabled.

Format: Comma-separated list of method names with no spaces.

Example:
```
ALLOWED_TOOLS=listWorkItems,getWorkItemById,searchWorkItems,createWorkItem
```

This would only enable the specified work item methods while disabling all others.

#### Entra ID Authentication

For Entra ID authentication, ensure you have Azure CLI installed and authenticated:
```bash
az login
```

The server supports AZ CLI, AZD, and Azure PowerShell modules as long as you're authenticated.

## Usage

Once the server is running, you can interact with it using the MCP protocol. The server exposes several tools for different Azure DevOps functionalities.

### Available Tools

> **Note:** By default, only a subset of tools are registered in the `index.ts` file to keep the initial implementation simple. See the [Tool Registration](#tool-registration) section for information on how to register additional tools.

### Example: List Work Items

```json
{
  "tool": "listWorkItems",
  "params": {
    "query": "SELECT [System.Id], [System.Title], [System.State] FROM WorkItems WHERE [System.State] = 'Active' ORDER BY [System.CreatedDate] DESC"
  }
}
```

### Example: Create a Work Item

```json
{
  "tool": "createWorkItem",
  "params": {
    "workItemType": "User Story",
    "title": "Implement new feature",
    "description": "As a user, I want to be able to export reports to PDF.",
    "assignedTo": "john@example.com"
  }
}
```

### Example: List Repositories

```json
{
  "tool": "listRepositories",
  "params": {
    "projectId": "MyProject"
  }
}
```

### Example: Create a Pull Request

```json
{
  "tool": "createPullRequest",
  "params": {
    "repositoryId": "repo-guid",
    "sourceRefName": "refs/heads/feature-branch",
    "targetRefName": "refs/heads/main",
    "title": "Add new feature",
    "description": "This PR adds the export to PDF feature"
  }
}
```

## Architecture

The project is structured as follows:

- `src/`
  - `Interfaces/`: Type definitions for parameters and responses
  - `Services/`: Service classes for interacting with Azure DevOps APIs
  - `Tools/`: Tool implementations that expose functionality to clients
  - `index.ts`: Main entry point that registers tools and starts the server
  - `config.ts`: Configuration handling

### Service Layer

The service layer handles direct communication with the Azure DevOps API:

- `WorkItemService`: Work item operations
- `BoardsSprintsService`: Boards and sprints operations
- `ProjectService`: Project management operations
- `GitService`: Git repository operations
- `TestingCapabilitiesService`: Testing capabilities operations
- `DevSecOpsService`: DevSecOps operations
- `ArtifactManagementService`: Artifact management operations
- `AIAssistedDevelopmentService`: AI-assisted development operations

### Tools Layer

The tools layer wraps the services and provides a consistent interface for the MCP protocol:

- `WorkItemTools`: Tools for work item operations
- `BoardsSprintsTools`: Tools for boards and sprints operations
- `ProjectTools`: Tools for project management operations
- `GitTools`: Tools for Git operations
- `TestingCapabilitiesTools`: Tools for testing capabilities operations
- `DevSecOpsTools`: Tools for DevSecOps operations
- `ArtifactManagementTools`: Tools for artifact management operations
- `AIAssistedDevelopmentTools`: Tools for AI-assisted development operations

## Tool Registration

The MCP server requires tools to be explicitly registered in the `index.ts` file. By default, only a subset of all possible tools are registered to keep the initial implementation manageable.

To register more tools:

1. Open the `src/index.ts` file
2. Add new tool registrations following the pattern of existing tools
3. Build and restart the server

A comprehensive guide to tool registration is available in the `TOOL_REGISTRATION.md` file in the repository.

> **Note:** When registering tools, be careful to use the correct parameter types, especially for enum values. The type definitions in the `Interfaces` directory define the expected types for each parameter. Using the wrong type (e.g., using `z.string()` instead of `z.enum()` for enumerated values) will result in TypeScript errors during build.

Example of registering a new tool:

```typescript
server.tool("searchCode", 
  "Search for code in repositories",
  {
    searchText: z.string().describe("Text to search for"),
    repositoryId: z.string().optional().describe("ID of the repository")
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
```

## Troubleshooting

### Common Issues

#### Authentication Errors
- Ensure your Personal Access Token is valid and has the required permissions
- Check that the organization URL is correct

#### TypeScript Errors During Build
- Use `npm run build:ignore-errors` to bypass TypeScript errors
- Check for missing or incorrect type definitions

#### Runtime Errors
- Verify that the Azure DevOps project specified exists and is accessible

## Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code passes linting and includes appropriate tests.

[![Verified on MseeP](https://mseep.ai/badge.svg)](https://mseep.ai/app/22aecb18-6269-482a-9b0c-a96653410bf3)

[![smithery badge](https://smithery.ai/badge/@RyanCardin15/azuredevops-mcp)](https://smithery.ai/server/@RyanCardin15/azuredevops-mcp)

<a href="https://glama.ai/mcp/servers/z7mxfcinp8">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/z7mxfcinp8/badge" />
</a>
