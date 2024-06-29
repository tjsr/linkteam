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



`linkteam -o @tjsr` will link all projects in the `@tjsr` namespace that use juntions, ie, have had `npm link` run in the project.

`linkteam @tjsr/*` would do the same, using a glob-match pattern to call `npm link $` on all matching junctioned node_modules.

## Building

To build run

```sh
npm run ci
npm run build
npm test
```

## TODO

- Fix help being output if junctions are found and no options are provided.
  - ❓ Should at least one option be required?
- Check for the existence of a .devlinks file, and read the lines from that if the file is present.
- Read project package.json or npm ls and only call `npm link` for modules used by project.
