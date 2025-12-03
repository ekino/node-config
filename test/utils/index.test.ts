import { describe, expect, it } from 'vitest'
import {
    type Customizer,
    getValue,
    isEmpty,
    isNullsy,
    isObject,
    isPlainObject,
    mergeWith,
    setValue,
    unsetValue,
} from '../../src/utils/index.js'

describe('src > utils > index', () => {
    describe('isNullsy', () => {
        it('should return true for null or undefined', () => {
            expect(isNullsy(null)).toBe(true)
            expect(isNullsy(undefined)).toBe(true)
        })

        it('should return false for other values', () => {
            expect(isNullsy(0)).toBe(false)
            expect(isNullsy('')).toBe(false)
            expect(isNullsy(false)).toBe(false)
            expect(isNullsy({})).toBe(false)
        })
    })

    describe('isEmpty', () => {
        it('should return true for empty values', () => {
            expect(isEmpty(null)).toBe(true)
            expect(isEmpty(undefined)).toBe(true)
            expect(isEmpty('')).toBe(true)
            expect(isEmpty([])).toBe(true)
            expect(isEmpty({})).toBe(true)
        })

        it('should return false for non-empty values', () => {
            expect(isEmpty(0)).toBe(false)
            expect(isEmpty('text')).toBe(false)
            expect(isEmpty([1, 2, 3])).toBe(false)
            expect(isEmpty({ key: 'value' })).toBe(false)
        })
    })

    describe('isObject', () => {
        it('should return true for objects', () => {
            expect(isObject({})).toBe(true)
            expect(isObject([])).toBe(true)
            expect(isObject(new Date())).toBe(true)
        })

        it('should return false for non-objects', () => {
            expect(isObject(null)).toBe(false)
            expect(isObject(undefined)).toBe(false)
            expect(isObject(0)).toBe(false)
            expect(isObject('')).toBe(false)
        })
    })

    describe('isPlainObject', () => {
        it('should return true for plain objects', () => {
            expect(isPlainObject({})).toBe(true)
            expect(isPlainObject({ key: 'value' })).toBe(true)
        })

        it('should return false for non-plain objects', () => {
            expect(isPlainObject([])).toBe(false)
            expect(isPlainObject(new Date())).toBe(false)
            expect(isPlainObject(null)).toBe(false)
            expect(isPlainObject(undefined)).toBe(false)
        })
    })

    describe('getValue', () => {
        it('should retrieve deeply nested values', () => {
            const obj = {
                user: {
                    profile: {
                        name: 'John Doe',
                        age: 30,
                    },
                    preferences: {
                        theme: 'dark',
                        notifications: {
                            email: true,
                        },
                    },
                },
            }

            expect(getValue(obj, 'user.profile.name')).toBe('John Doe')
            expect(getValue(obj, 'user.preferences.theme')).toBe('dark')
            expect(getValue(obj, 'user.preferences.notifications.email')).toBe(true)
        })

        it('should handle arrays in the path', () => {
            const obj = {
                users: [
                    { name: 'Alice', age: 25 },
                    { name: 'Bob', age: 30 },
                ],
            }

            expect(getValue(obj, 'users[0].name')).toBe('Alice')
            expect(getValue(obj, 'users[1].age')).toBe(30)
        })

        it('should return undefined for non-existent paths', () => {
            const obj = {
                user: {
                    name: 'John Doe',
                },
            }

            expect(getValue(obj, 'user.profile.age')).toBeUndefined()
            expect(getValue(obj, 'invalid.path')).toBeUndefined()
        })

        it('should handle mixed string and number keys', () => {
            const obj = {
                data: [
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' },
                ],
            }

            expect(getValue(obj, 'data[0].id')).toBe(1)
            expect(getValue(obj, 'data[1].name')).toBe('Item 2')
        })

        it('should handle edge cases like null and undefined', () => {
            const obj = {
                user: null,
                profile: undefined,
            }

            expect(getValue(obj, 'user.name')).toBeUndefined()
            expect(getValue(obj, 'profile.age')).toBeUndefined()
        })
    })

    describe('setValue', () => {
        it('should set a deeply nested property in a complex configuration object', () => {
            const config: Record<string, unknown> = {}
            setValue(config, 'server.settings.port', 3000)
            expect(config).toEqual({
                server: {
                    settings: { port: 3000 },
                },
            })
        })

        it('should override an existing property with a new value', () => {
            const config = { user: { name: 'Alice', age: 30 } }
            setValue(config, 'user.age', 31)
            expect(config).toEqual({ user: { name: 'Alice', age: 31 } })
        })

        it('should create nested objects and arrays when setting a value with complex paths', () => {
            const config: Record<string, unknown> = {}
            setValue(config, 'services[0].name', 'auth')
            setValue(config, 'services[0].endpoints[1]', '/login')
            expect(config).toEqual({
                services: [
                    {
                        name: 'auth',
                        endpoints: [undefined, '/login'],
                    },
                ],
            })
        })

        it('should set a value using an array path', () => {
            const config: Record<string, unknown> = { settings: {} }
            setValue(config, ['settings', 'theme'], 'dark')
            expect(config).toEqual({ settings: { theme: 'dark' } })
        })

        it('should handle mixed dot and bracket notation in the path', () => {
            const obj: Record<string, unknown> = {}
            setValue(obj, `app['config'].version`, '1.0.0')
            expect(obj).toEqual({ app: { config: { version: '1.0.0' } } })
        })
    })

    describe('unsetValue', () => {
        it('should remove a deeply nested property from a configuration object', () => {
            const config = {
                server: {
                    host: 'api.myapp.com',
                    port: 443,
                    credentials: {
                        user: 'admin',
                        key: 'secret',
                    },
                    features: {
                        endpoints: [
                            { path: '/users', method: 'GET' },
                            { path: '/orders', method: 'POST' },
                        ],
                    },
                },
                database: {
                    host: 'db.myapp.com',
                    replicas: [
                        { host: 'db1.myapp.com', port: 5432 },
                        { host: 'db2.myapp.com', port: 5432 },
                    ],
                },
            }

            const result = unsetValue(config, 'server.credentials.key')
            expect(result).toBe(true)
            expect(config.server.credentials).toEqual({ user: 'admin' })
        })

        it('should remove an array element using bracket notation and leave a hole in the array', () => {
            const config = {
                server: {
                    features: {
                        endpoints: [
                            { path: '/users', method: 'GET' },
                            { path: '/orders', method: 'POST' },
                            { path: '/products', method: 'PUT' },
                        ],
                    },
                },
            }
            const result = unsetValue(config, 'server.features.endpoints[1]')
            expect(result).toBe(true)
            expect(config.server.features.endpoints.length).toBe(3)
            expect(config.server.features.endpoints[1]).toBeUndefined()
        })

        it('should return false when trying to unset a non-existent property in a complex configuration', () => {
            const config = {
                app: {
                    name: 'MyApp',
                    settings: {
                        theme: 'light',
                        features: { notifications: true, analytics: false },
                    },
                },
            }
            unsetValue(config, 'app.settings.version')
            expect(config.app.settings).toEqual({
                theme: 'light',
                features: { notifications: true, analytics: false },
            })
        })

        it('should handle mixed dot and bracket notation for nested deletion', () => {
            const config = {
                application: {
                    modules: [
                        { id: 1, config: { enabled: true, mode: 'auto' } },
                        { id: 2, config: { enabled: false, mode: 'manual' } },
                    ],
                },
            }
            const result = unsetValue(config, 'application.modules[1].config.mode')
            expect(result).toBe(true)
            expect(config.application.modules[1]?.config).toEqual({ enabled: false })
        })

        it('should gracefully return false if an intermediate path does not exist', () => {
            const config = {
                service: { name: 'PaymentService' },
            }
            unsetValue(config, 'service.config.settings.timeout')
            expect(config).toEqual({ service: { name: 'PaymentService' } })
        })

        it('should correctly unset multiple properties from a complex object', () => {
            const config = {
                ui: {
                    layout: {
                        header: { visible: true, title: 'Dashboard' },
                        footer: { visible: true },
                    },
                    menus: [
                        { id: 'file', items: ['new', 'open', 'save'] },
                        { id: 'edit', items: ['undo', 'redo'] },
                    ],
                },
                features: {
                    beta: {
                        enabled: true,
                        experiments: [
                            { id: 'exp1', active: true },
                            { id: 'exp2', active: false },
                        ],
                    },
                },
            }
            let result = unsetValue(config, 'ui.layout.header.title')
            expect(result).toBe(true)
            expect(config.ui.layout.header).toEqual({ visible: true })

            result = unsetValue(config, 'ui.menus[0].items[0]')
            expect(result).toBe(true)
            expect(config.ui.menus[0]?.items.length).toBe(3)
            expect(config.ui.menus[0]?.items[0]).toBeUndefined()

            result = unsetValue(config, 'features.beta.experiments[1].active')
            expect(result).toBe(true)
            expect(config.features.beta.experiments[1]).toEqual({ id: 'exp2' })
        })
    })

    describe('mergeWith', () => {
        it('should merge two complex configuration objects (deep merge)', () => {
            const baseConfig = {
                server: {
                    host: 'localhost',
                    port: 8080,
                    credentials: { user: 'admin', password: 'default' },
                    features: { logging: false, caching: true },
                },
                database: {
                    connection: { host: 'db.local', port: 5432 },
                    replicas: [
                        { host: 'db1.local', port: 5432 },
                        { host: 'db2.local', port: 5432 },
                    ],
                },
                misc: {
                    values: [1, 2, 3],
                },
            }

            const overrideConfig = {
                server: {
                    port: 9090,
                    credentials: { password: 'secret' },
                    features: { logging: true },
                },
                database: {
                    connection: { port: 5433 },
                    replicas: [{ host: 'db1.local', port: 5433 }],
                },
                misc: {
                    values: [4],
                },
            }

            const merged = mergeWith(baseConfig, overrideConfig)
            expect(merged).toEqual({
                server: {
                    host: 'localhost',
                    port: 9090,
                    credentials: { user: 'admin', password: 'secret' },
                    features: { logging: true, caching: true },
                },
                database: {
                    connection: { host: 'db.local', port: 5433 },
                    replicas: [
                        { host: 'db1.local', port: 5433 },
                        { host: 'db2.local', port: 5432 },
                    ],
                },
                misc: {
                    values: [4, 2, 3],
                },
            })
        })

        it('should merge arrays element-wise', () => {
            const configA = {
                endpoints: ['/api/users', '/api/products'],
                options: [{ timeout: 100 }, { timeout: 200 }],
            }
            const configB = {
                endpoints: ['/api/customers', '/api/inventory'],
                options: [{ timeout: 150 }, { retry: 3 }],
            }
            const merged = mergeWith(configA, configB)
            expect(merged).toEqual({
                endpoints: ['/api/customers', '/api/inventory'],
                options: [{ timeout: 150 }, { timeout: 200, retry: 3 }],
            })
        })

        it('should merge multiple source objects sequentially', () => {
            const config1 = { feature: { enabled: false, beta: false } }
            const config2 = { feature: { enabled: true } }
            const config3 = { feature: { beta: true } }
            const merged = mergeWith(config1, config2, config3)
            expect(merged).toEqual({ feature: { enabled: true, beta: true } })
        })

        it('should use a customizer to combine number values (e.g. add them)', () => {
            const customizer: Customizer = (objValue, srcValue) => {
                if (typeof objValue === 'number' && typeof srcValue === 'number') {
                    return objValue + srcValue
                }
                return undefined
            }
            const config1 = { threshold: 10, retries: 3, settings: { delay: 100 } }
            const config2 = { threshold: 5, retries: 2, settings: { delay: 50 } }
            const merged = mergeWith(config1, config2, customizer)
            expect(merged).toEqual({
                threshold: 15,
                retries: 5,
                settings: { delay: 150 },
            })
        })

        it('should handle real-world complex configuration merging across multiple sources', () => {
            const defaultConfig = {
                app: {
                    name: 'MyApp',
                    version: '1.0.0',
                    features: {
                        darkMode: false,
                        notifications: { email: true, sms: false },
                    },
                    endpoints: ['/home', '/about'],
                },
                logging: { level: 'info', transports: ['console'] },
                database: {
                    host: 'localhost',
                    port: 3306,
                    options: { poolSize: 10, reconnect: true },
                },
            }

            const envConfig = {
                app: {
                    version: '1.1.0',
                    features: {
                        darkMode: true,
                        notifications: { sms: true },
                    },
                    endpoints: ['/home', '/contact'],
                },
                logging: { level: 'debug' },
                database: { port: 3307, options: { poolSize: 20 } },
            }

            const productionOverrides = {
                app: {
                    name: 'MyApp Pro',
                    features: { notifications: { email: false } },
                },
                logging: { transports: ['console', 'file'] },
                database: { options: { reconnect: false } },
            }

            const merged = mergeWith(defaultConfig, envConfig, productionOverrides)
            expect(merged).toEqual({
                app: {
                    name: 'MyApp Pro',
                    version: '1.1.0',
                    features: { darkMode: true, notifications: { email: false, sms: true } },
                    endpoints: ['/home', '/contact'],
                },
                logging: { level: 'debug', transports: ['console', 'file'] },
                database: {
                    host: 'localhost',
                    port: 3307,
                    options: { poolSize: 20, reconnect: false },
                },
            })
        })

        it('should handle circular references without infinite recursion', () => {
            const obj1: Record<string, unknown> = { a: 1 }
            const obj2: Record<string, unknown> = { b: 2 }
            obj2['circular'] = obj2 // Create circular reference

            const result = mergeWith(obj1, obj2)
            expect(result).toHaveProperty('a', 1)
            expect(result).toHaveProperty('b', 2)
            expect(result).toHaveProperty('circular')
        })

        it('should merge when target is a primitive value', () => {
            const target = 42
            const source = { key: 'value' }
            const result = mergeWith(target, source) as Record<string, unknown>
            // When target is primitive, it gets wrapped and properties are added
            expect(result['key']).toBe('value')
        })

        it('should handle Arguments objects correctly', () => {
            function createArgs(..._args: unknown[]) {
                // biome-ignore lint/complexity/noArguments: Testing arguments object handling intentionally
                return arguments
            }
            const args = createArgs(1, 2, 3)
            const target = { data: {} }
            const source = { data: args }
            const result = mergeWith(target, source)
            expect(result).toHaveProperty('data')
            expect((result as Record<string, unknown>)['data']).toEqual({ 0: 1, 1: 2, 2: 3 })
        })

        it('should handle Buffer objects by cloning them', () => {
            if (typeof Buffer === 'undefined') {
                // Skip in environments without Buffer
                return
            }
            const buffer1 = Buffer.from('hello')
            const buffer2 = Buffer.from('world')
            const target = { data: buffer1 }
            const source = { data: buffer2 }
            const result = mergeWith(target, source) as { data: Buffer }
            expect(Buffer.isBuffer(result.data)).toBe(true)
            expect(result.data.toString()).toBe('world')
            // Verify it's a clone, not the same reference
            expect(result.data).not.toBe(buffer2)
        })

        it('should handle TypedArray objects correctly', () => {
            const target = { data: undefined }
            const source = { data: new Uint8Array([1, 2, 3, 4]) }
            const result = mergeWith(target, source) as { data: Uint8Array }
            expect(result.data instanceof Uint8Array).toBe(true)
            expect(Array.from(result.data)).toEqual([1, 2, 3, 4])
        })

        it('should merge arrays when target is a non-array object', () => {
            const target = { items: { 0: 'old', length: 1 } }
            const source = { items: ['new1', 'new2'] }
            const result = mergeWith(target, source)
            expect(result).toEqual({
                items: ['new1', 'new2'],
            })
        })

        it('should handle symbol keys during merge', () => {
            const sym1 = Symbol('test1')
            const sym2 = Symbol('test2')
            const target = { [sym1]: 'value1', regular: 'old' }
            const source = { [sym2]: 'value2', regular: 'new' }
            const result = mergeWith(target, source) as Record<string | symbol, unknown>
            expect(result[sym1]).toBe('value1')
            expect(result[sym2]).toBe('value2')
            expect(result['regular']).toBe('new')
        })

        it('should handle merging when source is not an object', () => {
            const target = { key: 'value' }
            const result = mergeWith(target, null)
            expect(result).toEqual({ key: 'value' })

            const result2 = mergeWith(target, undefined)
            expect(result2).toEqual({ key: 'value' })

            const result3 = mergeWith(target, 'string')
            expect(result3).toEqual({ key: 'value' })
        })

        it('should handle merging plain objects when target value is undefined', () => {
            const target = { config: undefined }
            const source = { config: { setting: 'value' } }
            const result = mergeWith(target, source)
            expect(result).toEqual({ config: { setting: 'value' } })
        })

        it('should use customizer return value when provided', () => {
            const customizer: Customizer = (_objValue, _srcValue, key) => {
                if (key === 'special') {
                    return 'customized'
                }
                return undefined
            }
            const target = { special: 'old', regular: 'old' }
            const source = { special: 'new', regular: 'new' }
            const result = mergeWith(target, source, customizer)
            expect(result).toEqual({
                special: 'customized',
                regular: 'new',
            })
        })

        it('should handle merging when no sources are provided', () => {
            const target = { key: 'value' }
            const result = mergeWith(target)
            expect(result).toEqual({ key: 'value' })
        })
    })

    describe('edge cases and internal functions', () => {
        it('should handle getValue with empty path', () => {
            const obj = { a: 1 }
            expect(getValue(obj, '')).toBeUndefined()
            // Empty array path returns the object itself through reduction
            const result = getValue(obj, [])
            expect(result).toBeDefined()
        })

        it('should handle getValue when path exists as direct property', () => {
            const obj = { 'user.name': 'direct' }
            expect(getValue(obj, 'user.name')).toBe('direct')
        })

        it('should handle setValue with nullsy intermediate keys', () => {
            const obj: Record<string, unknown> = {}
            setValue(obj, ['a', '', 'c'], 'value')
            // The empty string key should be skipped in the path
            expect(obj).toHaveProperty('a')
        })

        it('should handle unsetValue when path traversal encounters non-object', () => {
            const obj = {
                level1: {
                    level2: 'string-value',
                },
            }
            // Trying to traverse through a string should return false
            const result = unsetValue(obj, 'level1.level2.level3')
            expect(result).toBe(false)
        })

        it('should handle unsetValue with nullsy last key', () => {
            const obj = { a: { b: 'value' } }
            const result = unsetValue(obj, ['a', null as unknown as string])
            expect(result).toBe(false)
        })

        it('should handle unsetValue when object itself has direct property', () => {
            const obj = { 'a.b.c': 'value', other: 'data' }
            const result = unsetValue(obj, 'a.b.c')
            expect(result).toBe(true)
            expect(obj).toEqual({ other: 'data' })
        })

        it('should handle parsePath with various formats', () => {
            const obj = {
                'a.b': { c: 'value1' },
                a: {
                    b: { c: 'value2' },
                },
            }
            // When path exists as direct property, it should be used
            expect(getValue(obj, 'a.b')).toEqual({ c: 'value1' })
        })

        it('should handle getValue with array path format', () => {
            const obj = { a: { b: { c: 'value' } } }
            expect(getValue(obj, ['a', 'b', 'c'])).toBe('value')
        })

        it('should handle getValue with mixed string/number array path', () => {
            const obj = { items: [{ name: 'item1' }, { name: 'item2' }] }
            expect(getValue(obj, ['items', 0, 'name'])).toBe('item1')
        })

        it('should handle setValue creating arrays for numeric keys', () => {
            const obj: Record<string, unknown> = {}
            setValue(obj, 'list[0][1]', 'value')
            expect(obj).toHaveProperty('list')
            expect(Array.isArray((obj['list'] as unknown[])[0])).toBe(true)
        })

        it('should handle isEmpty with numbers and booleans', () => {
            expect(isEmpty(0)).toBe(false)
            expect(isEmpty(false)).toBe(false)
            expect(isEmpty(true)).toBe(false)
            expect(isEmpty(123)).toBe(false)
        })

        it('should handle mergeWith when target has Arguments object value', () => {
            function createArgs(..._args: unknown[]) {
                // biome-ignore lint/complexity/noArguments: Testing arguments object handling intentionally
                return arguments
            }
            const args = createArgs('a', 'b', 'c')
            const target = { original: args }
            const source = { original: { 0: 'x' }, new: 'value' }
            const result = mergeWith(target, source)
            expect(result).toHaveProperty('new', 'value')
            expect(result).toHaveProperty('original')
        })

        it('should handle mergeWith when srcValue is array but tgtValue is not an object', () => {
            const target = { data: 42 }
            const source = { data: [1, 2, 3] }
            const result = mergeWith(target, source)
            expect((result as Record<string, unknown>)['data']).toEqual([1, 2, 3])
        })

        it('should handle circular reference with primitive values in clone', () => {
            // Create a more complex circular reference that triggers clone with different types
            const innerObj: Record<string, unknown> = { value: 123 }
            const outerObj: Record<string, unknown> = { inner: innerObj }
            innerObj['back'] = outerObj

            const target = {}
            const result = mergeWith(target, outerObj)
            expect(result).toBeDefined()
            expect(result).toHaveProperty('inner')
        })

        it('should handle circular reference with Date objects', () => {
            // Date objects are not plain objects, so they test the clone fallback
            const date = new Date('2024-01-01')
            const obj: Record<string, unknown> = { date, ref: {} }
            obj['ref'] = obj

            const result = mergeWith({}, obj)
            expect(result).toHaveProperty('date')
            expect((result as Record<string, unknown>)['date']).toBe(date)
        })

        it('should clone primitive target value when handling circular reference', () => {
            // Create a scenario where target is a primitive wrapped value when circular ref is found
            const source: Record<string, unknown> = { a: 1 }
            source['circular'] = source

            // Merge into a number (primitive) which gets wrapped
            const result = mergeWith(42, source)
            expect(result).toBeDefined()
        })
    })
})
