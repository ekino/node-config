export type Path = string | string[] | (string | number)[]
export type Customizer = (
    objValue: unknown,
    srcValue: unknown,
    key: string | symbol,
    target: unknown,
    source: unknown,
    stack: Map<unknown, unknown>
) => unknown

export const isNullsy = (val: unknown): val is undefined | null => val === undefined || val === null

export const isEmpty = (val: unknown): boolean => {
    if (val === null || val === undefined) return true
    if (typeof val === 'string' || Array.isArray(val)) return val.length === 0
    if (typeof val === 'object') return Object.keys(val).length === 0
    return false
}

export const isObject = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === 'object'

export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    isObject(value) && Object.prototype.toString.call(value) === '[object Object]'

const isArguments = (value: unknown): value is Record<string, unknown> => {
    return Object.prototype.toString.call(value) === '[object Arguments]'
}

const isTypedArray = (value: unknown): boolean => {
    return ArrayBuffer.isView(value) && !(value instanceof DataView)
}

const getSymbols = (object: unknown): (string | symbol)[] => {
    return isObject(object) ? Object.getOwnPropertySymbols(object) : []
}

const clone = <T = unknown>(value: T): T => {
    if (Array.isArray(value)) return [...value] as T
    if (isPlainObject(value)) return { ...value } as T
    return value
}

const isPrimitive = (value: unknown): boolean => {
    return value === null || (typeof value !== 'object' && typeof value !== 'function')
}

const parsePath = (path: Path): (string | number)[] => {
    if (Array.isArray(path)) {
        return path
    }
    return (path.match(/([^[.\]]+)/g) || []).map((segment: string) =>
        segment.match(/^\d+$/) ? Number(segment) : segment.replace(/^['"]|['"]$/g, '')
    )
}

export const getValue = <T = unknown>(obj: unknown, path?: Path): T | undefined => {
    if (isNullsy(obj) || !path) return undefined

    if (typeof path === 'string' && Object.hasOwn(obj, path)) {
        return (obj as Record<string, unknown>)[path] as T
    }
    const pathArray: (string | number)[] = parsePath(path)

    return pathArray.reduce<unknown>((acc, key) => {
        if (isNullsy(acc) || typeof acc !== 'object') {
            return undefined
        }
        return (acc as Record<string, unknown>)[key]
    }, obj) as T | undefined
}

export const setValue = (obj: unknown, path: Path, value: unknown): unknown => {
    if (isNullsy(obj) || typeof obj !== 'object') return obj

    const pathArray: (string | number)[] = parsePath(path)
    let current = obj as Record<string | number, unknown>

    for (let i = 0; i < pathArray.length; i++) {
        const key = pathArray[i]
        if (isNullsy(key)) continue
        if (i === pathArray.length - 1) {
            current[key] = value
        } else {
            if (isNullsy(current[key]) || typeof current[key] !== 'object') {
                const nextKey = pathArray[i + 1]
                current[key] = typeof nextKey === 'number' ? [] : {}
            }
            current = current[key] as Record<string | number, unknown>
        }
    }
    return obj
}

export const unsetValue = (obj: unknown, path?: Path): boolean => {
    if (isNullsy(obj) || !path) return false

    if (typeof path === 'string' && Object.hasOwn(obj, path)) {
        return delete (obj as Record<string, unknown>)[path]
    }

    const pathArray: (string | number)[] = parsePath(path)
    let current = obj as Record<string, unknown>

    for (let i = 0; i < pathArray.length - 1; i++) {
        const key = pathArray[i]
        if (isNullsy(key) || !(key in current)) {
            return false
        }
        current = current[key] as Record<string, unknown>
        if (isNullsy(current) || typeof current !== 'object') {
            return false
        }
    }

    const lastKey = pathArray[pathArray.length - 1]
    if (!isNullsy(lastKey)) return delete current[lastKey]
    return false
}

export function mergeWith(object: unknown, ...otherArgs: unknown[]): unknown {
    if (!otherArgs.length) return object
    let customizer: Customizer | undefined
    if (typeof otherArgs[otherArgs.length - 1] === 'function') {
        customizer = otherArgs.pop() as Customizer
    }
    const sources = otherArgs

    let result = object
    for (const source of sources) {
        result = mergeWithDeep(result, source, customizer, new Map())
    }
    return result
}

const mergeWithDeep = (
    target: unknown,
    source: unknown,
    customizer: Customizer | undefined,
    stack: Map<unknown, unknown>
): unknown => {
    // If target is a primitive, wrap it so properties can be assigned.
    if (isPrimitive(target)) {
        target = Object(target)
    }
    if (isNullsy(source) || typeof source !== 'object') {
        return target
    }
    // Handle circular references by cloning the existing target.
    if (stack.has(source)) {
        return clone(stack.get(source))
    }
    stack.set(source, target)

    // For arrays, work on a shallow copy.
    if (Array.isArray(source)) {
        source = [...source]
    }

    // Merge both string and symbol keys.
    const sourceKeys: (string | symbol)[] = [
        ...Object.keys(source as object),
        ...getSymbols(source),
    ]

    for (const key of sourceKeys) {
        let srcValue = (source as Record<string | symbol, unknown>)[key]
        let tgtValue = isObject(target)
            ? (target as Record<string | symbol, unknown>)[key]
            : undefined

        if (isArguments(srcValue)) {
            srcValue = { ...srcValue }
        }
        if (isArguments(tgtValue)) {
            tgtValue = { ...tgtValue }
        }

        if (typeof Buffer !== 'undefined' && Buffer.isBuffer(srcValue)) {
            srcValue = structuredClone(srcValue)
        }

        if (Array.isArray(srcValue)) {
            if (isObject(tgtValue)) {
                tgtValue = Array.isArray(tgtValue) ? [...(tgtValue as unknown[])] : []
            } else {
                tgtValue = []
            }
        }

        let merged: unknown
        if (customizer) {
            merged = customizer(tgtValue, srcValue, key, target, source, stack)
        }
        if (merged === undefined) {
            if (Array.isArray(srcValue)) {
                merged = mergeWithDeep(tgtValue, srcValue, customizer, stack)
            } else if (isObject(tgtValue) && isObject(srcValue)) {
                merged = mergeWithDeep(tgtValue, srcValue, customizer, stack)
            } else if (tgtValue === undefined && isPlainObject(srcValue)) {
                merged = mergeWithDeep({}, srcValue, customizer, stack)
            } else if (tgtValue === undefined && isTypedArray(srcValue)) {
                merged = structuredClone(srcValue)
            } else if (tgtValue === undefined || srcValue !== undefined) {
                merged = srcValue
            }
        }
        if (merged !== undefined && isObject(target)) {
            ;(target as Record<string | symbol, unknown>)[key] = merged
        }
    }
    return target
}
