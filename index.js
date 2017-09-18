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
    const content = fs.readFileSync(path, { encoding: 'utf8' })
    let result = yaml.safeLoad(content)

    return result
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
    try {
        const content = internals.read(path)
        return content
    } catch (e) {
        if (!e || e.code !== 'ENOENT') throw e
        return null
    }
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
    const confPath = process.env.NODE_CONFIG_DIR
        ? `${process.env.NODE_CONFIG_DIR}`
        : path.join(process.cwd(), 'conf')

    // load base config (required)
    const baseConfig = internals.read(path.join(confPath, 'base.yaml'))
    internals.cfg = Object.assign({}, baseConfig)

    // apply file overrides (optional)
    let overrideFiles = []
    if (process.env.NODE_ENV) overrideFiles.push(process.env.NODE_ENV)
    if (process.env.CONF_OVERRIDES) {
        overrideFiles = overrideFiles.concat(
            process.env.CONF_OVERRIDES.split(',').filter(
                // remove garbage and prevent dupes
                override =>
                    !_.isEmpty(override) && override !== 'base' && !overrideFiles.includes(override)
            )
        )
    }

    overrideFiles.forEach(overrideFile => {
        const overridePath = path.join(confPath, `${overrideFile}.yaml`)
        const override = internals.readEventually(overridePath)

        if (override !== null) internals.merge(internals.cfg, override)
    })

    // apply environment overrides (optional)
    const envOverridesConfig = internals.readEventually(path.join(confPath, 'env_mapping.yaml'))
    if (envOverridesConfig !== null) {
        const envOverrides = internals.getEnvOverrides(envOverridesConfig)
        internals.merge(internals.cfg, envOverrides)
    }
}

internals.load()
