/**
 * 操作類型
 */
export enum OPType {
    LOGIN = 1,          // 登入
    RAD_ADD = 11,       // 添加 radius 授權帳號
    RAD_EDIT = 12,      // 修改 radius 授權帳號
    RAD_DELETE = 13,    // 刪除 radius 授權帳號
}

/**
 * 異動欄位 (使用 string 中間逗點間隔)
 */
export enum ColumnsChange {
    MAC_ADDRESS = 'mac_address',
    COMPUTER_NAME = '電腦名稱',
    EMPLOYEE_NAME = '員工名稱',
    DESCRIPTION = '描述'
}


/**
 * Logger events
 */
export interface LoggerEvents {
    // 一般操作
    /**
     * Login event
     * @param {string} user - Ubuntu user name (max length 64)
     * @param {string} ip - IP address (max length 45)
     * @param {boolean} isSuccess - 此次操作紀錄是否成功
     */
    'normal-login': (user: string, ip: string, isSuccess: boolean) => void;

    // Radius 相關操作
    /**
     * Radius operation record event
     * @param {string} user - Ubuntu user name (max length 64)
     * @param {OPType} opType - 操作類型 (OPType.RAD_*)
     * @param {boolean} isSuccess - 此次操作紀錄是否成功
     * @param {string | 'NULL'} macAddress - MAC address 修改描述 (max length 255)
     * @param {string | 'NULL'} computerName - 電腦名稱修改描述 (max length 255)
     * @param {string | 'NULL'} employeeName - 員工名稱修改描述 (max length 255)
     * @param {string | 'NULL'} description - 描述修改描述 (max length 255)
     */
    'radcheck': (user: string, opType: OPType, isSuccess: boolean, macAddress?: string | 'NULL', computerName?: string | 'NULL', employeeName?: string | 'NULL', description?: string | 'NULL') => void;
}
