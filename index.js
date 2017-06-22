'use strict'

const _ = require('lodash')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

const internals = {}

internals.cfg = {}

internals.confPath = process.env.NODE_CONFIG_DIR ? `${process.env.NODE_CONFIG_DIR}` : path.join(process.cwd(), 'conf')

internals.basePath = path.join(internals.confPath, 'base.yaml')
internals.envMappingPath = path.join(internals.confPath, 'env_mapping.yaml')
internals.overridesPath = process.env.NODE_ENV ? path.join(internals.confPath, `${process.env.NODE_ENV}.yaml`) : null

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
 * Read a yaml file and convert it to json.
 * WARNING : This use a sync function to read file
 * @param {string} path
 * @return {Object}
 */
internals.read = path => {
    const content = fs.readFileSync(path, { encoding: 'utf8' })
    let result = yaml.safeLoad(content)
    return result
}

internals.cast = (type, value) => {
    switch (type) {
        case 'number': {
            const result = Number(value)
            if (_.isNaN(result)) throw new Error(`Config error : expected a number got ${value}`)

            return result
        }
        case 'boolean':
            if (!_.includes(['true', 'false', '0', '1'], value)) throw new Error(`Config error : expected a boolean got ${value}`)

            return value === 'true' || value === '1'
        default:
            return value
    }
}

/**
 * Read env variables override file and set config from env vars
 * @return {Object}
 */
internals.readEnvOverrides = () => {
    const result = {}

    try {
        const content = internals.read(internals.envMappingPath)
        _.forOwn(content, (mapping, key) => {
            if (_.isUndefined(process.env[key])) return true

            let value = process.env[key]
            let mappedKey = mapping

            if (mapping.key) {
                mappedKey = mapping.key
                value = internals.cast(mapping.type, value)
            }
            _.set(result, mappedKey, value)
        })
    } catch (e) {
        if (!e || e.code !== 'ENOENT') throw e
    }

    return result
}

/**
 * Return the source value if it is an array
 * This function is used to customize the default output of _.mergeWith
 *
 * @param {*} objValue: the target field content
 * @param {*} srcValue: the new value
 * @returns {*}: return what we want as a value, or undefined to let the default behaviour kick in
 */
internals.customizer = (objValue, srcValue) => {
    return _.isArray(srcValue) ? srcValue : undefined
}

/**
 * Read base file, override it with env file and finally override it with env vars
 */
internals.load = () => {
    const base = internals.read(internals.basePath)
    let env = {}
    if (internals.overridesPath) {
        try {
            env = internals.read(internals.overridesPath)
        } catch (e) {
            if (!e || e.code !== 'ENOENT') throw e
        }
    }

    const envOverrides = internals.readEnvOverrides()

    internals.cfg = _.mergeWith({}, base, env, envOverrides, internals.customizer)
}

internals.load()
