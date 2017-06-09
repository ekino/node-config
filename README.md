# @ekino/config

[![NPM version][npm-image]][npm-url]
[![Travis CI][travis-image]][travis-url]
[![Coverage Status][coverage-image]][coverage-url]
[![styled with prettier][prettier-image]][prettier-url]

A lightweight configuration module powered by yaml.

## Installation

Using yarn

```
yarn add @ekino/config
```

Or npm

```
npm install @ekino/config
```

## Usage

This module assumes all your configuration is defined in a single directory:

```
├─ conf/
   ├─ base.yaml        # the base configuration
   ├─ env_mapping.yaml # defines mapping between env vars and config keys
   └─ dev.yaml         # loaded if NODE_ENV is `dev`
```

> Be warned that this module uses synchronous file reads in order to be easily required.

[npm-image]: https://img.shields.io/npm/v/@ekino/config.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@ekino/config
[travis-image]: https://img.shields.io/travis/ekino/node-config.svg?style=flat-square
[travis-url]: https://travis-ci.org/ekino/node-config
[prettier-image]: https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square
[prettier-url]: https://github.com/prettier/prettier
[coverage-image]: https://img.shields.io/coveralls/ekino/node-config/master.svg?style=flat-square
[coverage-url]: https://coveralls.io/github/ekino/node-config?branch=master
