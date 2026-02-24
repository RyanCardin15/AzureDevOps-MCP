# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript to dist/
npm run build:ignore-errors  # Build skipping type errors (useful during development)
npm run dev          # Run directly with ts-node (no compilation needed)
npm run start        # Run the compiled dist/index.js
```

There are no tests configured (`npm test` exits with error 1).

## Architecture Overview

This is an **MCP (Model Context Protocol) server** that exposes Azure DevOps operations as tools consumable by AI assistants. It communicates over stdio using the `@modelcontextprotocol/sdk`.

### Layer Structure

The codebase follows a strict three-layer pattern for each feature domain:

1. **Interfaces** (`src/Interfaces/`) — TypeScript interfaces and parameter types for each domain (e.g., `WorkItems.ts`, `CodeAndRepositories.ts`). `Common.ts` defines the shared `McpResponse` type and `formatMcpResponse`/`formatErrorResponse` helpers used by all tools.

2. **Services** (`src/Services/`) — Business logic that calls the `azure-devops-node-api`. Each service extends `AzureDevOpsService` (the base class in `src/Services/AzureDevOpsService.ts`), which manages the authenticated `azdev.WebApi` connection. Services return raw data.

3. **Tools** (`src/Tools/`) — Thin wrappers around Services. Tools call the corresponding service, wrap results with `formatMcpResponse`, and export a `*ToolMethods` string array (used by `config.ts` to enumerate allowed tools).

### Entry Points

- **`src/index.ts`** — Creates the `McpServer`, registers every tool with Zod parameter schemas, and starts the stdio transport. All tool registrations follow the `allowedTools.has("toolName") && server.tool(...)` gating pattern.
- **`src/config.ts`** — Reads environment variables to produce `AzureDevOpsConfig` and the `allowedTools` set. Also aggregates all `*ToolMethods` arrays into `ALL_ALLOWED_TOOLS`.

### Tool Domains

Eight tool groups are registered in `index.ts`, each with a corresponding Tools class, Service, and Interface file:

| Domain | Tools class | Service |
|---|---|---|
| Work Items | `WorkItemTools` | `WorkItemService` |
| Boards & Sprints | `BoardsSprintsTools` | `BoardsSprintsService` |
| Projects | `ProjectTools` | `ProjectService` |
| Git / Repositories | `GitTools` | `GitService` |
| Testing | `TestingCapabilitiesTools` | `TestingCapabilitiesService` |
| DevSecOps | `DevSecOpsTools` | `DevSecOpsService` |
| Artifact Management | `ArtifactManagementTools` | `ArtifactManagementService` |
| AI-Assisted Dev | `AIAssistedDevelopmentTools` | `AIAssistedDevelopmentService` |

### Authentication

Configured via `AZURE_DEVOPS_AUTH_TYPE` env var. Supported modes:
- `pat` (default) — Personal Access Token; works for cloud and on-premises
- `entra` — Azure DefaultAzureCredential (cloud only); managed by the singleton `EntraAuthHandler`
- `ntlm` — on-premises only; implemented via `SpnegoNtlmHandler`
- `basic` — on-premises only

### Adding a New Tool

1. Add parameter interfaces to the appropriate file in `src/Interfaces/`
2. Implement the method in the corresponding `src/Services/` class
3. Add a public method in the corresponding `src/Tools/` class that calls the service and wraps with `formatMcpResponse`/`formatErrorResponse`
4. Register the tool in `src/index.ts` following the existing `allowedTools.has(...) && server.tool(...)` pattern with Zod schemas
5. The method name will automatically be included in `ALL_ALLOWED_TOOLS` via `getClassMethods` reflection

### Tool Filtering

Set `ALLOWED_TOOLS` env var to a comma-separated list of tool method names to restrict which tools are exposed. If unset, all tools are enabled.

## Environment Configuration

Copy `.env.cloud.example` or `.env.on-premises.example` to `.env`. Required variables:

```
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-organization
AZURE_DEVOPS_PROJECT=your-project-name
AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN=your-pat   # required for pat auth
AZURE_DEVOPS_IS_ON_PREMISES=false             # true for TFS/ADO Server
ALLOWED_TOOLS=                                # leave empty for all tools
```

On-premises additionally requires `AZURE_DEVOPS_COLLECTION` and optionally `AZURE_DEVOPS_API_VERSION`.

## Important Notes

- **Never use `console.log`** inside tool/service code — the server uses stdio for MCP communication and any output to stdout breaks the protocol. Use `console.error` for logging.
- The `MCP_MODE=true` env var is set automatically at startup to signal this constraint.
- TypeScript is compiled with `strict: true` and targets `es2020`/`commonjs`. Output goes to `dist/`.
- Use `npm run build:ignore-errors` when iterating quickly on incomplete implementations, but always target a clean `npm run build` before committing.
