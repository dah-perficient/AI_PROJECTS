# AI_PROJECTS

TypeScript monorepo of React/Vite client and an Express server. These sub-repos are designed as tests of Claude understand, like building a Multiturn chat app, or a multi-step tool process, etc.

## Project Structure

- `multi-turn/`
  - `client/` — React 18, TypeScript, Vite
  - `server/` — Express, TypeScript, Anthropic SDK

## Code Style

- Single quotes for all strings and imports, but not for tags.
- Types and Interfaces should always be at the top, just below the imports
- 4-space indentation (no tabs)
- Always use semicolons
- Trailing commas in multi-line structures
- 100 character line width
- Wherever possible, lists of imports, variables, list items, etc will be in alpha order. For example an array with `[a,c,b]` would be `[a,b,c]`
  - A list of imports of  express, dotenv, Anthropic, cors would be: 
  ```javascript
  import Anthropic from '@anthropic-ai/sdk';
  import cors from 'cors';
  import dotenv from 'dotenv';
  import express from "express";
  ```

## TypeScript

- Strict mode enabled in all tsconfigs — do not disable strict checks
- Prefer `type` over `interface` unless the interface needs to be extended or merged
- No `any` types; use `unknown` and narrow it

## File Conventions

- One component or class per file
- File names use kebab-case for utilities, PascalCase for React components
