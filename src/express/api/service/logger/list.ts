/**
 * 獲取 log 紀錄
 * 
 * 參數:
 * type (number)        獲取的 log 類型 (All: 1, login: 2, radius: 3)
 */
export const path = '/api/service/logger/list';
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

    // 參數檢查 (GET 參數不做 type 檢查, 因為一定是 string)
    if (![1, 2, 3].includes(Number(req.query.type))) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }


    const type = Number(req.query.type);
    let result = [];

    try {
        // All
        let query = `
            SELECT 
                r.id AS record_id, 
                r.creator, 
                r.op_type, 
                r.success, 
                r.created_at,
                rlogin.ip,
                rrad.mac_address, 
                rrad.computer_name, 
                rrad.employee_name, 
                rrad.description
            FROM 
                record r
            LEFT JOIN 
                recordlogin rlogin ON r.id = rlogin.record_id
            LEFT JOIN 
                recordrad rrad ON r.id = rrad.record_id
            ORDER BY 
                r.created_at DESC;
            `;

        if (type === 2) {
            query = `
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
        }
        else if (type === 3) {
            query = `
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
                ORDER BY 
                    r.created_at DESC;
            `;
        }

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
        item.created_at = new Date(item.created_at as string).toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        return item;
    });


    return {
        loadType: LoadType.SUCCEED,
        data: result as object[]
    };
}