// Type definitions for @ekino/config
// Project: https://github.com/ekino/node-config

export function get(key: string): any
export function set(key: string, value: any|null): void

export function dump(): object