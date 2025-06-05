/**
 * 獲取登入 log 紀錄
 * 
 * 參數:
 * limit? (number | 'ALL')      獲取數量 (default: 50)
 * before? (number)             只獲取 id 小於指定值的記錄
 * 
 * 過濾參數:
 * ip? (string)                 IP地址，模糊搜尋
 * login_user? (string)         登入的使用者，模糊搜尋
 * created_at_start? (string)   登入時間範圍起始 (Unix Timestamp)
 * created_at_end? (string)     登入時間範圍結束 (Unix Timestamp)
 */
export const path = '/api/service/logger/login';
export const method = 'GET';
export const loginRequired = true;


import { LoadType } from '../../../../@types/Express.types.js';
import { checkValidUnixTimestamp } from '../../../../utils/formatDate.js';

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
                rlogin.ip
            FROM 
                record r
            INNER JOIN 
                recordlogin rlogin ON r.id = rlogin.record_id
            WHERE 
                1=1
        `;

        const params: any[] = [];

        // 如果有 before 參數，則只獲取 id 小於 before 的資料
        if (before) {
            query += ` AND r.id < ?`;
            params.push(before);
        }

        // ---------------------------------------------------------------------
        // 過濾參數處理：

        // IP 地址過濾
        if (req.query.ip) {
            query += ` AND rlogin.ip LIKE ?`;
            params.push(`%${req.query.ip}%`);
        }

        // 登入使用者過濾
        if (req.query.login_user) {
            query += ` AND r.creator LIKE ?`;
            params.push(`%${req.query.login_user}%`);
        }

        // 登入時間範圍過濾
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