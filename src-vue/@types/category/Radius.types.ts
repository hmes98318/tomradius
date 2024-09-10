/**
 * Radius 授權管理介面資料類型
 */
export type RadiusData = {
    id: number;
    mac_address: string;
    computer_name: string;
    employee_name: string;
    description: string;
    creator: string;
    created_at: string;
}

/**
 * Radius 授權管理介面添加資料類型
 */
export type RadiusAddData = {
    mac_address: string;
    computer_name: string;
    employee_name: string;
    description: string;    // Optional
}


/**
 * Radius 授權管理介面編輯資料類型
 */
export type RadiusEditData = {
    id: number;
    mac_address: string;
    computer_name: string;
    employee_name: string;
    description: string;    // Optional
}
