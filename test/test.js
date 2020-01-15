const config = require('../index')
const expect = require('expect')

const old_env = { ...process.env }

beforeEach(() => {
    process.env = { ...old_env }
})

afterEach(() => {
    process.env = old_env
})

test('I can override conf directory path with env variable CONF_DIR', () => {
    process.env = { ...process.env, CONF_DIR: 'test/conf/basic' }

    config.load()
    const content = config.dump()
    expect(content).toEqual({ name: 'test-app2', port: 8082, uuid: '01A2', version: '0.0.2' })
})

test('I can override config values with env values in the following order: base, env values', () => {
    process.env = { ...process.env, PORT: '8083', API_RETRIES: '6' }

    config.load()
    const content = config.dump()
    expect(content).toEqual({
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
})

test('I can override config values with config file defined through CONF_FILES', () => {
    process.env = { ...process.env, CONF_FILES: 'override_a' }
    config.load()
    const content = config.dump()
    expect(content).toEqual({
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
})

test('I can override config values with multiple config files defined through CONF_FILES', () => {
    process.env = { ...process.env, CONF_FILES: 'override_a,override_b' }
    config.load()
    const content = config.dump()
    expect(content).toEqual({
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
})

test('Environment variables mapped through env_mapping should take precedence over CONF_FILES', () => {
    process.env = {
        ...process.env,
        CONF_FILES: 'override_a,override_b',
        VERSION: '0.0.4',
        API_RETRIES: '6'
    }
    config.load()
    const content = config.dump()
    expect(content).toEqual({
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
})

test('I can cast env values overrides', () => {
    process.env = {
        ...process.env,
        PORT: 8080,
        NAME: 'app',
        ID: '12',
        USE_SSL: 'false',
        USE_MOCKS: 1
    }
    config.load()
    const content = config.dump()
    expect(typeof content.port).toEqual('number')
    expect(typeof content.name).toEqual('string')
    expect(typeof content.id).toEqual('number')
    expect(typeof content.useSsl).toEqual('boolean')
    expect(typeof content.useMocks).toEqual('boolean')
})

test('I can cast truthy boolean env values overrides', () => {
    process.env = { ...process.env, USE_SSL: 'true', USE_MOCKS: 1 }
    config.load()
    const content = config.dump()
    expect(content.useSsl).toBe(true)
    expect(content.useMocks).toBe(true)
})

test('I can cast falsy boolean env values overrides', () => {
    process.env = { ...process.env, USE_SSL: 'false', USE_MOCKS: 0 }
    config.load()
    const content = config.dump()
    expect(content.useSsl).toBe(false)
    expect(content.useMocks).toBe(false)
})

test("It reads yml file if file has no extension and .yaml doesn't exists", () => {
    process.env = { ...process.env, CONF_FILES: 'override_c' }
    config.load()
    const content = config.dump()
    expect(content).toEqual({
        name: 'test-app0',
        port: 8082,
        uuid: '01A0',
        version: '0.0.2',
        api: {
            credentials: {
                id: 'base-api-id',
                key: 'override-c'
            },
            retries: 3
        }
    })
})

test('It reads yaml file if file has no extension and yaml file exists (even if .yml file exists)', () => {
    process.env = { ...process.env, CONF_FILES: 'override_d' }
    config.load()
    const content = config.dump()
    expect(content).toEqual({
        name: 'test-app0',
        port: 8082,
        uuid: '01A0',
        version: '0.0.0',
        api: {
            credentials: {
                id: 'base-api-id',
                key: 'override-d-yaml'
            },
            retries: 3
        }
    })
})

test('It reads yml file if conf file has .yml extension even if .yaml file exists', () => {
    process.env = { ...process.env, CONF_FILES: 'override_b,override_d.yml' }
    config.load()
    const content = config.dump()
    expect(content).toEqual({
        name: 'test-app0',
        port: 8082,
        uuid: '01A0',
        version: '0.0.3',
        api: {
            credentials: {
                id: 'base-api-id',
                key: 'override-d-yml'
            },
            retries: 3
        }
    })
})

test('CONF_FILES should support space between configuration files names', () => {
    process.env = { ...process.env, CONF_FILES: 'override_b, override_d.yml' }
    config.load()
    const content = config.dump()
    expect(content).toEqual({
        name: 'test-app0',
        port: 8082,
        uuid: '01A0',
        version: '0.0.3',
        api: {
            credentials: {
                id: 'base-api-id',
                key: 'override-d-yml'
            },
            retries: 3
        }
    })
})

test('Not existing conf files should produce an error', () => {
    process.env = { ...process.env, CONF_FILES: 'override_empty' }

    expect(() => {
        config.load()
    }).toThrowError({
        instanceOf: Error,
        name: 'Error',
        message: `Config error: Couldn't find or read file ${process.cwd()}/conf/override_empty.yml.`
    })
})

test('It throws an error when number cast on env value fails', () => {
    process.env = { ...process.env, PORT: 'NotANumber' }

    expect(() => {
        config.load()
    }).toThrowError({
        instanceOf: Error,
        name: 'Error',
        message: 'Config error: expected a number got NotANumber'
    })
})

test('It throws an error when boolean string cast on env value fails', () => {
    process.env = { ...process.env, USE_SSL: 'NotABoolean' }
    expect(() => {
        config.load()
    }).toThrowError({
        instanceOf: Error,
        name: 'Error',
        message: 'Config error: expected a boolean got NotABoolean'
    })
})

test('It throws an error when boolean number cast on env value fails', () => {
    process.env = { ...process.env, USE_MOCKS: 42 }
    expect(() => {
        config.load()
    }).toThrowError({
        instanceOf: Error,
        name: 'Error',
        message: 'Config error: expected a boolean got 42'
    })
})

test('It throws an error when env_mapping file is not yaml valid', () => {
    process.env = {
        ...process.env,
        CONF_DIR: 'test/conf/malformatted_env_mapping_file',
        PORT: '8081'
    }
    expect(() => {
        config.load()
    }).toThrowError({
        instanceOf: Error,
        name: 'YAMLException',
        message: `can not read an implicit mapping pair; a colon is missed at line 4, column 16:
    {error format }
                   ^`
    })
})

test('It throws an error when base file is not yaml valid', () => {
    process.env = { ...process.env, CONF_DIR: 'test/conf/malformatted_base_file' }
    expect(() => {
        config.load()
    }).toThrowError({
        instanceOf: Error,
        name: 'YAMLException',
        message: `can not read an implicit mapping pair; a colon is missed at line 5, column 15:
    {error format}
                  ^`
    })
})

test('It throws an error when env file is not yaml valid', () => {
    process.env = { ...process.env, CONF_DIR: 'test/conf/malformatted_env_file', CONF_FILES: 'dev' }
    expect(() => {
        config.load()
    }).toThrowError({
        instanceOf: Error,
        name: 'YAMLException',
        message: `can not read an implicit mapping pair; a colon is missed at line 3, column 16:
    {error format }
                   ^`
    })
})

test('It throws an error when no base file', () => {
    process.env = { ...process.env, CONF_DIR: 'test/conf/no_base_file', NODE_ENV: 'dev' }
    expect(() => {
        config.load()
    }).toThrowError({
        instanceOf: Error,
        name: 'Error',
        message: "Config error: Couldn't find or read file test/conf/no_base_file/base.yml."
    })
})

test('I can add a key', () => {
    expect(config.get('test')).toEqual(undefined)
    config.set('test', 'value')
    expect(config.get('test')).toEqual('value')
})

test('I can add a key with dot notation', () => {
    expect(config.get('test.subtest')).toEqual(undefined)
    config.set('test.subtest', 'value')
    expect(config.get('test.subtest')).toEqual('value')
})

test('I can add a key with dot and array notation', () => {
    expect(config.get('test.subtestarray[0]')).toEqual(undefined)
    config.set('test.subtestarray[0].subsubtest', 'value')
    expect(config.get('test.subtestarray[0]')).toEqual({ subsubtest: 'value' })
})

test('I can delete a key', () => {
    config.set('toDelete', 'value')
    expect(config.get('toDelete')).toEqual('value')
    config.set('toDelete')
    expect(config.get('toDelete')).toEqual(undefined)
})

test('I can delete a key with dot notation', () => {
    expect(config.get('test')).toEqual({
        subtest: 'value',
        subtestarray: [{ subsubtest: 'value' }]
    })
    expect(config.get('test.subtest')).toEqual('value')
    config.set('test.subtest')
    expect(config.get('test.subtest')).toEqual(undefined)
    expect(config.get('test')).toEqual({ subtestarray: [{ subsubtest: 'value' }] })
})

test('I can delete a key with dot and array notation', () => {
    expect(config.get('test')).toEqual({ subtestarray: [{ subsubtest: 'value' }] })
    expect(config.get('test.subtestarray')).toEqual([{ subsubtest: 'value' }])
    config.set('test.subtestarray')
    expect(config.get('test.subtestarray')).toEqual(undefined)
    expect(config.get('test')).toEqual({})
})

test('I can update a key value', () => {
    config.set('test', 'value')
    config.set('test', 'newValue')
    expect(config.get('test')).toEqual('newValue')
})

test('I can get a key value', () => {
    expect(config.get('test')).toEqual('newValue')
})

test('I can get a key value with dot notation', () => {
    config.set('test.subtest', 'value')
    expect(config.get('test.subtest')).toEqual('value')
})

test('I can get a key value with dot and array notation', () => {
    config.set('test.subtestarray[0].subsubtest', 'value')
    expect(config.get('test.subtestarray[0]')).toEqual({ subsubtest: 'value' })
})

test('I can get an undefined key', () => {
    expect(config.get('test3')).toEqual(undefined)
})
