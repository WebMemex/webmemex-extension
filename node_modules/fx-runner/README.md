# Firefox Runner

[![Build Status](http://img.shields.io/travis/mozilla-jetpack/node-fx-runner.svg?style=flat-square)](https://travis-ci.org/mozilla-jetpack/node-fx-runner)
[![Build Status](http://img.shields.io/npm/v/fx-runner.svg?style=flat-square)](https://www.npmjs.org/package/fx-runner)

[![NPM](https://nodei.co/npm/fx-runner.png?stars&downloads)](https://nodei.co/npm/fx-runner/)
[![NPM](https://nodei.co/npm-dl/fx-runner.png)](https://nodei.co/npm/fx-runner)

## API

```
Usage: fx-runner [options] [command]

Commands:

start Start Firefox

Options:

-h, --help               output usage information
-V, --version            output the version number
-b, --binary <path>      Path of Firefox binary to use.
--binary-args <CMDARGS>  Pass additional arguments into Firefox.
-p, --profile <path>     Path or name of Firefox profile to use.
-v, --verbose            More verbose logging to stdout.
--new-instance           Use a new instance
--no-remote              Do not allow remote calls
--foreground             Bring Firefox to the foreground
-l, --listen <port>      Start the debugger server on a specific port.
```
