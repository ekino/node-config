const { test } = require('ava')
const config = require('../index')
const childProcess = require('child_process')

test.cb('I can override conf directory path with env variable NODE_CONFIG_DIR', t => {
    const testPath = `${__dirname}/helpers/child.load_conf.js`

    const env = { NODE_CONFIG_DIR: 'test/conf/basic' }
    const child = childProcess.fork(testPath, { env })

    child.on('message', content => {
        t.deepEqual(content, { name: 'test-app2', port: 8082, uuid: '01A2', version: '0.0.2' })
        t.end()
    })
})

test.cb(
    'I can override config values with NODE_ENV config file in the following order: base, env file',
    t => {
        const testPath = `${__dirname}/helpers/child.load_conf.js`

        const env = { NODE_ENV: 'prod' }
        const child = childProcess.fork(testPath, { env })

        child.on('message', content => {
            t.deepEqual(content, {
                name: 'test-app0',
                port: 8081,
                uuid: '01A0',
                version: '0.0.1',
                env: 'prod',
                api: {
                    credentials: {
                        id: 'base-api-id',
                        key: 'prod-api-key'
                    },
                    retries: 3
                }
            })
            t.end()
        })
    }
)

test.cb(
    'I can override config values with env values in the following order: base, env values',
    t => {
        const testPath = `${__dirname}/helpers/child.load_conf.js`

        const env = { NODE_ENV: 'dev', PORT: '8083', API_RETRIES: '6' }
        const child = childProcess.fork(testPath, { env })

        child.on('message', content => {
            t.deepEqual(content, {
                name: 'test-app0',
                port: 8083,
                uuid: '01A0',
                version: '0.0.0',
                api: {
                    credentials: {
                        id: 'base-api-id',
                        key: 'base-api-key'
                    },
                    retries: 6
                }
            })
            t.end()
        })
    }
)

test.cb(
    'I can override config values with NODE_ENV config file and env values in the following order: base, env file, env values',
    t => {
        const testPath = `${__dirname}/helpers/child.load_conf.js`

        const env = { NODE_ENV: 'prod', PORT: '8083' }
        const child = childProcess.fork(testPath, { env })

        child.on('message', content => {
            t.deepEqual(content, {
                name: 'test-app0',
                port: 8083,
                uuid: '01A0',
                version: '0.0.1',
                env: 'prod',
                api: {
                    credentials: {
                        id: 'base-api-id',
                        key: 'prod-api-key'
                    },
                    retries: 3
                }
            })
            t.end()
        })
    }
)

test.cb('I can override config values with config file defined through CONF_OVERRIDES', t => {
    const testPath = `${__dirname}/helpers/child.load_conf.js`

    const env = { CONF_OVERRIDES: 'override_a' }
    const child = childProcess.fork(testPath, { env })

    child.on('message', content => {
        t.deepEqual(content, {
            name: 'test-app0',
            port: 8082,
            uuid: '01A0',
            version: '0.0.2',
            api: {
                credentials: {
                    id: 'base-api-id',
                    key: 'override-a-api-key'
                },
                retries: 3
            }
        })
        t.end()
    })
})

test.cb(
    'I can override config values with multiple config files defined through CONF_OVERRIDES',
    t => {
        const testPath = `${__dirname}/helpers/child.load_conf.js`

        const env = { CONF_OVERRIDES: 'override_a,override_b' }
        const child = childProcess.fork(testPath, { env })

        child.on('message', content => {
            t.deepEqual(content, {
                name: 'test-app0',
                port: 8082,
                uuid: '01A0',
                version: '0.0.3',
                api: {
                    credentials: {
                        id: 'base-api-id',
                        key: 'override-b-api-key'
                    },
                    retries: 3
                }
            })
            t.end()
        })
    }
)

test.cb(
    'Environment variables mapped through env_mapping should take precedence over CONF_OVERRIDES',
    t => {
        const testPath = `${__dirname}/helpers/child.load_conf.js`

        const env = { CONF_OVERRIDES: 'override_a,override_b', VERSION: '0.0.4', API_RETRIES: '6' }
        const child = childProcess.fork(testPath, { env })

        child.on('message', content => {
            t.deepEqual(content, {
                name: 'test-app0',
                port: 8082,
                uuid: '01A0',
                version: '0.0.4',
                api: {
                    credentials: {
                        id: 'base-api-id',
                        key: 'override-b-api-key'
                    },
                    retries: 6
                }
            })
            t.end()
        })
    }
)

test.cb(
    'A config file occurring several times through NODE_ENV or CONF_OVERRIDES should be ignored',
    t => {
        const testPath = `${__dirname}/helpers/child.load_conf.js`

        const env = { NODE_ENV: 'prod', CONF_OVERRIDES: 'override_a,override_b,prod' }
        const child = childProcess.fork(testPath, { env })

        child.on('message', content => {
            t.deepEqual(content, {
                name: 'test-app0',
                port: 8082,
                uuid: '01A0',
                version: '0.0.3',
                env: 'prod',
                api: {
                    credentials: {
                        id: 'base-api-id',
                        key: 'override-b-api-key'
                    },
                    retries: 3
                }
            })
            t.end()
        })
    }
)

test.cb('I can cast env values overrides', t => {
    const testPath = `${__dirname}/helpers/child.load_conf.js`

    const env = { PORT: 8080, NAME: 'app', ID: '12', USE_SSL: 'false', USE_MOCKS: 1 }
    const child = childProcess.fork(testPath, { env })

    child.on('message', content => {
        t.deepEqual(typeof content.port, 'number')
        t.deepEqual(typeof content.name, 'string')
        t.deepEqual(typeof content.id, 'number')
        t.deepEqual(typeof content.useSsl, 'boolean')
        t.deepEqual(typeof content.useMocks, 'boolean')
        t.end()
    })
})

test.cb('I can cast truthy boolean env values overrides', t => {
    const testPath = `${__dirname}/helpers/child.load_conf.js`

    const env = { USE_SSL: 'true', USE_MOCKS: 1 }
    const child = childProcess.fork(testPath, { env })

    child.on('message', content => {
        t.is(content.useSsl, true)
        t.is(content.useMocks, true)
        t.end()
    })
})

test.cb('I can cast falsy boolean env values overrides', t => {
    const testPath = `${__dirname}/helpers/child.load_conf.js`

    const env = { USE_SSL: 'false', USE_MOCKS: 0 }
    const child = childProcess.fork(testPath, { env })

    child.on('message', content => {
        t.is(content.useSsl, false)
        t.is(content.useMocks, false)
        t.end()
    })
})

test.cb('It throws an error when number cast on env value fails', t => {
    const testPath = `${__dirname}/helpers/child.catch_conf_errors.js`

    const env = { PORT: 'NotANumber' }
    const child = childProcess.fork(testPath, { env })

    child.on('message', content => {
        t.deepEqual(content.name, 'Error')
        t.deepEqual(content.message, 'Config error: expected a number got NotANumber')
        t.end()
    })
})

test.cb('It throws an error when boolean string cast on env value fails', t => {
    const testPath = `${__dirname}/helpers/child.catch_conf_errors.js`

    const env = { USE_SSL: 'NotABoolean' }
    const child = childProcess.fork(testPath, { env })

    child.on('message', content => {
        t.deepEqual(content.name, 'Error')
        t.deepEqual(content.message, 'Config error: expected a boolean got NotABoolean')
        t.end()
    })
})

test.cb('It throws an error when boolean number cast on env value fails', t => {
    const testPath = `${__dirname}/helpers/child.catch_conf_errors.js`

    const env = { USE_MOCKS: 42 }
    const child = childProcess.fork(testPath, { env })

    child.on('message', content => {
        t.deepEqual(content.name, 'Error')
        t.deepEqual(content.message, 'Config error: expected a boolean got 42')
        t.end()
    })
})

test.cb('It throws an error when env_mapping file is not yaml valid', t => {
    const testPath = `${__dirname}/helpers/child.catch_conf_errors.js`

    const env = { NODE_CONFIG_DIR: 'test/conf/malformatted_env_mapping_file', PORT: '8081' }
    const child = childProcess.fork(testPath, { env })

    child.on('message', content => {
        t.deepEqual(content.name, 'YAMLException')
        t.end()
    })
})

test.cb('It throws an error when base file is not yaml valid', t => {
    const testPath = `${__dirname}/helpers/child.catch_conf_errors.js`

    const env = { NODE_CONFIG_DIR: 'test/conf/malformatted_base_file' }
    const child = childProcess.fork(testPath, { env })

    child.on('message', content => {
        t.deepEqual(content.name, 'YAMLException')
        t.end()
    })
})

test.cb('It throws an error when env file is not yaml valid', t => {
    const testPath = `${__dirname}/helpers/child.catch_conf_errors.js`

    const env = { NODE_CONFIG_DIR: 'test/conf/malformatted_env_file', NODE_ENV: 'dev' }
    const child = childProcess.fork(testPath, { env })

    child.on('message', content => {
        t.deepEqual(content.name, 'YAMLException')
        t.end()
    })
})

test.cb('It throws an error when no base file', t => {
    const testPath = `${__dirname}/helpers/child.catch_conf_errors.js`

    const env = { NODE_CONFIG_DIR: 'test/conf/no_base_file', NODE_ENV: 'dev' }
    const child = childProcess.fork(testPath, { env })

    child.on('message', content => {
        t.deepEqual(content.name, 'Error')
        t.end()
    })
})

test('I can add a key', t => {
    t.deepEqual(config.get('test'), undefined)
    config.set('test', 'value')
    t.deepEqual(config.get('test'), 'value')
})

test('I can add a key with dot notation', t => {
    t.deepEqual(config.get('test.subtest'), undefined)
    config.set('test.subtest', 'value')
    t.deepEqual(config.get('test.subtest'), 'value')
})

test('I can add a key with dot and array notation', t => {
    t.deepEqual(config.get('test.subtestarray[0]'), undefined)
    config.set('test.subtestarray[0].subsubtest', 'value')
    t.deepEqual(config.get('test.subtestarray[0]'), { subsubtest: 'value' })
})

test('I can delete a key', t => {
    config.set('toDelete', 'value')
    t.deepEqual(config.get('toDelete'), 'value')
    config.set('toDelete')
    t.deepEqual(config.get('toDelete'), undefined)
})

test('I can delete a key with dot notation', t => {
    t.deepEqual(config.get('test'), { subtest: 'value', subtestarray: [{ subsubtest: 'value' }] })
    t.deepEqual(config.get('test.subtest'), 'value')
    config.set('test.subtest')
    t.deepEqual(config.get('test.subtest'), undefined)
    t.deepEqual(config.get('test'), { subtestarray: [{ subsubtest: 'value' }] })
})

test('I can delete a key with dot and array notation', t => {
    t.deepEqual(config.get('test'), { subtestarray: [{ subsubtest: 'value' }] })
    t.deepEqual(config.get('test.subtestarray'), [{ subsubtest: 'value' }])
    config.set('test.subtestarray')
    t.deepEqual(config.get('test.subtestarray'), undefined)
    t.deepEqual(config.get('test'), {})
})

test('I can update a key value', t => {
    config.set('test', 'value')
    config.set('test', 'newValue')
    t.deepEqual(config.get('test'), 'newValue')
})

test('I can get a key value', t => {
    t.deepEqual(config.get('test'), 'newValue')
})

test('I can get a key value with dot notation', t => {
    config.set('test.subtest', 'value')
    t.deepEqual(config.get('test.subtest'), 'value')
})

test('I can get a key value with dot and array notation', t => {
    config.set('test.subtestarray[0].subsubtest', 'value')
    t.deepEqual(config.get('test.subtestarray[0]'), { subsubtest: 'value' })
})

test('I can get an undefined key', t => {
    t.deepEqual(config.get('test3'), undefined)
})
