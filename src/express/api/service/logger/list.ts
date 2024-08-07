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
                recordrad rrad ON r.id = rrad.record_id;
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
                    recordlogin rlogin ON r.id = rlogin.record_id;
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
                    recordrad rrad ON r.id = rrad.record_id;
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


    return {
        loadType: LoadType.SUCCEED,
        data: result as object[]
    };
}