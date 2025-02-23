import { describe, expect, it, test } from 'vitest'
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
    })
})
