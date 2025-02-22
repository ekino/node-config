export type Path = string | string[] | (string | number)[]
export type Customizer<T = unknown, S = unknown> = (
    objValue: T,
    srcValue: S,
    key: string,
    object: Record<string, unknown>,
    source: Record<string, unknown>
) => unknown

export const isNumber = (n: unknown): n is number => Number.isFinite(n)

export const isNullsy = (val: unknown): val is undefined | null => val === undefined || val === null

export const isNotNullsy = <T>(val: unknown): val is T => val !== undefined && val !== null

export const isEmpty = (val: unknown): boolean => {
    if (val === null || val === undefined) return true
    if (typeof val === 'string' || Array.isArray(val)) return val.length === 0
    if (typeof val === 'object') return Object.keys(val).length === 0
    return false
}

export const isDefined = <T>(toTest: T | undefined | null): toTest is T => {
    return !!toTest
}

export const isString = (val: unknown): val is string => typeof val === 'string'

export const isFunction = (func: unknown): boolean => typeof func === 'function'

export const isObject = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === 'object'

export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    isObject(value) && Object.prototype.toString.call(value) === '[object Object]'

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

    if (typeof path === 'string' && Object.prototype.hasOwnProperty.call(obj, path)) {
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
                current[key] = {}
            }
            current = current[key] as Record<string | number, unknown>
        }
    }
    return obj
}

export const unsetValue = (obj: unknown, path?: Path): boolean => {
    if (obj == null || !path) return false

    if (typeof path === 'string' && Object.prototype.hasOwnProperty.call(obj, path)) {
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
        if (isNullsy(current) == null || typeof current !== 'object') {
            return false
        }
    }

    const lastKey = pathArray[pathArray.length - 1]
    if (!isNullsy(lastKey)) return delete current[lastKey]
    return false
}

export const mergeWith = <TObject, TSource>(
    object: TObject,
    source: TSource,
    customizer?: Customizer
): TObject & TSource => {
    if (!isPlainObject(object) || !isPlainObject(source)) {
        throw new TypeError('Both object and source must be plain objects.')
    }

    const result: Record<string, unknown> = { ...object }

    for (const key in source) {
        if (Object.hasOwn(source, key)) {
            const objValue = result[key]
            const srcValue = source[key]

            if (customizer) {
                const customizedValue = customizer(objValue, srcValue, key, result, source)
                if (!isNullsy(customizedValue)) {
                    result[key] = customizedValue
                    continue
                }
            }

            if (isPlainObject(objValue) && isPlainObject(srcValue)) {
                result[key] = mergeWith(objValue, srcValue, customizer)
            } else if (!isNullsy(srcValue)) {
                result[key] = srcValue
            }
        }
    }

    return result as TObject & TSource
}
