# linteam

An npm link tool for automating detection of local development symlinks and junctions

This tool is intended to search through your global `node_modules` directory, and any directories which are
symlinks or junctions will be symlinked to the local `node_modules` directory.

This allows you to run a single command as a postinstall hook to re-link any overwritten virtual directories
during the `npm install` process.

## Building

To build run

```sh
npm run ci
npm run build
npm test
```

## TODO

- Check for the existence of a .devlinks file, and read the lines from that if the file is present.
