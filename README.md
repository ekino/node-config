# @ekino/config

[![NPM version][npm-image]][npm-url]
[![Travis CI][travis-image]][travis-url]
[![Coverage Status][coverage-image]][coverage-url]
[![styled with prettier][prettier-image]][prettier-url]

A lightweight/opinionated/versatile configuration module powered by yaml.

- [Motivation](#motivation)
- [Installation](#installation)
- [Usage](#usage)
  - [Environment variables override](#environment-variables-override)
  - [NODE_ENV override](#node_env-override)
  - [More overrides](#more-overrides) :smiling_imp:
  - [Inheritance model](#inheritance-model)

## Motivation

Why the hell another Node.js config package?

That's a question we asked ourselves before starting this module,
we wanted simple config management with the following features:

- Simple to use
- Small footprint
- Homogeneous config file format
- No global/specific/pre-configured module to load (eg. require the lib, configure it and then require this file instead directly using the package)
- Human readable
- Concise
- Comments
- Types
- Overrides
- Env variables support

Several modules already exist, but none of them matched our requirements,
some were far too limited and others, in our opinion, really bloated.

We chose yaml because it automatically covered several requirements,
it's concise compared to json, you can add comments, it supports types
and it's really easy to read it. Yaml also offers other neat features
such as [anchors](http://www.yaml.org/spec/1.2/spec.html#id2765878).

**We only support yaml config files**, having a project with `json`, `xml`,
`toml`, `ini`, `properties`,… just does not scale when working on big projects,
everyone adding its favorite flavor.

Then we used environment variables to load overrides or define some specific keys,
it makes really easy to tweak your config depending on the environment
you're running on without touching a single line of code or even a config file.
Really handy when using Docker heavily.

We used this code across several projects (a small file comprised of ~100 loc at this time),
and improved it when required.

And here we are! It's now open source, and we hope it will help others
building awesome things like it did for us.   

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

As this module heavily relies on **environment variables**, you could read
[this](https://en.wikipedia.org/wiki/Environment_variable) first if you're not comfortable with them.

This module assumes all your configuration is defined in a single directory,
located at the root of your current working directory (`process.cwd()`):

```
├─ conf/
   ├─ base.yaml        # the base configuration
   ├─ env_mapping.yaml # defines mapping between env vars and config keys
   └─ dev.yaml         # Optional file loaded if NODE_ENV is `dev`
```

`base.yaml` is required, it defines the common basic configuration of your application.

Then to get a config key value in your code:

```yaml
# /conf/base.yaml
host: base.config.io
external_api:
  key: xxxxx
```

```javascript
// test.js
const config = require('@ekino/config')
console.log(config.get('host'))
console.log(config.get('external_api.key'))
```

If we run this script, we'll have:

```sh
node test.js
> base.config.io
> xxxxx
```

### Environment variables override

Sometimes you want to override a single value on certain environments, to do so this module provides
a special file called `env_mapping.yaml`, it allows to define per key override according to
environment variable value.

Assuming we've got the following config files:

```yaml
# /conf/base.yaml
host: base.config.io
external_api:
  key: xxxxx
```

```yaml
# /conf/env_mapping.yaml
HOST: host
API_KEY: external_api.key
```

And the following code:

```javascript
// test.js
const config = require('@ekino/config')
console.log(config.get('host'))
console.log(config.get('external_api.key'))
``` 

If we run this script, we'll have:

```sh
node test.js
> base.config.io
> xxxxx

HOST=staging.config.io API_KEY=12345 node test.js
> staging.config.io
> 12345
```

The second run outputs a different values because we mapped the `HOST` and `API_KEY` environment variables
to the `host` and `external_api.key` config keys using `env_mapping.yaml`.

Environment variables can be handy, however when reading them from node, we'll always get a string,
this can be annoying when dealing with boolean values for example.
That's why you can optionally force the type of the gathered environment variables value:

```yaml
# /conf/env_mapping.yaml
PORT:
  key:  port
  type: number
USE_SSL:
  key:  use_ssl
  type: boolean
```

For now we only support `number` and `boolean` types, if you think others could be useful,
do not hesitate to contribute! 

### NODE_ENV override

If you've got a bunch of variations depending on the environment your're running your application on,
it can be cumbersome to define tens of mappings inside the `env_mapping.yaml` file.

This module gives you the ability to load overrides depending on the special `NODE_ENV`
environment variable value, let's say we'got those config files:

```yaml
# /conf/dev.yaml
host: dev.config.io
```

```yaml
# /conf/prod.yaml
host: prod.config.io
```

And the following code:

```javascript
// test.js
const config = require('@ekino/config')
console.log(config.get('host'))
``` 

If we run this script, we'll have:

```sh
NODE_ENV=dev node test.js
> dev.config.io

NODE_ENV=prod node test.js
> prod.config.io
```

### More overrides

As we've seen previously with [Environment variables override](#environment-variables-override)
and [NODE_ENV override](#node-env-override), you can easily tweak your config without changing
a single line of code, but if those features aren't sufficient to cover your requirements,
you have another available level of override using `CONF_OVERRIDES`.

> Please make sure you really need it before using it
> as it makes more unclear what the final config will be.

Let's say we've got those config files:

```yaml
# /conf/base.yaml
service: awesome
host:    base.config.io
port:    8080
```

```yaml
# /conf/prod.yaml
host: prod.config.io
port: 8081
```

```yaml
# /conf/aws.yaml
host: prod.aws.config.io
```

```yaml
# /conf/google.yaml
host: prod.google.config.io
```

```yaml
# /conf/extra.yaml
port: 8082
```

And the following code:

```javascript
// test.js
const config = require('@ekino/config')
console.log(config.get('service'))
console.log(config.get('host'))
console.log(config.get('port'))
``` 

If we run this script, we'll have:

```sh
node test.js
> awesome         # from base.yaml
> base.config.io  # from base.yaml
> 8080            # from base.yaml

NODE_ENV=prod node test.js
> awesome         # from base.yaml
> prod.config.io  # from prod.yaml
> 8081            # from prod.yaml

NODE_ENV=prod CONF_OVERRIDES=aws node test.js
> awesome             # from base.yaml
> prod.aws.config.io  # from aws.yaml
> 8081                # from prod.yaml

NODE_ENV=prod CONF_OVERRIDES=google node test.js
> awesome                # from base.yaml
> prod.google.config.io  # from google.yaml
> 8081                   # from prod.yaml

NODE_ENV=prod CONF_OVERRIDES=google,extra node test.js
> awesome                # from base.yaml
> prod.google.config.io  # from google.yaml
> 8082                   # from extra.yaml
```

The overrides from files defined in `CONF_OVERRIDES` are loaded in the same order they are defined,
so for `CONF_OVERRIDES=google,extra`, it will load `/conf/google.yaml`, then `/conf/extra.yaml`.

For the sake of mental health, if a file is defined twice, it will be ignored,
if you take this example:

```sh
NODE_ENV=prod CONF_OVERRIDES=aws,prod node test.js
```

the second `prod` value defined inside `CONF_OVERRIDES` will be ignored as it has been already loaded
because of `NODE_ENV=prod`. 

:warning: The `env_mapping.yaml` will always take precedence over files overrides.

### Inheritance model

```
base.yaml <— [<NODE_ENV>.yaml] <— [<CONF_OVERRIDES>.yaml] <— [env_mapping.yaml] 
```

*All files surrounded by `[]` are optional.* 

1. Load config from `base.yaml`
2. If `NODE_ENV` is defined & `<NODE_ENV>.yaml` exists, load it
3. If `CONF_OVERRIDES` is defined, load each corresponding file if it exists
4. If `env_mapping.yaml` exists and some environment variables match, override with those values

[npm-image]: https://img.shields.io/npm/v/@ekino/config.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@ekino/config
[travis-image]: https://img.shields.io/travis/ekino/node-config.svg?style=flat-square
[travis-url]: https://travis-ci.org/ekino/node-config
[prettier-image]: https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square
[prettier-url]: https://github.com/prettier/prettier
[coverage-image]: https://img.shields.io/coveralls/ekino/node-config/master.svg?style=flat-square
[coverage-url]: https://coveralls.io/github/ekino/node-config?branch=master
