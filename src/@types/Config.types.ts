/**
 * Server config
 */
export type Config = {
    appConfig: AppConfig;
    sessionManager: SessionManagerConfig;
    ipBlocker: IPBlockerConfig
}

/**
 * api 設置及開關
 * @param {string} host - host
 * @param {number} port - port
 * @param {boolean} enableSite - 是否啟用網頁
 * @param {string} siteDir - 網頁掛載目錄
 * @param {boolean} enableHttps - 是否啟用 HTTPS
 * @param {string} siteDir - 網頁掛載目錄
 * @param {string} sslKeyPath - SSL key 路徑
 * @param {string} sslCertPath - SSL cert 路徑
 */
export type AppConfig = {
    host: string;
    port: number;
    enableSite: boolean;
    siteDir: string;
    enableHttps: boolean;
    sslKeyPath: string;
    sslCertPath: string;
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
