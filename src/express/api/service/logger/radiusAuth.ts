/**
 * 獲取 radius 授權紀錄
 * 
 * 參數:
 * limit? (number | 'ALL')      獲取數量 (default: 50)
 * before? (number)             只獲取 id 小於指定值的記錄
 * 
 * 過濾參數:
 * start_date? (string)          開始日期 (YYYY-MM-DD)
 * end_date? (string)            結束日期 (YYYY-MM-DD)
 */
export const path = '/api/service/logger/radiusAuth';
export const method = 'GET';
export const loginRequired = false;


import { isValidDateString } from '../../../../utils/formatDate.js';
import { LoadType } from '../../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import type { Database } from '../../../../lib/database/MySQL.js';
import type { AppConfig } from '../../../../@types/Config.types.js';
import type { ResultData } from '../../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: AppConfig, db: Database): Promise<ResultData> {
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
                id,
                username as mac_address,
                CASE 
                    WHEN reply = 'Access-Accept' THEN TRUE 
                    ELSE FALSE 
                END AS is_accepted,
                authdate
            FROM 
                radpostauth
            WHERE 
                1=1
        `;

        const params: any[] = [];


        // 如果有 before 參數，則只獲取 id 小於 before 的資料
        if (before) {
            query += ` AND id < ?`;
            params.push(before);
        }

        // ---------------------------------------------------------------------
        // 過濾參數處理：

        // 日期過濾 (YYYY-MM-DD)
        if (
            req.query.start_date && req.query.end_date &&
            isValidDateString(req.query.start_date as string) &&
            isValidDateString(req.query.end_date as string)
        ) {
            const startDate = req.query.start_date as string;
            const endDate = req.query.end_date as string;

            const start = `${startDate} 00:00:00`;
            const end = `${endDate} 23:59:59`;
            query += ` AND authdate BETWEEN ? AND ?`;
            params.push(start, end);
        }

        // ---------------------------------------------------------------------


        query += ` ORDER BY id DESC`;

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