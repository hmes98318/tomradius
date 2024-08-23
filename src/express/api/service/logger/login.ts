/**
 * 獲取 log 紀錄
 * 
 * 參數:
 * 無參數
 */
export const path = '/api/service/logger/login';
export const method = 'GET';
export const loginRequired = true;


import { LoadType } from '../../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import type { Database } from '../../../../lib/database/MySQL.js';
import type { Logger } from '../../../../lib/logger/Logger.js';
import type { SessionManager } from '../../../../lib/session-manager/SessionManager.js';
import type { ApiConfig } from '../../../../@types/Config.types.js';
import type { ResultData } from '../../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager, logger: Logger): Promise<ResultData> {
    let result: object[] = [];

    try {
        const query = `
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
            ORDER BY 
                r.created_at DESC;
        `;

        result = await db.query(query) as RowDataPacket[];
    } catch (error) {
        console.log(path, error);
        return {
            loadType: LoadType.QUERY_FAILED,
            data: []
        };
    }


    /**
     * 資料庫 TIMESTAMP 獲取的時區為 UTC (+0:00) (2024-07-29T05:05:05.000Z)
     * 需轉換成 UTC+8 (2024-06-23 13:05:05)
     * 不在 DB 端處理時區轉換, server 端處理就好
     */
    result = result.map((item: any) => {
        item.created_at = new Date(item.created_at as string).toISOString().slice(0, 19).replace('T', ' ');
        return item;
    });


    return {
        loadType: LoadType.SUCCEED,
        data: result as object[]
    };
}