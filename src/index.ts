import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import _ from 'lodash'

type Internals = {
    cfg: Record<string, unknown>
    fillYamlExtension?(filePath: string): string
    // eslint-disable-next-line @typescript-eslint/ban-types
    read?(keyPath: string): Record<string, unknown> | undefined | null | string | object | number
    readEventually?(keyPath: string): unknown | null
    cast?(type: string, value: string | number): string | number | boolean
    getEnvOverrides?(mappings: unknown): unknown
    merge?<TObject, TSource>(object: TObject, source: TSource): TObject & TSource
}

const internals: Internals = { cfg: {} }

/**
 * Get a value from the configuration. Supports dot notation (eg: "key.subkey.subsubkey")...
 *
 */
export const get = <T>(key: string): T | unknown => _.get(internals.cfg, key)

/**
 * Set a value in the configuration. Supports dot notation (eg: "key.subkey.subsubkey")
 * and array notation (eg: "key.subkey[0].subsubkey").
 *
 * If value is null or undefined, key is removed.
 */
export const set = <T>(key: string, value: T): void => {
    if (value == null) {
        _.unset(internals.cfg, key)
    } else {
        _.set(internals.cfg, key, value)
    }
}

/**
 * Dumps the whole config object.
 */
export const dump = (): unknown => internals.cfg

/**
 * Loads config:
 *
 * 1. load base.yaml
 * 2. if CONF_FILES is defined, try to load corresponding files
 * 3. load env_mapping.yaml if it exists and search for overrides
 */
export const load = (): void => {
    const confPath = process.env.CONF_DIR
        ? `${process.env.CONF_DIR}`
        : path.join(process.cwd(), 'conf')

    // load base config (required)
    const baseConfig = internals.read?.(path.join(confPath, 'base'))
    if (baseConfig && typeof baseConfig === 'object') {
        internals.cfg = { ...baseConfig }
    }

    // apply file overrides (optional)
    let confFiles: string[] = []
    if (process.env.CONF_FILES) {
        confFiles = process.env.CONF_FILES.split(',')
            .map((filename) => filename.trim())
            .filter(
                // remove garbage and prevent dupes
                (filename) => !_.isEmpty(filename) && filename !== 'base'
            )
    }

    for (const confFile of confFiles) {
        const fileContent = internals.read?.(path.join(confPath, confFile))
        internals.merge?.(internals.cfg, fileContent)
    }

    // apply environment overrides (optional)
    const envOverridesConfig = internals.readEventually?.(path.join(confPath, 'env_mapping'))
    if (envOverridesConfig !== null) {
        const envOverrides = internals.getEnvOverrides?.(envOverridesConfig)
        internals.merge?.(internals.cfg, envOverrides)
    }
}

/******* Internals **********/

/**
 * Read a yaml file and convert it to javascript object.
 *
 * WARNING: This use a sync function to read file
 *
 */
internals.read = (
    keyPath: string
    // eslint-disable-next-line @typescript-eslint/ban-types
): Record<string, unknown> | undefined | null | string | object | number => {
    const cleanedPath = internals.fillYamlExtension?.(keyPath) ?? keyPath
    try {
        const content = fs.readFileSync(cleanedPath, { encoding: 'utf8' })
        return yaml.load(content)
    } catch (e) {
        if (e.code !== 'ENOENT') throw e
        throw new Error(`Config error: Couldn't find or read file ${cleanedPath}.`)
    }
}

/**
 * Try to load a yaml file, if the file does not exist, return null.
 *
 * @see internals.read
 *
 */
internals.readEventually = (keyPath: string): unknown | null => {
    const cleanedPath = internals.fillYamlExtension?.(keyPath) ?? keyPath

    try {
        const content = fs.readFileSync(cleanedPath, { encoding: 'utf8' })
        return yaml.load(content)
    } catch (e) {
        if (e.code !== 'ENOENT') throw e
    }

    return null
}

/**
 * Fill yaml files extension if not present. Try yaml first then yml.
 */
internals.fillYamlExtension = (filePath: string): string => {
    const extension = path.extname(filePath)
    let result = filePath

    // Try with yaml extension first and if not yml
    if (_.isEmpty(extension)) {
        try {
            result = `${filePath}.yaml`
            fs.accessSync(result, fs.constants.R_OK)
        } catch (e) {
            result = `${filePath}.yml`
        }
    }

    return result
}

/**
 * Cast a value using given type.
 */
internals.cast = (type: string, value: string | number): string | number | boolean => {
    switch (type) {
        case 'number': {
            const result = Number(value)
            if (Number.isNaN(result))
                throw new Error(`Config error: expected a number got ${value}`)

            return result
        }
        case 'boolean':
            if (!['true', 'false', '0', '1', 0, 1].includes(value))
                throw new Error(`Config error: expected a boolean got ${value}`)

            return value === 'true' || value === '1' || value === 1
        default:
            return value
    }
}

/**
 * Read env variables override file and set config from env vars.
 */
internals.getEnvOverrides = (
    mappings: Record<string, { key: string; type: string } | string>
): unknown => {
    const overriden = {}

    _.forOwn(mappings, (mapping, key) => {
        const envVal = process.env[key]
        if (envVal === undefined) return true

        let value: string | number | boolean
        let mappedKey: string

        if (isAdvancedConfig(mapping)) {
            mappedKey = mapping.key
            value = internals.cast?.(mapping.type, envVal) ?? envVal
        } else {
            mappedKey = mapping
            value = envVal
        }

        _.set(overriden, mappedKey, value)
    })

    return overriden
}

/**
 * Return the source value if it is an array.
 * This function is used to customize the default output of `_.mergeWith()`.
 */

internals.merge = <TObject, TSource>(object: TObject, source: TSource): TObject & TSource =>
    _.mergeWith(object, source, (object, source) => (Array.isArray(source) ? source : undefined))

const isAdvancedConfig = (
    conf: { key: string; type: string } | string
): conf is { key: string; type: string } => {
    return (conf as { key: string; type: string }).key !== undefined
}

load()
