/**
 * Server config
 */
export type Config = {
    apiConfig: ApiConfig;
    sessionManager: SessionManagerConfig;
    ipBlocker: IPBlockerConfig
}

/**
 * api 設置及開關
 * @param {string} host - host (應設置為 localhost)
 * @param {number} port - port
 */
export type ApiConfig = {
    host: string;
    port: number;
}

/**
 * SessionManager config
 * @param {number} validTime - Session 的有效時間(ms)
 * @param {number} cleanupInterval - 定時清理器時間(ms)
 */
export type SessionManagerConfig = {
    validTime: number;
    cleanupInterval: number;
}

/**
 * IPBlocker config
 * @param {number} retryLimit - 重試次數
 * @param {number} unlockTimeoutDuration - 封鎖時間(ms)
 * @param {number} cleanupInterval - 定時清理器時間(ms)
 */
export type IPBlockerConfig = {
    retryLimit: number;
    unlockTimeoutDuration: number;
    cleanupInterval: number;
}




/**
 * Enviornment config
 */
export interface EnvConfig {
    dbConfig: DBConfig;
}

/**
 * Database config
 */
export interface DBConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}
