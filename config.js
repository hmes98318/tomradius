/**
 * 配置檔 (所有值須設置否則會出錯)
 * 
 * @type {import("./src/@types/Config.types.js").Config} - config
 * 
 * @param {object} appConfig - api config
 * @param {string} appConfig.host - api host
 * @param {number} appConfig.port - api port
 * @param {boolean} appConfig.enableSite - 是否啟用網頁
 * @param {string} appConfig.siteDir - 網頁掛載目錄
 * 
 * @param {object} SessionManager - SessionManager config
 * @param {number} SessionManager.validTime - Session 的有效時間(ms) (default: 10 minutes)
 * @param {number} SessionManager.cleanupInterval - 定時清理器時間(ms) (default: 5 minutes)
 * 
 * @param {object} IPBlocker - IPBlocker 用於登入錯誤次數過多鎖定來源 IP 一段時間
 * @param {number} IPBlocker.retryLimit - 重試次數 (default: 5)
 * @param {number} IPBlocker.unlockTimeoutDuration - 封鎖時間(ms) (default: 5 minutes)
 * @param {number} IPBlocker.cleanupInterval - 定時清理器時間(ms) (default: 5 minutes)
 */
const config = {
    appConfig: {
        host: '0.0.0.0',
        port: 4000,
        enableSite: true,
        siteDir: `${process.cwd()}/vue-dist`
    },
    sessionManager: {
        validTime: 10 * 60 * 1000,
        cleanupInterval: 5 * 60 * 1000
    },
    ipBlocker: {
        retryLimit: 5,
        unlockTimeoutDuration: 5 * 60 * 1000,
        cleanupInterval: 5 * 60 * 1000
    }
};

export { config };
