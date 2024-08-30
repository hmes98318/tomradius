/**
 * 獲取 radius log 紀錄
 * 
 * 參數:
 * type (number)                    獲取的 log 類型 (All: 1, 參數過濾: 2)
 * filter_start_time? (string)      type = 2 需帶入開始時間 (Unix Timestamp)
 * filter_end_time? (string)        type = 2 需帶入結束時間 (Unix Timestamp)
 */
export const path = '/api/service/logger/radiusLog';
export const method = 'POST';
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

    // 參數檢查
    if (![1, 2].includes(Number(req.body.type))) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }


    const filterType = Number(req.body.type);

    if (
        filterType === 2 &&
        (!checkValidUnixTimestamp(String(req.body.filter_start_time)) || !checkValidUnixTimestamp(String(req.body.filter_end_time)))
    ) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }


    const filterStartTime = String(req.body.filter_start_time);
    const filterEndTime = String(req.body.filter_end_time);

    try {
        // filterType === 1
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
            ORDER BY 
                r.created_at DESC;
        `;

        if (filterType === 2) {
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
                WHERE 
                    r.created_at BETWEEN FROM_UNIXTIME(${filterStartTime}) AND FROM_UNIXTIME(${filterEndTime})
                ORDER BY 
                    r.created_at DESC;
            `;
        }

        console.log(path, 'query', query);
        result = await db.query(query) as RowDataPacket[];
        console.log(path, 'result', result);
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