import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import { getValue, isEmpty, isNullsy, mergeWith, setValue, unsetValue } from './utils/index.js'

type YamlContent = Record<string, unknown> | undefined | null | string | number

type Internals = {
    cfg: Record<string, unknown>
    fillYamlExtension?(filePath: string): string
    read?(keyPath: string): YamlContent
    readEventually?(keyPath: string): unknown | null
    cast?(type: string, value: string | number): string | number | boolean
    getEnvOverrides?(mappings: unknown): unknown
    merge?(object: unknown, source: unknown): unknown
}

const internals: Internals = { cfg: {} }

/**
 * Get a value from the configuration. Supports dot notation (eg: "key.subkey.subsubkey")...
 *
 */
export const get = <T>(key: string): T | unknown => getValue(internals.cfg, key)

/**
 * Set a value in the configuration. Supports dot notation (eg: "key.subkey.subsubkey")
 * and array notation (eg: "key.subkey[0].subsubkey").
 *
 * If value is null or undefined, key is removed.
 */
export const set = <T>(key: string, value?: T): void => {
    if (isNullsy(value)) {
        unsetValue(internals.cfg, key)
    } else {
        setValue(internals.cfg, key, value)
    }
}

/**
 * Dumps the whole config object.
 */
export const dump = (): Record<string, unknown> => internals.cfg

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
                (filename) => !isEmpty(filename) && filename !== 'base'
            )
    }

    for (const confFile of confFiles) {
        const fileContent = internals.read?.(path.join(confPath, confFile))
        internals.cfg = (internals.merge?.(internals.cfg, fileContent) ?? internals.cfg) as Record<
            string,
            unknown
        >
    }

    // apply environment overrides (optional)
    const envOverridesConfig = internals.readEventually?.(path.join(confPath, 'env_mapping'))
    if (envOverridesConfig) {
        const envOverrides = internals.getEnvOverrides?.(envOverridesConfig)
        internals.cfg = (internals.merge?.(internals.cfg, envOverrides) ?? internals.cfg) as Record<
            string,
            unknown
        >
    }
}

/******* Internals **********/

/**
 * Read a yaml file and convert it to javascript object.
 */
internals.read = (keyPath: string): YamlContent => {
    const cleanedPath = internals.fillYamlExtension?.(keyPath) ?? keyPath
    try {
        const content = fs.readFileSync(cleanedPath, { encoding: 'utf8' })
        return yaml.load(content) as YamlContent
    } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e
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
        if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e
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
    if (isEmpty(extension)) {
        try {
            result = `${filePath}.yaml`
            fs.accessSync(result, fs.constants.R_OK)
        } catch {
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
    for (const [key, mapping] of Object.entries(mappings)) {
        const envVal = process.env[key]
        if (isNullsy(envVal)) continue

        let value: string | number | boolean
        let mappedKey: string

        if (isAdvancedConfig(mapping)) {
            mappedKey = mapping.key
            const castableVal = envVal as string | number
            value = internals.cast?.(mapping.type, castableVal) ?? castableVal
        } else {
            mappedKey = mapping
            value = envVal
        }

        setValue(overriden, mappedKey, value)
    }
    return overriden
}

/**
 * Return the source value if it is an array.
 * This function is used to customize the default output of `_.mergeWith()`.
 */

internals.merge = (object: unknown, source: unknown): unknown =>
    mergeWith(object, source, (_object: unknown, source: unknown) =>
        Array.isArray(source) ? source : undefined
    )

const isAdvancedConfig = (
    conf: { key: string; type: string } | string
): conf is { key: string; type: string } => {
    return typeof (conf as { key?: string }).key === 'string'
}

load()
