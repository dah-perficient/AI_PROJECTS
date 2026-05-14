# AI_PROJECTS

TypeScript monorepo of React/Vite client and an Express server. These sub-repos are designed as tests of my Claude understand, like building a Multiturn chat app, or a multi-step tool process, file-processing app, etc. All projects will have tests written covering all basic functionality.

## Project structure

```
AI_PROJECTS
└── project/
    ├── client/          # React 18, TypeScript, Vite
    └── server/          # Express, TypeScript, Anthropic SDK
└── ...
```

## Git Ignore

All projects should have a `.gitIgnore` in the root project directory with the following:

```
node_modules/
client/node_modules/
server/node_modules/
client/dist/
server/dist/
server/.env
.DS_Store
```

## Code Style

- Single quotes for all strings and imports, but not for tags.
- Types and Interfaces should always be at the top, just below the imports
- 4-space indentation (no tabs)
- Always use semicolons
- Trailing commas in multi-line structures
- 100 character line width
- Wherever possible, lists of imports, variables, list items, etc will be in alpha order. For example an array with `[a,c,b]` would be `[a,b,c]`
    - A list of imports of  `CustomType`, `CustomCSS`, `CustomCSS2`, `express`, `MyComponent1`, `MyOtherComponent`, `dotenv`, `Anthropic`, `cors` would be: 
  ```javascript
    import Anthropic from '@anthropic-ai/sdk';
    import cors from 'cors';
    import dotenv from 'dotenv';
    import express from "express";

    import MyComponent1 from '@/components/MyComponent1';
    import MyOtherComponent from '@/components/MyOtherComponent';

    import CustomCSS1 from '@/css/CustomCSS1'
    import CustomCSS2 from '@/css/CustomCSS2'

    import CustomType from '@/type/CustomType'
  ```

## TypeScript

- Strict mode enabled in all tsconfigs — do not disable strict checks
- Prefer `type` over `interface` unless the interface needs to be extended or merged
- No `any` types; use `unknown` and narrow it
- There has to be a `.gitignore` file that ignores all `node_modules` and any othere known files that should not be pushed (for example .env should never goto to Git)

## File Conventions

- Each component or class file will have a single purpose
- File names use kebab-case for utilities, PascalCase for React components

## Vite rules

- All vite projects will include an alias to root as `@` allowing quick access to directories like `components` or `routes`

## Formatting tools

These tools will help enforce the Code Style rules.

### Linting & Prettier

All sub-repos should have both `eslint` and `Prettier` installed and configured.

### Editor Config

All sub-repos should have `EditorConfig` installed with the following base confguration:

```
root = true

[*]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.json]
indent_size = 4 

[*.md]
trim_trailing_whitespace = false
```