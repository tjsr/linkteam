# linkteam

An npm link tool for automating detection of local development symlinks and junctions

This tool is intended to search through your global `node_modules` directory, and any directories which are
symlinks or junctions will be symlinked to the local `node_modules` directory.

This allows you to run a single command as a postinstall hook to re-link any overwritten virtual directories
during the `npm install` process.

## Installation

### Install globally

You can either install this in a project or globally with `npm i -g linkteam`.  Alternatively, you could use `npx linkteam [opts]`

### Project usage

Install in to a project as a dev dependency using `npm install --save-dev linkteam` or `npm i -D linkteam`.  This allows `linkteam` to be called from npm scripts.

## Usage

`linkteam` will look at all packages referenced by `package.json` and link any which have junctions/symlinks in the global node_modules.

`linkteam -o @tjsr` will link all projects in the `@tjsr` namespace that use juntions, ie, have had `npm link` run in the project.

TODO: Currently broken. Needs fixing.
`linkteam @tjsr/*` would do the same, using a glob-match pattern to call `npm link $` on all matching junctioned node_modules.

## Repo configuration

The workflow files for this repo require the NODE_VERSION and NPM_VERSION var to be specified.

```bash
  gh auth login
  gh variable set NODE_VERSION -b "20.15.1"
  gh variable set NPM_VERSION -b "10.8.2"
```

## Building

To build run

```sh
npm run ci
npm run build
npm test
```

## Dependabot

The repo will requires an NPM_TOKEN to update npm dependencies using dependabot.  
`gh secret set NPM_TOKEN --app dependabot --body "$NPM_TOKEN"`

## TODO

- Fix return code of 1 when no modules were found.
- Fix help being output if junctions are found and no options are provided.
  - ❓ Should at least one option be required?
- Check for the existence of a .devlinks file, and read the lines from that if the file is present.
- Read project package.json or npm ls and only call `npm link` for modules used by project.
