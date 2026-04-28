---
name: readme-writer
description: Generate comprehensive, well-structured README.md files for any project by analyzing the codebase
version: 1.0.0
---

# README Writer

Generate professional README.md files by analyzing the actual codebase - not generic templates.

## When to Use

Use when the user asks to "write a README", "create a README", "generate docs", "document this project", or when a project is missing a README.md.

## Workflow

### Phase 1: Analyze the Project

Before writing anything, scan the codebase to understand:

1. **Project type** - What language/framework? Check package.json, requirements.txt, Cargo.toml, go.mod, etc.
2. **Entry points** - Where does execution start? main.py, index.ts, src/App.tsx, etc.
3. **Dependencies** - What external packages are used? Read the dependency file.
4. **Scripts/Commands** - What scripts are defined? npm scripts, Makefile targets, etc.
5. **Project structure** - Key directories and their purpose.
6. **Environment** - Any .env.example or config files? What needs to be configured?
7. **Tests** - How are tests run? What framework?
8. **Existing docs** - Any CONTRIBUTING.md, CHANGELOG.md, LICENSE?

### Phase 2: Determine README Scope

Based on project type, select the right sections:

**Library/Package:**
- Installation, API reference, usage examples, contributing

**Application/Service:**
- Setup, configuration, running locally, deployment, environment variables

**CLI Tool:**
- Installation, commands reference, flags/options, examples

**Monorepo:**
- Overview, package list with descriptions, getting started, workspace commands

### Phase 3: Write the README

Follow these principles:

**Lead with what it does, not what it is.**
Bad: "A Node.js application built with Express and PostgreSQL"
Good: "Track expenses across multiple accounts with automatic categorization"

**Show, don't describe.**
Bad: "Easy to install and configure"
Good: A code block with the actual install command

**Real examples from the codebase.**
Don't invent fictional usage - pull actual patterns from the code, tests, or existing docs.

**Minimum viable README sections:**

```markdown
# Project Name

One-line description of what this does.

## Quick Start

Fastest path from clone to running. 3-5 commands max.

## Setup

### Prerequisites
What needs to be installed first (Node 18+, Python 3.11+, etc.)

### Installation
Step-by-step commands to get running locally.

### Environment Variables
Table of required env vars with descriptions. Never include actual secrets.

## Usage

Primary use cases with code examples.

## Project Structure

Only include if the structure isn't obvious. Focus on the directories
that matter, not every single file.

## Scripts / Commands

Table of available commands (npm scripts, make targets, CLI commands).

## Contributing

How to contribute - branch naming, PR process, test requirements.

## License

One line with the license type.
```

**Optional sections (add only when relevant):**
- API Reference - for libraries with public APIs
- Deployment - for applications with specific deploy steps
- Architecture - for complex systems with multiple services
- Troubleshooting - for projects with known gotchas
- FAQ - only if there are actual frequently asked questions

### Phase 4: Quality Check

Before delivering, verify:

- [ ] Every command in the README actually works
- [ ] No placeholder text left ("your-username", "TODO", etc.)
- [ ] Environment variables table matches actual .env.example
- [ ] Prerequisites match what the project actually needs
- [ ] No sections that say "coming soon" or are empty
- [ ] Code blocks have correct language tags for syntax highlighting
- [ ] Links point to real files/URLs
- [ ] Badge URLs (if any) are correct for this repo

## Anti-Patterns to Avoid

- **Don't pad with badges** - Only add badges that provide real info (build status, coverage, version)
- **Don't write essays** - README is a reference, not a blog post
- **Don't repeat the code** - Link to files instead of copying entire modules
- **Don't add a Table of Contents** for READMEs under 200 lines
- **Don't include auto-generated API docs** - Link to them instead
- **Don't write "self-documenting"** sections that just describe file names
- **Don't add screenshots** unless they genuinely help (UI projects yes, CLI tools usually no)

## Output

Deliver the complete README.md content ready to save. No explanations or annotations around it - just the raw markdown the user can commit directly.
