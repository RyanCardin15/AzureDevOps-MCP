[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/ryancardin15-azuredevops-mcp-badge.png)](https://mseep.ai/app/ryancardin15-azuredevops-mcp)

# Azure DevOps MCP Integration
[![smithery badge](https://smithery.ai/badge/@RyanCardin15/azuredevops-mcp)](https://smithery.ai/server/@RyanCardin15/azuredevops-mcp)

<a href="https://glama.ai/mcp/servers/z7mxfcinp8">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/z7mxfcinp8/badge" />
</a>


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

### Installing via Smithery

To install azuredevops-mcp for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@RyanCardin15/azuredevops-mcp):

```bash
npx -y @smithery/cli install @RyanCardin15/azuredevops-mcp --client claude
```

### Prerequisites
- Node.js (v16 or later)
- TypeScript (v4 or later)
- An Azure DevOps account with a Personal Access Token (PAT) or appropriate on-premises credentials

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AzureDevOps
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (create a `.env` file or set them directly):

   For Azure DevOps Services (cloud):
   ```
   AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-organization
   AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN=your-personal-access-token
   AZURE_DEVOPS_PROJECT=your-default-project
   AZURE_DEVOPS_IS_ON_PREMISES=false
   ```

   For Azure DevOps Server (on-premises):
   ```
   AZURE_DEVOPS_ORG_URL=https://your-server/tfs
   AZURE_DEVOPS_PROJECT=your-default-project
   AZURE_DEVOPS_IS_ON_PREMISES=true
   AZURE_DEVOPS_COLLECTION=your-collection
   AZURE_DEVOPS_API_VERSION=6.0  # Adjust based on your server version

   # Authentication (choose one):
   
   # For PAT authentication:
   AZURE_DEVOPS_AUTH_TYPE=pat
   AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN=your-personal-access-token

   # For NTLM authentication:
   AZURE_DEVOPS_AUTH_TYPE=ntlm
   AZURE_DEVOPS_USERNAME=your-username
   AZURE_DEVOPS_PASSWORD=your-password
   AZURE_DEVOPS_DOMAIN=your-domain

   # For Basic authentication:
   AZURE_DEVOPS_AUTH_TYPE=basic
   AZURE_DEVOPS_USERNAME=your-username
   AZURE_DEVOPS_PASSWORD=your-password
   ```

4. Build the project:
   ```bash
   npm run build
   ```

   If you encounter TypeScript errors but want to proceed anyway:
   ```bash
   npm run build:ignore-errors
   ```

5. Start the server:
   ```bash
   npm run start
   ```

## Configuration

### Personal Access Token (PAT)

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

For Azure DevOps Server (on-premises), you have three authentication options:

1. Personal Access Token (PAT):
   - Similar to cloud setup, but create the PAT in your on-premises instance
   - Set `AZURE_DEVOPS_AUTH_TYPE=pat`

2. NTLM Authentication:
   - Use your Windows domain credentials
   - Set `AZURE_DEVOPS_AUTH_TYPE=ntlm`
   - Provide username, password, and domain

3. Basic Authentication:
   - Use your local credentials
   - Set `AZURE_DEVOPS_AUTH_TYPE=basic`
   - Provide username and password

### Azure DevOps Services vs. Azure DevOps Server

This integration supports both cloud-hosted Azure DevOps Services and on-premises Azure DevOps Server:

#### Azure DevOps Services (Cloud)
- Simple setup with organization URL and PAT
- Default configuration expects format: `https://dev.azure.com/your-organization`
- Always uses PAT authentication
- Sample configuration files provided in `.env.cloud.example`

#### Azure DevOps Server (On-Premises)
- Requires additional configuration for server URL, collection, and authentication
- URL format varies based on your server setup: `https://your-server/tfs`
- Requires specifying a collection name
- Supports multiple authentication methods (PAT, NTLM, Basic)
- May require API version specification for older server versions
- Sample configuration files provided in `.env.on-premises.example`

#### Key Differences

| Feature | Azure DevOps Services | Azure DevOps Server |
|---------|----------------------|---------------------|
| URL Format | https://dev.azure.com/org | https://server/tfs |
| Collection | Not required | Required |
| Auth Methods | PAT only | PAT, NTLM, Basic |
| API Version | Latest (automatic) | May need specification |
| Connection | Always internet | Can be air-gapped |

#### Example Configuration

Copy either `.env.cloud.example` or `.env.on-premises.example` to `.env` and update the values as needed.

### Environment Variables

The server can be configured using the following environment variables:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| AZURE_DEVOPS_ORG_URL | URL of your Azure DevOps organization or server | Yes | - |
| AZURE_DEVOPS_PROJECT | Default project to use | Yes | - |
| AZURE_DEVOPS_IS_ON_PREMISES | Whether using Azure DevOps Server | No | false |
| AZURE_DEVOPS_COLLECTION | Collection name for on-premises | No* | - |
| AZURE_DEVOPS_API_VERSION | API version for on-premises | No | - |
| AZURE_DEVOPS_AUTH_TYPE | Authentication type (pat/ntlm/basic) | No | pat |
| AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN | Personal access token | No** | - |
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
