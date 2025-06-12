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
 * Radius 裝置驗證紀錄資料類型
 */
export type AuthLoggerData = {
    id: number;
    mac_address: string;
    is_accepted: 0 | 1;
    authdate: string;
}

interface BaseLoggerData {
    record_id: number;
    creator: string;
    op_type: OPType;
    success: 0 | 1;
    created_at: string;
}


/**
 * 登入紀錄資料類型
 */
export type LoginLoggerData = BaseLoggerData & {
    op_type: OPType.LOGIN;
    ip: string;
}


/**
 * Radius 修改紀錄資料類型
 */
export type RadiusLoggerData = BaseLoggerData & {
    op_type: OPType.RAD_ADD | OPType.RAD_DELETE | OPType.RAD_EDIT;
    mac_address: string;
    computer_name: string;
    employee_name: string;
    description: string;
}
