/**
 * 獲取 radius log 紀錄
 * 
 * 參數:
 * limit? (number | 'ALL')      獲取數量 (default: 50)
 * before? (number)             只獲取 id 小於指定值的記錄
 * 
 * 過濾參數:
 * op_type? (number | number[]) log 紀錄的操作類型，可多選
 * modified_by? (string)        修改者，字串模糊搜尋
 * mac_address? (string)        MAC 地址，字串模糊搜尋
 * computer_name? (string)      電腦名稱，字串模糊搜尋
 * employee_name? (string)      員工名稱，字串模糊搜尋
 * created_at_start? (string)   創建時間範圍起始 (Unix Timestamp)
 * created_at_end? (string)     創建時間範圍結束 (Unix Timestamp)
 */
export const path = '/api/service/logger/radiusLog';
export const method = 'GET';
export const loginRequired = true;


import { checkValidUnixTimestamp } from '../../../../utils/formatDate.js';
import { LoadType } from '../../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import type { Database } from '../../../../lib/database/MySQL.js';
import type { Logger } from '../../../../lib/logger/Logger.js';
import type { SessionManager } from '../../../../lib/session-manager/SessionManager.js';
import type { AppConfig } from '../../../../@types/Config.types.js';
import type { ResultData } from '../../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: AppConfig, db: Database, sessionManager: SessionManager, logger: Logger): Promise<ResultData> {
    let result: object[] = [];
    let isAll = false;

    if (String(req.query.limit).toUpperCase() === 'ALL') {
        isAll = true;
    }

    const limit = isAll ? null : Math.max(parseInt(req.query.limit as string) || 50, 1);
    const before = parseInt(req.query.before as string) || null;

    try {
        let query = `
            SELECT 
                r.id AS record_id, 
                r.creator, 
                r.op_type, 
                r.success, 
                r.created_at,
                rrad.mac_address, 
                rrad.computer_name, 
                rrad.employee_name, 
                rrad.description
            FROM 
                record r
            INNER JOIN 
                recordrad rrad ON r.id = rrad.record_id
            WHERE 1=1
        `;

        const params: any[] = [];

        // 如果有 before 參數，則只獲取 id 小於 before 的資料
        if (before) {
            query += ` AND r.id < ?`;
            params.push(before);
        }

        // ---------------------------------------------------------------------
        // 過濾參數處理：

        // 操作類型過濾
        if (req.query.op_type) {
            if (Array.isArray(req.query.op_type)) {
                // 檢查是否為有效數值
                const validOpTypes = req.query.op_type.filter((item) => {
                    return /^\d+$/.test(String(item));
                });

                if (validOpTypes.length > 0) {
                    const placeholders = validOpTypes.map(() => '?').join(',');
                    query += ` AND r.op_type IN (${placeholders})`;
                    params.push(...validOpTypes);
                }
            }
            else {
                const opTypeValue = String(req.query.op_type);
                // 檢查是否為有效數值
                if (/^\d+$/.test(opTypeValue)) {
                    query += ` AND r.op_type = ?`;
                    params.push(opTypeValue);
                }
            }
        }

        // 修改者過濾
        if (req.query.modified_by) {
            query += ` AND r.creator LIKE ?`;
            params.push(`%${req.query.modified_by}%`);
        }

        // MAC 地址過濾
        if (req.query.mac_address) {
            query += ` AND rrad.mac_address LIKE ?`;
            params.push(`%${req.query.mac_address}%`);
        }

        // 電腦名稱過濾
        if (req.query.computer_name) {
            query += ` AND rrad.computer_name LIKE ?`;
            params.push(`%${req.query.computer_name}%`);
        }

        // 員工名稱過濾
        if (req.query.employee_name) {
            query += ` AND rrad.employee_name LIKE ?`;
            params.push(`%${req.query.employee_name}%`);
        }

        // 創建時間範圍過濾 (兼容舊版和新版參數名)
        if (req.query.created_at_start && req.query.created_at_end) {
            const startTime = req.query.created_at_start as string;
            const endTime = req.query.created_at_end as string;

            if (checkValidUnixTimestamp(startTime) && checkValidUnixTimestamp(endTime)) {
                query += ` AND r.created_at BETWEEN FROM_UNIXTIME(?) AND FROM_UNIXTIME(?)`;
                params.push(startTime, endTime);
            }
        }

        // ---------------------------------------------------------------------


        query += ` ORDER BY r.created_at DESC`;

        if (!isAll) {
            query += ` LIMIT ?;`;
            params.push(limit);
        }
        else {
            query += ';';
        }

        result = await db.query(query, params) as RowDataPacket[];
    } catch (error) {
        console.log(path, error);
        return {
            loadType: LoadType.QUERY_FAILED,
            data: []
        };
    }

    return {
        loadType: LoadType.SUCCEED,
        data: result as object[]
    };
}