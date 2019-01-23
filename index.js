'use strict'

const _ = require('lodash')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

const internals = { cfg: {} }

/**
 * Get a value from the configuration. Supports dot notation (eg: "key.subkey.subsubkey")...
 *
 * @param {string} key - Key. Support dot notation.
 * @returns {*} value
 */
exports.get = key => _.get(internals.cfg, key)

/**
 * Set a value in the configuration. Supports dot notation (eg: "key.subkey.subsubkey")
 * and array notation (eg: "key.subkey[0].subsubkey").
 *
 * @param {string} key   - Key. Support dot notation.
 * @param {object} value - value. If null or undefined, key is removed.
 * @returns {void}
 */
exports.set = (key, value) => {
    if (_.isUndefined(value) || _.isNull(value)) {
        _.unset(internals.cfg, key)
    } else {
        _.set(internals.cfg, key, value)
    }
}

/**
 * Dumps the whole config object.
 *
 * @returns {object} The whole config object
 */
exports.dump = () => internals.cfg

/** ***** Internals **********/

/**
 * Read a yaml file and convert it to javascript object.
 *
 * WARNING: This use a sync function to read file
 *
 * @param {string} path
 * @return {Object}
 */
internals.read = path => {
    path = internals.fillYamlExtension(path)
    try {
        const content = fs.readFileSync(path, { encoding: 'utf8' })
        return yaml.safeLoad(content)
    } catch (e) {
        if (e.code !== 'ENOENT') throw e
        throw new Error(`Config error: Couldn't find or read file ${path}.`)
    }
}

/**
 * Try to load a yaml file, if the file does not exist, return null.
 *
 * @see internals.read
 *
 * @param {string} path
 * @return {Object|null}
 */
internals.readEventually = path => {
    path = internals.fillYamlExtension(path)
    try {
        const content = fs.readFileSync(path, { encoding: 'utf8' })
        return yaml.safeLoad(content)
    } catch (e) {
        if (e.code !== 'ENOENT') throw e
    }

    return null
}

/**
 * Fill yaml files extension if not present. Try yaml first than yml.
 * @param {string} filePath
 * @return {string} - path with extension
 */
internals.fillYamlExtension = filePath => {
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
 *
 * @param {string} type
 * @param {string} value
 * @returns {string|number|boolean} Casted value
 */
internals.cast = (type, value) => {
    switch (type) {
        case 'number': {
            const result = Number(value)
            if (_.isNaN(result)) throw new Error(`Config error: expected a number got ${value}`)

            return result
        }
        case 'boolean':
            if (!_.includes(['true', 'false', '0', '1'], value))
                throw new Error(`Config error: expected a boolean got ${value}`)

            return value === 'true' || value === '1'
        default:
            return value
    }
}

/**
 * Read env variables override file and set config from env vars.
 *
 * @param {Object} mappings
 * @return {Object}
 */
internals.getEnvOverrides = mappings => {
    const overriden = {}

    _.forOwn(mappings, (mapping, key) => {
        if (_.isUndefined(process.env[key])) return true

        let value = process.env[key]
        let mappedKey = mapping

        if (mapping.key) {
            mappedKey = mapping.key
            value = internals.cast(mapping.type, value)
        }
        _.set(overriden, mappedKey, value)
    })

    return overriden
}

/**
 * Return the source value if it is an array.
 * This function is used to customize the default output of `_.mergeWith()`.
 *
 * @param {*} objValue: the target field content
 * @param {*} srcValue: the new value
 * @returns {*} return what we want as a value, or undefined to let the default behaviour kick in
 */
internals.customizer = (objValue, srcValue) => (_.isArray(srcValue) ? srcValue : undefined)

internals.merge = _.partialRight(_.mergeWith, internals.customizer)

/**
 * Loads config:
 *
 * 1. load base.yaml
 * 2. if NODE_ENV is defined and a config file matching its value exists, load it
 * 3. if CONF_OVERRIDES is defined, try to load corresponding files
 * 4. load env_mapping.yaml if it exists and search for overrides
 */
internals.load = () => {
    const confPath = process.env.CONF_DIR
        ? `${process.env.CONF_DIR}`
        : path.join(process.cwd(), 'conf')

    // load base config (required)
    const baseConfig = internals.read(path.join(confPath, 'base'))
    internals.cfg = Object.assign({}, baseConfig)

    // apply file overrides (optional)
    let confFiles = []
    if (process.env.CONF_FILES) {
        confFiles = process.env.CONF_FILES.split(',')
            .map(filename => filename.trim())
            .filter(
                // remove garbage and prevent dupes
                filename => !_.isEmpty(filename) && filename !== 'base'
            )
    }

    confFiles.forEach(confFile => {
        const fileContent = internals.read(path.join(confPath, confFile))
        internals.merge(internals.cfg, fileContent)
    })

    // apply environment overrides (optional)
    const envOverridesConfig = internals.readEventually(path.join(confPath, 'env_mapping'))
    if (envOverridesConfig !== null) {
        const envOverrides = internals.getEnvOverrides(envOverridesConfig)
        internals.merge(internals.cfg, envOverrides)
    }
}

internals.load()
