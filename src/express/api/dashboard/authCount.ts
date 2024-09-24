/**
 * 獲取 radius 最近幾天授權成功失敗數
 * 
 * 參數:
 * days (number)        獲取天數 (預設 7 天)
 */
export const path = '/api/dashboard/authCount';
export const method = 'GET';
export const loginRequired = true;


import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import type { Database } from '../../../lib/database/MySQL.js';
import type { AppConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: AppConfig, db: Database): Promise<ResultData> {
    let result: object[] = [];

    // 參數檢查
    if (typeof (req.query.days) !== 'undefined' && !Number.isInteger(Number(req.query.days))) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }

    try {
        const days = Number(req.query.days ?? 7) - 1;

        const query = `
            SELECT 
                DATE(authdate) AS date, 
                SUM(CASE WHEN reply = 'Access-Accept' THEN 1 ELSE 0 END) AS success,
                SUM(CASE WHEN reply != 'Access-Accept' THEN 1 ELSE 0 END) AS fail
            FROM 
                radpostauth
            WHERE 
                authdate >= CURDATE() - INTERVAL ${days} DAY
            GROUP BY 
                DATE(authdate)
            ORDER BY 
                DATE(authdate) DESC;
        `;
        result = await db.query(query) as RowDataPacket[];
    } catch (error) {
        console.log(path, error);
        return {
            loadType: LoadType.QUERY_FAILED,
            data: []
        };
    }


    result = result.map((item: any) => {
        item.success = Number(item.success);
        item.fail = Number(item.fail);
        return item;
    });


    return {
        loadType: LoadType.SUCCEED,
        data: result
    };
}