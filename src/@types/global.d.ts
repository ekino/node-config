declare namespace NodeJS {
    interface ProcessEnv {
        CONF_DIR?: string
        CONF_FILES?: string
        [key: string]: string | number | boolean | undefined
    }
}
