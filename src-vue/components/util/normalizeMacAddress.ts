/**
 * 轉換 MAC address 格式
 * @param {string} mac - MAC address (/^([0-9a-fA-F]{2}[:.-]?){5}[0-9a-fA-F]{2}$/)
 * @returns {string} - 格式化的 MAC address (/^[0-9a-fA-F]{12}$/)
 */
const normalizeMacAddress = (mac: string): string => {
    /**
     * 支援輸入格式
     * EC:63:D7:B1:0A:91
     * EC-63-D7-B1-0A-91
     * EC.63.D7.B1.0A.91
     * ec63-d7b1-0a91
     * ec63d7b10a91
     * ------------------------------
     * 輸出格式
     * ec63d7b10a91
     */
    return mac.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
};

/**
 * 反向轉換 MAC address 格式
 * @param {string} mac - 格式化的 MAC address (/^[0-9a-fA-F]{12}$/)
 * @returns {string} - 帶冒號分隔符並大寫的 MAC address (/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/)
 */
const formatMacAddress = (mac: string): string => {
    return mac.match(/.{1,2}/g)!.join(':').toUpperCase();
};

export { formatMacAddress, normalizeMacAddress };