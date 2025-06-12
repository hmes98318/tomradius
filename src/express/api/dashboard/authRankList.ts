/**
 * 獲取 radius 當天驗證數排行
 * 
 * 參數:
 * count (number)        獲取數量 (預設 10 位)
 */
export const path = '/api/dashboard/authRankList';
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
    if (typeof (req.query.count) !== 'undefined' && !Number.isInteger(Number(req.query.count))) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }

    try {
        const count = Number(req.query.count ?? 10);

        const query = `
            SELECT 
                username AS device,
                COUNT(*) AS count,
                MAX(CASE WHEN reply = 'Access-Accept' THEN true ELSE false END) AS is_success
            FROM 
                radpostauth
            WHERE 
                DATE(authdate) = CURDATE()
            GROUP BY 
                username
            ORDER BY 
                count DESC
            LIMIT ?;
        `;
        result = await db.query(query, [count]) as RowDataPacket[];
    } catch (error) {
        console.log(path, error);
        return {
            loadType: LoadType.QUERY_FAILED,
            data: []
        };
    }


    result = result.map((item: any) => {
        item.is_success = item.is_success === 1 ? true : false;
        return item;
    });


    return {
        loadType: LoadType.SUCCEED,
        data: result
    };
}