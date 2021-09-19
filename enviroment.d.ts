declare global {
    namespace NodeJS {
        interface ProcessEnv {
            [prop: string]: unknown
            /* eslint-disable @typescript-eslint/naming-convention */
            CONF_FILES?: string
            CONF_DIR?: string
            /* eslint-enable @typescript-eslint/naming-convention */
        }
    }
}
export {}
